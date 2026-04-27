import time
from datetime import datetime, timezone

import httpx
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential, before_sleep_log
import logging

from app.core.config import settings
from app.ingestion.models.raw_job import RawJob
from app.ingestion.sources.base import BaseJobFetcher

_BOARDS_API = "https://boards-api.greenhouse.io/v1/boards"


class GreenhouseFetcher(BaseJobFetcher):
    source_name = "greenhouse"

    def __init__(self, tokens: list[str]):
        self.tokens = tokens

    def fetch(self) -> list[RawJob]:
        if not self.tokens:
            logger.info("[greenhouse] no board tokens configured, skipping")
            return []

        all_jobs: list[RawJob] = []
        for token in self.tokens:
            try:
                company_name, company_website = self._fetch_board_meta(token)
                data = self._fetch_jobs(token)
                for item in data.get("jobs", []):
                    raw = self._to_raw_job(item, token, company_name, company_website)
                    if raw:
                        all_jobs.append(raw)
                logger.info(f"[greenhouse:{token}] fetched {len(data.get('jobs', []))} jobs")
            except Exception as exc:
                logger.error(f"[greenhouse:{token}] failed: {exc}")

            time.sleep(settings.ingestion_rate_limit_delay)

        logger.info(f"[greenhouse] fetched {len(all_jobs)} total jobs")
        return all_jobs

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        before_sleep=before_sleep_log(logging.getLogger("tenacity"), logging.WARNING),
        reraise=True,
    )
    def _fetch_jobs(self, token: str) -> dict:
        resp = httpx.get(
            f"{_BOARDS_API}/{token}/jobs",
            params={"content": "true"},
            timeout=20.0,
            headers={"User-Agent": "HiringEspresso/1.0"},
        )
        resp.raise_for_status()
        return resp.json()

    def _fetch_board_meta(self, token: str) -> tuple[str, str | None]:
        try:
            resp = httpx.get(
                f"{_BOARDS_API}/{token}",
                timeout=10.0,
                headers={"User-Agent": "HiringEspresso/1.0"},
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("name", token.title()), data.get("website") or None
        except Exception:
            return token.replace("-", " ").title(), None

    def _to_raw_job(
        self,
        item: dict,
        token: str,
        company_name: str,
        company_website: str | None,
    ) -> RawJob | None:
        url = item.get("absolute_url", "")
        if not url:
            return None

        posted_at = None
        raw_date = item.get("updated_at")
        if raw_date:
            try:
                posted_at = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
            except ValueError:
                posted_at = datetime.now(timezone.utc)

        location = item.get("location", {})
        location_raw = location.get("name") if isinstance(location, dict) else str(location)

        return RawJob(
            source=self.source_name,
            external_id=f"{token}:{item.get('id', url)}",
            title=item.get("title", ""),
            company_name=company_name,
            company_website=company_website,
            company_logo_url=None,
            description_html=item.get("content", ""),
            job_posting_url=url,
            location_raw=location_raw or None,
            remote_flag=None,
            tags=[],
            posted_at=posted_at,
            salary_raw=None,
            commitment_raw=None,
        )
