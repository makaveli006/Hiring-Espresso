import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.models.saved_job import SavedJob
from app.models.hidden_job import HiddenJob
from app.models.job import Job


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create(self, clerk_id: str, email: str) -> User:
        user = self.db.execute(
            select(User).where(User.clerk_id == clerk_id)
        ).scalars().first()
        if not user:
            user = User(id=str(uuid.uuid4()), clerk_id=clerk_id, email=email)
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
        return user

    def save_job(self, user_id: str, job_id: str) -> SavedJob:
        existing = self.db.execute(
            select(SavedJob).where(SavedJob.user_id == user_id, SavedJob.job_id == job_id)
        ).scalars().first()
        if existing:
            return existing
        saved = SavedJob(id=str(uuid.uuid4()), user_id=user_id, job_id=job_id)
        self.db.add(saved)
        self.db.commit()
        return saved

    def unsave_job(self, user_id: str, job_id: str) -> None:
        row = self.db.execute(
            select(SavedJob).where(SavedJob.user_id == user_id, SavedJob.job_id == job_id)
        ).scalars().first()
        if row:
            self.db.delete(row)
            self.db.commit()

    def hide_job(self, user_id: str, job_id: str) -> HiddenJob:
        existing = self.db.execute(
            select(HiddenJob).where(HiddenJob.user_id == user_id, HiddenJob.job_id == job_id)
        ).scalars().first()
        if existing:
            return existing
        hidden = HiddenJob(id=str(uuid.uuid4()), user_id=user_id, job_id=job_id)
        self.db.add(hidden)
        self.db.commit()
        return hidden

    def get_saved_jobs(self, user_id: str) -> list[Job]:
        rows = self.db.execute(
            select(SavedJob).where(SavedJob.user_id == user_id)
        ).scalars().all()
        job_ids = [r.job_id for r in rows]
        if not job_ids:
            return []
        return list(
            self.db.execute(select(Job).where(Job.id.in_(job_ids))).scalars().all()
        )
