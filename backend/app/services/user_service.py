from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.schemas.job import JobOut


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    @staticmethod
    def extract_email_from_claims(claims: dict) -> str | None:
        email = claims.get("email") or claims.get("email_address")
        if isinstance(email, str) and email.strip():
            return email.strip().lower()
        return None

    @staticmethod
    def extract_name_from_claims(claims: dict) -> str | None:
        name = claims.get("name")
        if isinstance(name, str) and name.strip():
            return name.strip()

        first = claims.get("given_name") or claims.get("first_name")
        last = claims.get("family_name") or claims.get("last_name")
        if isinstance(first, str):
            first = first.strip()
        if isinstance(last, str):
            last = last.strip()
        joined = " ".join([part for part in [first, last] if part])
        if joined:
            return joined

        username = claims.get("username")
        if isinstance(username, str) and username.strip():
            return username.strip()
        return None

    def get_or_create_user(self, clerk_id: str, email: str, name: str | None = None):
        return self.repo.get_or_sync(clerk_id=clerk_id, email=email, name=name, is_active=True)

    def get_or_sync_from_claims(self, claims: dict):
        clerk_id = claims["sub"]
        email = self.extract_email_from_claims(claims)
        name = self.extract_name_from_claims(claims)
        return self.repo.get_or_sync(clerk_id=clerk_id, email=email, name=name, is_active=True)

    def sync_from_clerk(self, clerk_id: str, email: str, name: str | None = None):
        return self.repo.upsert_from_clerk(clerk_id=clerk_id, email=email, name=name, is_active=True)

    def deactivate_from_clerk(self, clerk_id: str) -> bool:
        return self.repo.deactivate_by_clerk_id(clerk_id)

    def save_job(self, clerk_id: str, email: str | None, job_id: str, name: str | None = None):
        user = self.repo.get_or_sync(clerk_id=clerk_id, email=email, name=name, is_active=True)
        return self.repo.save_job(user.id, job_id)

    def unsave_job(self, clerk_id: str, email: str | None, job_id: str, name: str | None = None):
        user = self.repo.get_or_sync(clerk_id=clerk_id, email=email, name=name, is_active=True)
        self.repo.unsave_job(user.id, job_id)

    def hide_job(self, clerk_id: str, email: str | None, job_id: str, name: str | None = None):
        user = self.repo.get_or_sync(clerk_id=clerk_id, email=email, name=name, is_active=True)
        return self.repo.hide_job(user.id, job_id)

    def get_saved_jobs(self, clerk_id: str, email: str | None, name: str | None = None) -> list[JobOut]:
        user = self.repo.get_or_sync(clerk_id=clerk_id, email=email, name=name, is_active=True)
        jobs = self.repo.get_saved_jobs(user.id)
        return [JobOut.model_validate(j) for j in jobs]
