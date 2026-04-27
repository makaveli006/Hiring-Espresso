"""Lever ATS job fetcher.

Uses the public Lever postings API (no authentication required):
  GET https://api.lever.co/v0/postings/{company_slug}?mode=json

Configure company slugs in .env:
  LEVER_COMPANY_SLUGS=stripe,notion,figma,linear
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.ingestion.models.raw_job import RawJob
from app.ingestion.sources.base import BaseJobFetcher

logger = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(15.0)


class LeverFetcher(BaseJobFetcher):
    source_name = "lever"

    def __init__(self, company_slugs: list[str]) -> None:
        self._slugs = [s.strip().lower() for s in company_slugs if s.strip()]

    def fetch(self) -> list[RawJob]:
        if not self._slugs:
            logger.info("LeverFetcher: no company slugs configured, skipping")
            return []

        all_jobs: list[RawJob] = []
        for slug in self._slugs:
            try:
                jobs = self._fetch_slug(slug)
                logger.info("LeverFetcher: %s → %d jobs", slug, len(jobs))
                all_jobs.extend(jobs)
            except Exception as exc:
                logger.warning("LeverFetcher error for slug %r: %s", slug, exc)

        logger.info("LeverFetcher total: %d jobs from %d slugs", len(all_jobs), len(self._slugs))
        return all_jobs

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
    def _fetch_slug(self, slug: str) -> list[RawJob]:
        resp = httpx.get(
            f"https://api.lever.co/v0/postings/{slug}",
            params={"mode": "json"},
            timeout=_TIMEOUT,
            headers={"User-Agent": "HiringEspresso/1.0 (job aggregator)"},
        )
        resp.raise_for_status()
        return [self._to_raw_job(item, slug) for item in resp.json()]

    def _to_raw_job(self, item: dict, slug: str) -> RawJob:
        categories = item.get("categories", {})
        created_at_ms = item.get("createdAt", 0)
        posted_at = (
            datetime.fromtimestamp(created_at_ms / 1000, tz=timezone.utc)
            if created_at_ms
            else datetime.now(tz=timezone.utc)
        )

        # Build company name from slug: "my-company-name" → "My Company Name"
        company_name = slug.replace("-", " ").replace("_", " ").title()

        tags: list[str] = []
        if team := categories.get("team"):
            tags.append(team)
        if dept := categories.get("department"):
            tags.append(dept)

        return RawJob(
            source=self.source_name,
            external_id=item.get("id", ""),
            title=item.get("text", ""),
            company_name=company_name,
            job_posting_url=item.get("hostedUrl", ""),
            description_html=item.get("descriptionBody", "") or item.get("description", ""),
            location_raw=categories.get("location", ""),
            remote_flag=None,  # Lever doesn't expose this directly
            tags=tags,
            posted_at=posted_at,
            salary_raw=None,
            commitment_raw=categories.get("commitment", ""),
        )
