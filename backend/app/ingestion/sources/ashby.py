"""Ashby ATS job fetcher.

Uses the public Ashby posting API (no authentication required):
  POST https://api.ashbyhq.com/posting-api/job-board/{slug}
  Body: {"limit": 100}

Ashby is widely used by tech startups (e.g. Notion, Vercel, Pika, Cursor).

Configure company slugs in .env:
  ASHBY_COMPANY_SLUGS=notion,vercel,pika,cursor,linear
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


class AshbyFetcher(BaseJobFetcher):
    source_name = "ashby"

    def __init__(self, company_slugs: list[str]) -> None:
        self._slugs = [s.strip().lower() for s in company_slugs if s.strip()]

    def fetch(self) -> list[RawJob]:
        if not self._slugs:
            logger.info("AshbyFetcher: no company slugs configured, skipping")
            return []

        all_jobs: list[RawJob] = []
        for slug in self._slugs:
            try:
                jobs = self._fetch_slug(slug)
                logger.info("AshbyFetcher: %s → %d jobs", slug, len(jobs))
                all_jobs.extend(jobs)
            except Exception as exc:
                logger.warning("AshbyFetcher error for slug %r: %s", slug, exc)

        logger.info("AshbyFetcher total: %d jobs from %d slugs", len(all_jobs), len(self._slugs))
        return all_jobs

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
    def _fetch_slug(self, slug: str) -> list[RawJob]:
        resp = httpx.post(
            f"https://api.ashbyhq.com/posting-api/job-board/{slug}",
            json={"limit": 100},
            timeout=_TIMEOUT,
            headers={
                "User-Agent": "HiringEspresso/1.0 (job aggregator)",
                "Content-Type": "application/json",
            },
        )
        resp.raise_for_status()
        data = resp.json()
        jobs = data.get("jobs", [])
        return [self._to_raw_job(item, slug) for item in jobs]

    def _to_raw_job(self, item: dict, slug: str) -> RawJob:
        company_name = slug.replace("-", " ").replace("_", " ").title()

        # Location
        location_raw = item.get("locationName") or item.get("location", "")
        if isinstance(location_raw, dict):
            location_raw = location_raw.get("name", "")

        # Remote flag
        is_remote = item.get("isRemote", False)

        # Department / team tags
        tags: list[str] = []
        if dept := item.get("departmentName"):
            tags.append(dept)
        if team := item.get("teamName"):
            tags.append(team)

        # Posted date
        posted_at: datetime | None = None
        if published := item.get("publishedAt") or item.get("createdAt"):
            try:
                posted_at = datetime.fromisoformat(published.replace("Z", "+00:00"))
            except (ValueError, AttributeError):
                posted_at = datetime.now(tz=timezone.utc)

        # Job URL — prefer the hosted URL, fall back to constructing it
        job_url = (
            item.get("jobUrl")
            or item.get("applyUrl")
            or f"https://jobs.ashbyhq.com/{slug}/{item.get('id', '')}"
        )

        return RawJob(
            source=self.source_name,
            external_id=str(item.get("id", "")),
            title=item.get("title", ""),
            company_name=company_name,
            job_posting_url=job_url,
            description_html=item.get("descriptionHtml") or item.get("description", ""),
            location_raw=location_raw or None,
            remote_flag=is_remote if isinstance(is_remote, bool) else None,
            tags=tags,
            posted_at=posted_at,
            commitment_raw=item.get("employmentType"),
        )
