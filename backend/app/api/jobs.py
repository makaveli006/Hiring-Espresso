from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_optional_user
from app.schemas.job import JobFilters, JobListResponse, JobOut
from app.services.job_service import JobService
from app.services.user_service import UserService

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=JobListResponse)
def list_jobs(
    keyword: str | None = Query(None),
    location: str | None = Query(None),
    workplace_type: list[str] | None = Query(None),
    commitment: list[str] | None = Query(None),
    department: list[str] | None = Query(None),
    yoe_min: int | None = Query(None),
    yoe_max: int | None = Query(None),
    salary_min: int | None = Query(None),
    cursor: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _user: dict | None = Depends(get_optional_user),
):
    filters = JobFilters(
        keyword=keyword,
        location=location,
        workplace_type=workplace_type,
        commitment=commitment,
        department=department,
        yoe_min=yoe_min,
        yoe_max=yoe_max,
        salary_min=salary_min,
    )
    return JobService(db).list_jobs(filters, cursor, limit)


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = JobService(db).get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job


@router.post("/{job_id}/save", status_code=status.HTTP_201_CREATED)
def save_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    clerk_id = current_user["sub"]
    email = current_user.get("email", "")
    UserService(db).save_job(clerk_id, email, job_id)
    return {"message": "Job saved"}


@router.delete("/{job_id}/save", status_code=status.HTTP_204_NO_CONTENT)
def unsave_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    clerk_id = current_user["sub"]
    email = current_user.get("email", "")
    UserService(db).unsave_job(clerk_id, email, job_id)


@router.post("/{job_id}/hide", status_code=status.HTTP_201_CREATED)
def hide_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    clerk_id = current_user["sub"]
    email = current_user.get("email", "")
    UserService(db).hide_job(clerk_id, email, job_id)
    return {"message": "Job hidden"}
