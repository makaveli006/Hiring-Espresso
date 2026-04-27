import uuid

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
