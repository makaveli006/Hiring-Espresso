from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.ingestion.models.raw_job import RawJob
from app.ingestion.normalizer import JobNormalizer
from app.ingestion.sources.arbeitnow import ArbeitnowFetcher
from app.ingestion.sources.ashby import AshbyFetcher
from app.ingestion.sources.base import BaseJobFetcher
from app.ingestion.sources.greenhouse import GreenhouseFetcher
from app.ingestion.sources.lever import LeverFetcher
from app.ingestion.sources.remotive import RemotiveFetcher
from app.ingestion.sources.search_fetcher import SearchDiscoveryFetcher
from app.ingestion.sources.search_providers import ALL_PROVIDERS
from app.repositories.ingestion_repository import IngestionRepository

_ALL_SOURCE_NAMES = {"arbeitnow", "remotive", "greenhouse", "lever", "ashby", "search_discovery", "all"}


def _compute_hash(job: RawJob) -> str:
    import hashlib
    date_str = job.posted_at.date().isoformat() if job.posted_at else "nodate"
    key = f"{job.company_name.lower().strip()}::{job.title.lower().strip()}::{date_str}"
    return hashlib.sha256(key.encode()).hexdigest()


class IngestionPipeline:
    def __init__(self, db: Session, source: str = "all", max_jobs: int | None = None):
        self.db = db
        self.repo = IngestionRepository(db)
        self.normalizer = JobNormalizer()
        self.fetchers: list[BaseJobFetcher] = self._build_fetchers(source, max_jobs)

    def _build_fetchers(self, source: str, max_jobs: int | None) -> list[BaseJobFetcher]:
        all_fetchers: list[BaseJobFetcher] = [
            ArbeitnowFetcher(max_jobs=max_jobs),
            RemotiveFetcher(),
            GreenhouseFetcher(settings.greenhouse_tokens_list),
            LeverFetcher(settings.lever_slugs_list),
            AshbyFetcher(settings.ashby_slugs_list),
            SearchDiscoveryFetcher(ALL_PROVIDERS),
        ]
        if source == "all":
            return all_fetchers
        return [f for f in all_fetchers if f.source_name == source]

    def run(self, dry_run: bool = False) -> dict:
        stats = {"fetched": 0, "skipped_dedup": 0, "skipped_recruiter": 0, "skipped_quality": 0, "inserted": 0, "deactivated": 0, "reactivated": 0, "errors": 0}

        # Step 1: Fetch raw jobs per source; deactivate/reactivate based on what's still live
        all_raw: list[RawJob] = []
        for fetcher in self.fetchers:
            try:
                jobs = fetcher.fetch()
                current_urls = {j.job_posting_url for j in jobs if j.job_posting_url}

                if not dry_run:
                    deactivated = self.repo.deactivate_removed(fetcher.source_name, current_urls)
                    reactivated = self.repo.reactivate_seen(fetcher.source_name, current_urls)
                    stats["deactivated"] += deactivated
                    stats["reactivated"] += reactivated
                    if deactivated:
                        logger.info(f"[{fetcher.source_name}] deactivated {deactivated} filled/removed jobs")
                    if reactivated:
                        logger.info(f"[{fetcher.source_name}] reactivated {reactivated} reposted jobs")

                all_raw.extend(jobs)
                stats["fetched"] += len(jobs)
            except Exception as exc:
                logger.error(f"[{fetcher.source_name}] unexpected fetch error: {exc}")
                stats["errors"] += 1

        logger.info(f"[pipeline] fetched {stats['fetched']} raw jobs total")

        # Step 2: Deduplicate against DB + within this run
        existing_urls = self.repo.get_existing_urls()
        seen_hashes: set[str] = set()
        to_normalize: list[RawJob] = []

        for raw in all_raw:
            if not raw.job_posting_url or raw.job_posting_url in existing_urls:
                stats["skipped_dedup"] += 1
                continue
            h = _compute_hash(raw)
            if h in seen_hashes:
                stats["skipped_dedup"] += 1
                continue
            seen_hashes.add(h)
            existing_urls.add(raw.job_posting_url)
            to_normalize.append(raw)

        logger.info(
            f"[pipeline] {len(to_normalize)} new jobs after dedup "
            f"({stats['skipped_dedup']} skipped)"
        )

        if not to_normalize:
            return stats

        # Step 3: Normalize in batches via OpenAI
        normalized = []
        batch_size = settings.ingestion_batch_size
        for i in range(0, len(to_normalize), batch_size):
            batch = to_normalize[i : i + batch_size]
            try:
                result = self.normalizer.normalize_batch(batch)
                normalized.extend(result)
                logger.info(
                    f"[pipeline] normalized batch {i // batch_size + 1} "
                    f"({len(result)} jobs)"
                )
            except Exception as exc:
                logger.error(f"[pipeline] normalization batch failed: {exc}")
                stats["errors"] += len(batch)

        # Step 4: Write to DB
        if dry_run:
            logger.info(f"[pipeline] dry-run — skipping DB writes ({len(normalized)} jobs)")
            stats["inserted"] = len(normalized)
            return stats

        for nj in normalized:
            try:
                if nj.is_recruiter_post:
                    stats["skipped_recruiter"] += 1
                    logger.debug(f"[pipeline] skipped recruiter post: '{nj.title}' at {nj.company_name}")
                    continue
                if nj.quality_score is not None and nj.quality_score < settings.job_min_quality_score:
                    stats["skipped_quality"] += 1
                    logger.debug(
                        f"[pipeline] skipped low-quality job (score={nj.quality_score}): "
                        f"'{nj.title}' at {nj.company_name}"
                    )
                    continue
                company = self.repo.upsert_company(
                    nj.company_name, nj.company_website, nj.company_logo_url
                )
                self.repo.insert_job(nj, company.id)
                stats["inserted"] += 1
            except Exception as exc:
                logger.error(
                    f"[pipeline] DB insert failed for '{nj.title}' "
                    f"({nj.job_posting_url}): {exc}"
                )
                stats["errors"] += 1

        logger.info(f"[pipeline] complete: {stats}")
        return stats
