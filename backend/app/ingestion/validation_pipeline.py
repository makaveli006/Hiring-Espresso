"""
ValidationPipeline — checks that ingested job URLs are still live, and deactivates
stale/dead listings.

Runs on a separate schedule from the ingestion pipeline (daily by default).
Currently targets `search_discovery` jobs, which are scraped once and never
automatically re-checked by the ATS deactivate_removed/reactivate_seen cycle.
"""

import asyncio
from urllib.parse import urlparse

import httpx
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.job import Job
from app.repositories.ingestion_repository import IngestionRepository


class ValidationPipeline:
    def __init__(self, db: Session):
        self.db = db
        self.repo = IngestionRepository(db)

    def run(self) -> dict:
        stats: dict[str, int] = {
            "checked": 0,
            "deactivated_dead": 0,
            "deactivated_stale": 0,
            "errors": 0,
        }

        # Phase 1: URL health check for search_discovery jobs
        jobs = self.repo.get_jobs_needing_validation(
            sources=["search_discovery"],
            stale_days=3,
        )
        stats["checked"] = len(jobs)

        if jobs:
            logger.info(f"[validation] checking {len(jobs)} job URLs")
            try:
                dead_ids, live_ids = asyncio.run(
                    self._check_urls(jobs, concurrency=settings.validation_concurrency)
                )
            except Exception as exc:
                logger.error(f"[validation] URL check failed: {exc}")
                stats["errors"] += len(jobs)
                dead_ids, live_ids = [], []

            if dead_ids:
                count = self.repo.bulk_deactivate_job_ids(dead_ids)
                stats["deactivated_dead"] = count
                logger.info(f"[validation] deactivated {count} dead URLs")

            if live_ids:
                self.repo.bulk_update_validated_at(live_ids)

        # Phase 2: Age-based auto-deactivation (applies to all sources)
        stale_count = self.repo.deactivate_stale_jobs(
            max_age_days=settings.job_max_age_days,
            validation_grace_days=7,
        )
        stats["deactivated_stale"] = stale_count
        if stale_count:
            logger.info(f"[validation] deactivated {stale_count} stale jobs (>{settings.job_max_age_days} days)")

        logger.info(f"[validation] complete: {stats}")
        return stats

    async def _check_urls(
        self,
        jobs: list[Job],
        concurrency: int = 20,
    ) -> tuple[list[str], list[str]]:
        dead_ids: list[str] = []
        live_ids: list[str] = []
        semaphore = asyncio.Semaphore(concurrency)

        async with httpx.AsyncClient(
            timeout=httpx.Timeout(10.0),
            follow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0 (compatible; HiringEspresso/1.0; +https://hiringespresso.com)"},
        ) as client:
            tasks = [self._check_one(client, semaphore, job) for job in jobs]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        for job, result in zip(jobs, results):
            if isinstance(result, Exception):
                # Network/timeout error — don't penalise the listing, count as live
                live_ids.append(job.id)
            elif result:
                live_ids.append(job.id)
            else:
                dead_ids.append(job.id)

        return dead_ids, live_ids

    async def _check_one(
        self,
        client: httpx.AsyncClient,
        semaphore: asyncio.Semaphore,
        job: Job,
    ) -> bool:
        async with semaphore:
            try:
                response = await client.head(job.job_posting_url, timeout=10.0)

                if response.status_code in (404, 410):
                    logger.debug(f"[validation] dead ({response.status_code}): {job.job_posting_url}")
                    return False

                # Follow-through check: if the final URL collapsed to a generic path,
                # the job was likely removed (e.g. redirects to /careers or homepage)
                final_url = str(response.url)
                if final_url != job.job_posting_url and _is_generic_url(final_url, job.job_posting_url):
                    logger.debug(f"[validation] dead (redirect to generic): {job.job_posting_url} -> {final_url}")
                    return False

                return True

            except (httpx.TimeoutException, httpx.ConnectError, httpx.ReadError):
                # Transient network issue — assume the listing is still live
                return True
            except Exception as exc:
                logger.debug(f"[validation] unexpected error for {job.job_posting_url}: {exc}")
                return True  # fail open — don't deactivate on unknown errors


def _is_generic_url(final_url: str, original_url: str) -> bool:
    """Return True if the redirect target looks like a homepage or careers root rather than a specific job page."""
    try:
        final = urlparse(final_url)
        original = urlparse(original_url)

        if final.netloc != original.netloc:
            # Redirected to a completely different domain (e.g. SSO login page) — treat as live
            return False

        path = final.path.rstrip("/").lower()
        # Collapsed to root or a known generic careers path
        return path in ("", "/careers", "/jobs", "/careers/jobs", "/en/careers", "/about/careers")
    except Exception:
        return False
