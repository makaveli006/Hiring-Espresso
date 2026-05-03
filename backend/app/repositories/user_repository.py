import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.models.saved_job import SavedJob
from app.models.hidden_job import HiddenJob
from app.models.job import Job


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def _commit_and_refresh(self, user: User) -> User:
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise
        self.db.refresh(user)
        return user

    def get_by_clerk_id(self, clerk_id: str) -> User | None:
        return self.db.execute(
            select(User).where(User.clerk_id == clerk_id)
        ).scalars().first()

    def get_or_create(self, clerk_id: str, email: str) -> User:
        return self.get_or_sync(clerk_id=clerk_id, email=email, is_active=True)

    def get_or_sync(
        self,
        clerk_id: str,
        email: str | None = None,
        name: str | None = None,
        is_active: bool = True,
    ) -> User:
        user = self.get_by_clerk_id(clerk_id)

        if not user:
            if not email:
                raise ValueError("Email is required to create a new user")
            user = User(
                id=str(uuid.uuid4()),
                clerk_id=clerk_id,
                email=email,
                name=name,
                is_active=is_active,
            )
            self.db.add(user)
            return self._commit_and_refresh(user)

        dirty = False
        if email and user.email != email:
            user.email = email
            dirty = True
        if name is not None and user.name != name:
            user.name = name
            dirty = True
        if user.is_active != is_active:
            user.is_active = is_active
            dirty = True

        if dirty:
            return self._commit_and_refresh(user)
        return user

    def upsert_from_clerk(
        self,
        clerk_id: str,
        email: str,
        name: str | None,
        is_active: bool = True,
    ) -> User:
        return self.get_or_sync(clerk_id=clerk_id, email=email, name=name, is_active=is_active)

    def deactivate_by_clerk_id(self, clerk_id: str) -> bool:
        user = self.get_by_clerk_id(clerk_id)
        if not user:
            return False
        if user.is_active:
            user.is_active = False
            self._commit_and_refresh(user)
        return True

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
