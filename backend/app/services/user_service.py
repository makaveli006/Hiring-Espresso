from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.schemas.job import JobOut


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def get_or_create_user(self, clerk_id: str, email: str):
        return self.repo.get_or_create(clerk_id, email)

    def save_job(self, clerk_id: str, email: str, job_id: str):
        user = self.repo.get_or_create(clerk_id, email)
        return self.repo.save_job(user.id, job_id)

    def unsave_job(self, clerk_id: str, email: str, job_id: str):
        user = self.repo.get_or_create(clerk_id, email)
        self.repo.unsave_job(user.id, job_id)

    def hide_job(self, clerk_id: str, email: str, job_id: str):
        user = self.repo.get_or_create(clerk_id, email)
        return self.repo.hide_job(user.id, job_id)

    def get_saved_jobs(self, clerk_id: str, email: str) -> list[JobOut]:
        user = self.repo.get_or_create(clerk_id, email)
        jobs = self.repo.get_saved_jobs(user.id)
        return [JobOut.model_validate(j) for j in jobs]
