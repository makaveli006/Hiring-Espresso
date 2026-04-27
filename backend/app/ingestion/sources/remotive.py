from datetime import datetime, timezone

import httpx
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential, before_sleep_log
import logging

from app.ingestion.models.raw_job import RawJob
from app.ingestion.sources.base import BaseJobFetcher

_BASE = "https://remotive.com/api/remote-jobs"


class RemotiveFetcher(BaseJobFetcher):
    source_name = "remotive"

    def fetch(self) -> list[RawJob]:
        try:
            data = self._fetch_all()
        except Exception as exc:
            logger.error(f"[remotive] fetch failed after retries: {exc}")
            return []

        jobs = []
        for item in data.get("jobs", []):
            raw = self._to_raw_job(item)
            if raw:
                jobs.append(raw)

        logger.info(f"[remotive] fetched {len(jobs)} jobs")
        return jobs

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        before_sleep=before_sleep_log(logging.getLogger("tenacity"), logging.WARNING),
        reraise=True,
    )
    def _fetch_all(self) -> dict:
        resp = httpx.get(_BASE, timeout=20.0, headers={"User-Agent": "HiringEspresso/1.0"})
        resp.raise_for_status()
        return resp.json()

    def _to_raw_job(self, item: dict) -> RawJob | None:
        url = item.get("url", "")
        if not url:
            return None

        posted_at = None
        raw_date = item.get("publication_date")
        if raw_date:
            try:
                posted_at = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
            except ValueError:
                posted_at = datetime.now(timezone.utc)

        # Remotive job_type values: full_time, contract, part_time, freelance
        commitment_raw = item.get("job_type") or None

        return RawJob(
            source=self.source_name,
            external_id=str(item.get("id", url)),
            title=item.get("title", ""),
            company_name=item.get("company_name", ""),
            company_website=item.get("company_url") or None,
            company_logo_url=item.get("company_logo") or None,
            description_html=item.get("description", ""),
            job_posting_url=url,
            location_raw=item.get("candidate_required_location") or None,
            remote_flag=True,
            tags=item.get("tags", []),
            posted_at=posted_at,
            salary_raw=item.get("salary") or None,
            commitment_raw=commitment_raw,
        )
