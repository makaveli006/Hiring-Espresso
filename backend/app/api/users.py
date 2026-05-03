from fastapi import APIRouter, Depends, HTTPException, status
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
    service = UserService(db)
    clerk_id = current_user["sub"]
    email = service.extract_email_from_claims(current_user)
    name = service.extract_name_from_claims(current_user)
    try:
        return service.get_saved_jobs(clerk_id, email, name=name)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from e
