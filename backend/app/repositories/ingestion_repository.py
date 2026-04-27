import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.ingestion.models.raw_job import NormalizedJob
from app.models.company import Company
from app.models.job import Job


class IngestionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_existing_urls(self) -> set[str]:
        rows = self.db.execute(select(Job.job_posting_url)).scalars().all()
        return {url for url in rows if url}

    def upsert_company(
        self,
        name: str,
        website: str | None,
        logo_url: str | None,
    ) -> Company:
        normalized = name.strip()
        existing = (
            self.db.execute(
                select(Company).where(Company.name.ilike(normalized))
            )
            .scalars()
            .first()
        )
        if existing:
            # Update logo/website if we now have them and didn't before
            if logo_url and not existing.logo_url:
                existing.logo_url = logo_url
            if website and not existing.website:
                existing.website = website
            self.db.commit()
            return existing

        company = Company(
            id=str(uuid.uuid4()),
            name=normalized,
            logo_url=logo_url,
            website=website,
        )
        self.db.add(company)
        self.db.commit()
        self.db.refresh(company)
        return company

    def insert_job(self, nj: NormalizedJob, company_id: str) -> Job:
        job = Job(
            id=str(uuid.uuid4()),
            title=nj.title,
            company_id=company_id,
            description=nj.description,
            posted_at=nj.posted_at,
            job_posting_url=nj.job_posting_url,
            is_active=True,
            source=nj.source,
            external_id=nj.external_id,
            dedup_hash=nj.dedup_hash,
            quality_score=nj.quality_score,
            is_recruiter_post=nj.is_recruiter_post,
            workplace_type=nj.workplace_type,
            commitment=nj.commitment,
            department=nj.department,
            skills=nj.skills or None,
            yoe_min=nj.yoe_min,
            yoe_max=nj.yoe_max,
            salary_min=nj.salary_min,
            salary_max=nj.salary_max,
            salary_currency=nj.salary_currency,
            location_city=nj.location_city,
            location_state=nj.location_state,
            location_country=nj.location_country,
            location_display=nj.location_display,
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def deactivate_removed(self, source: str, current_urls: set[str]) -> int:
        result = self.db.execute(
            update(Job)
            .where(
                Job.source == source,
                Job.is_active == True,  # noqa: E712
                Job.job_posting_url.notin_(current_urls),
            )
            .values(is_active=False)
        )
        self.db.commit()
        return result.rowcount

    def reactivate_seen(self, source: str, current_urls: set[str]) -> int:
        result = self.db.execute(
            update(Job)
            .where(
                Job.source == source,
                Job.is_active == False,  # noqa: E712
                Job.job_posting_url.in_(current_urls),
            )
            .values(is_active=True)
        )
        self.db.commit()
        return result.rowcount

    # --- Validation pipeline methods ---

    def get_jobs_needing_validation(
        self,
        sources: list[str],
        stale_days: int = 3,
    ) -> list[Job]:
        """Return active jobs from the given sources whose URL hasn't been checked recently."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=stale_days)
        rows = (
            self.db.execute(
                select(Job).where(
                    Job.is_active == True,  # noqa: E712
                    Job.source.in_(sources),
                    (Job.last_validated_at == None) | (Job.last_validated_at < cutoff),  # noqa: E711
                )
            )
            .scalars()
            .all()
        )
        return list(rows)

    def bulk_deactivate_job_ids(self, job_ids: list[str]) -> int:
        if not job_ids:
            return 0
        result = self.db.execute(
            update(Job)
            .where(Job.id.in_(job_ids))
            .values(is_active=False)
        )
        self.db.commit()
        return result.rowcount

    def bulk_update_validated_at(self, job_ids: list[str]) -> int:
        if not job_ids:
            return 0
        now = datetime.now(timezone.utc)
        result = self.db.execute(
            update(Job)
            .where(Job.id.in_(job_ids))
            .values(last_validated_at=now)
        )
        self.db.commit()
        return result.rowcount

    def deactivate_stale_jobs(self, max_age_days: int = 90, validation_grace_days: int = 7) -> int:
        """Deactivate jobs older than max_age_days that haven't been re-validated recently."""
        age_cutoff = datetime.now(timezone.utc) - timedelta(days=max_age_days)
        validation_cutoff = datetime.now(timezone.utc) - timedelta(days=validation_grace_days)
        result = self.db.execute(
            update(Job)
            .where(
                Job.is_active == True,  # noqa: E712
                Job.posted_at < age_cutoff,
                (Job.last_validated_at == None) | (Job.last_validated_at < validation_cutoff),  # noqa: E711
            )
            .values(is_active=False)
        )
        self.db.commit()
        return result.rowcount
