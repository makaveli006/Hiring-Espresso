from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.job import JobOut
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/saved-jobs", response_model=list[JobOut])
def get_saved_jobs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    clerk_id = current_user["sub"]
    email = current_user.get("email", "")
    return UserService(db).get_saved_jobs(clerk_id, email)
