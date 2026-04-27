import json
from datetime import datetime, timezone

from bs4 import BeautifulSoup
from loguru import logger
from openai import OpenAI

from app.core.config import settings
from app.ingestion.models.raw_job import NormalizedJob, RawJob

_COMMITMENT_MAP = {
    "full_time": "full_time",
    "full-time": "full_time",
    "fulltime": "full_time",
    "permanent": "full_time",
    "part_time": "part_time",
    "part-time": "part_time",
    "parttime": "part_time",
    "contract": "contract",
    "contractor": "contract",
    "freelance": "contract",
    "temporary": "contract",
    "internship": "contract",
}

_SYSTEM_PROMPT = """You are a job data extraction assistant.
Given a list of job objects, return a JSON array (same order, same length) where each element contains:
- department: one of [Engineering, Design, Product, Marketing, Sales, Operations, Finance, Legal, HR, Data, Security, DevRel, Other]
- skills: array of specific named technologies/tools (e.g. ["Python", "React", "PostgreSQL"]). Empty array if none found.
- yoe_min: integer minimum years of experience, or null
- yoe_max: integer maximum years of experience, or null
- salary_min: integer in local currency units, or null
- salary_max: integer in local currency units, or null
- salary_currency: ISO 4217 code (e.g. "USD", "EUR", "GBP"), or null
- workplace_type: one of ["remote", "hybrid", "onsite"], or null
- location_city: string or null
- location_state: string or null
- location_country: ISO 3166-1 alpha-2 code (e.g. "US", "GB", "IN"), or null
- location_display: short human-readable location string or null
- commitment: one of ["full_time", "part_time", "contract"], or null

Return ONLY valid JSON array, no markdown, no explanation."""


def _strip_html(html: str) -> str:
    text = BeautifulSoup(html, "html.parser").get_text(separator=" ")
    return " ".join(text.split())[:2000]


def _heuristic_workplace_type(job: RawJob) -> str | None:
    if job.remote_flag is True:
        return "remote"
    loc = (job.location_raw or "").lower()
    if "remote" in loc:
        return "remote"
    if "hybrid" in loc:
        return "hybrid"
    return None


def _heuristic_commitment(raw: str | None) -> str | None:
    if not raw:
        return None
    return _COMMITMENT_MAP.get(raw.lower().replace(" ", "_").replace("-", "_"))


def _compute_dedup_hash(job: RawJob) -> str:
    import hashlib
    date_str = job.posted_at.date().isoformat() if job.posted_at else "nodate"
    key = f"{job.company_name.lower().strip()}::{job.title.lower().strip()}::{date_str}"
    return hashlib.sha256(key.encode()).hexdigest()


class JobNormalizer:
    def __init__(self):
        self._client: OpenAI | None = None

    @property
    def client(self) -> OpenAI:
        if self._client is None:
            self._client = OpenAI(api_key=settings.openai_api_key)
        return self._client

    def normalize_batch(self, raw_jobs: list[RawJob]) -> list[NormalizedJob]:
        # Apply cheap heuristics first
        heuristic_results = [
            {
                "workplace_type": _heuristic_workplace_type(j),
                "commitment": _heuristic_commitment(j.commitment_raw),
            }
            for j in raw_jobs
        ]

        # Build payload for OpenAI
        payload = [
            {
                "i": idx,
                "title": j.title,
                "description": _strip_html(j.description_html),
                "location_raw": j.location_raw or "",
                "salary_raw": j.salary_raw or "",
                "tags": j.tags,
                "commitment_raw": j.commitment_raw or "",
                "remote_flag": j.remote_flag,
            }
            for idx, j in enumerate(raw_jobs)
        ]

        ai_results = self._call_openai(payload)

        normalized = []
        for idx, job in enumerate(raw_jobs):
            h = heuristic_results[idx]
            ai = ai_results[idx] if idx < len(ai_results) else {}

            posted_at = job.posted_at or datetime.now(timezone.utc)
            description = _strip_html(job.description_html)

            workplace_type = h["workplace_type"] or ai.get("workplace_type")
            commitment = h["commitment"] or ai.get("commitment")

            normalized.append(
                NormalizedJob(
                    title=job.title,
                    company_name=job.company_name,
                    company_website=job.company_website,
                    company_logo_url=job.company_logo_url,
                    job_posting_url=job.job_posting_url,
                    description=description,
                    posted_at=posted_at,
                    source=job.source,
                    external_id=job.external_id,
                    dedup_hash=_compute_dedup_hash(job),
                    workplace_type=workplace_type,
                    commitment=commitment,
                    department=ai.get("department"),
                    skills=ai.get("skills") or [],
                    yoe_min=_safe_int(ai.get("yoe_min")),
                    yoe_max=_safe_int(ai.get("yoe_max")),
                    salary_min=_safe_int(ai.get("salary_min")),
                    salary_max=_safe_int(ai.get("salary_max")),
                    salary_currency=ai.get("salary_currency"),
                    location_city=ai.get("location_city"),
                    location_state=ai.get("location_state"),
                    location_country=ai.get("location_country"),
                    location_display=ai.get("location_display"),
                )
            )

        return normalized

    def _call_openai(self, payload: list[dict]) -> list[dict]:
        if not settings.openai_api_key:
            logger.warning("[normalizer] OPENAI_API_KEY not set, skipping AI extraction")
            return [{} for _ in payload]

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                temperature=0,
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": json.dumps(payload)},
                ],
            )
            raw = response.choices[0].message.content or "[]"
            results = json.loads(raw)
            if not isinstance(results, list):
                raise ValueError("expected JSON array")
            return results
        except Exception as exc:
            logger.error(f"[normalizer] OpenAI call failed: {exc}")
            return [{} for _ in payload]


def _safe_int(val) -> int | None:
    if val is None:
        return None
    try:
        return int(val)
    except (TypeError, ValueError):
        return None
