from sqlalchemy.orm import Session

from app.repositories.job_repository import JobRepository
from app.schemas.job import JobFilters, JobListResponse, JobOut


class JobService:
    def __init__(self, db: Session):
        self.repo = JobRepository(db)

    def list_jobs(
        self,
        filters: JobFilters,
        cursor: str | None = None,
        limit: int = 20,
    ) -> JobListResponse:
        jobs, next_cursor = self.repo.get_jobs(filters, cursor, limit)
        return JobListResponse(
            items=[JobOut.model_validate(j) for j in jobs],
            next_cursor=next_cursor,
        )

    def get_job(self, job_id: str) -> JobOut | None:
        job = self.repo.get_by_id(job_id)
        if not job:
            return None
        return JobOut.model_validate(job)
