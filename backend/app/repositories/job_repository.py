from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, and_

from app.models.job import Job
from app.schemas.job import JobFilters


class JobRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_jobs(
        self,
        filters: JobFilters,
        cursor: str | None = None,
        limit: int = 20,
    ) -> tuple[list[Job], str | None]:
        stmt = select(Job).options(joinedload(Job.company))

        conditions = [Job.is_active == True]

        if filters.keyword:
            kw = f"%{filters.keyword}%"
            conditions.append(
                Job.title.ilike(kw) | Job.description.ilike(kw)
            )
        if filters.location:
            loc = f"%{filters.location}%"
            conditions.append(
                Job.location_display.ilike(loc) | Job.location_country.ilike(loc)
            )
        if filters.workplace_type:
            conditions.append(Job.workplace_type.in_(filters.workplace_type))
        if filters.commitment:
            conditions.append(Job.commitment.in_(filters.commitment))
        if filters.department:
            conditions.append(Job.department.in_(filters.department))
        if filters.yoe_min is not None:
            conditions.append(Job.yoe_min >= filters.yoe_min)
        if filters.yoe_max is not None:
            conditions.append(Job.yoe_max <= filters.yoe_max)
        if filters.salary_min is not None:
            conditions.append(Job.salary_min >= filters.salary_min)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        if cursor:
            stmt = stmt.where(Job.id < cursor)

        stmt = stmt.order_by(Job.posted_at.desc()).limit(limit + 1)

        rows = self.db.execute(stmt).scalars().all()

        next_cursor = None
        if len(rows) > limit:
            next_cursor = rows[limit - 1].id
            rows = rows[:limit]

        return list(rows), next_cursor

    def get_by_id(self, job_id: str) -> Job | None:
        return (
            self.db.execute(
                select(Job).options(joinedload(Job.company)).where(Job.id == job_id, Job.is_active == True)
            )
            .scalars()
            .first()
        )
