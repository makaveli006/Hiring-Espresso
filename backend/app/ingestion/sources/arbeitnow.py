import time
from datetime import datetime, timezone

import httpx
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential, before_sleep_log
import logging

from app.core.config import settings
from app.ingestion.models.raw_job import RawJob
from app.ingestion.sources.base import BaseJobFetcher

_BASE = "https://www.arbeitnow.com/api/job-board-api"


class ArbeitnowFetcher(BaseJobFetcher):
    source_name = "arbeitnow"

    def __init__(self, max_jobs: int | None = None):
        self.max_jobs = max_jobs

    def fetch(self) -> list[RawJob]:
        jobs: list[RawJob] = []
        page = 1
        while True:
            try:
                data = self._fetch_page(page)
            except Exception as exc:
                logger.error(f"[arbeitnow] page {page} failed after retries: {exc}")
                break

            items = data.get("data", [])
            if not items:
                break

            for item in items:
                raw = self._to_raw_job(item)
                if raw:
                    jobs.append(raw)
                if self.max_jobs and len(jobs) >= self.max_jobs:
                    break

            if self.max_jobs and len(jobs) >= self.max_jobs:
                break

            if not data.get("links", {}).get("next"):
                break

            page += 1
            time.sleep(settings.ingestion_rate_limit_delay)

        logger.info(f"[arbeitnow] fetched {len(jobs)} jobs")
        return jobs

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        before_sleep=before_sleep_log(logging.getLogger("tenacity"), logging.WARNING),
        reraise=True,
    )
    def _fetch_page(self, page: int) -> dict:
        resp = httpx.get(
            _BASE,
            params={"page": page},
            timeout=15.0,
            headers={"User-Agent": "HiringEspresso/1.0"},
        )
        resp.raise_for_status()
        return resp.json()

    def _to_raw_job(self, item: dict) -> RawJob | None:
        url = item.get("url", "")
        if not url:
            return None

        posted_at = None
        raw_date = item.get("created_at")
        if raw_date:
            try:
                # Arbeitnow returns created_at as a Unix timestamp integer
                posted_at = datetime.fromtimestamp(int(raw_date), tz=timezone.utc)
            except (ValueError, TypeError, OSError):
                posted_at = datetime.now(timezone.utc)

        return RawJob(
            source=self.source_name,
            external_id=str(item.get("slug", url)),
            title=item.get("title", ""),
            company_name=item.get("company_name", ""),
            company_website=item.get("company_url") or None,
            company_logo_url=None,
            description_html=item.get("description", ""),
            job_posting_url=url,
            location_raw=item.get("location") or None,
            remote_flag=bool(item.get("remote", False)),
            tags=item.get("tags", []),
            posted_at=posted_at,
            salary_raw=None,
            commitment_raw=None,
        )
