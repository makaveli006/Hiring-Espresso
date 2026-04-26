from datetime import datetime
from pydantic import BaseModel

from app.schemas.company import CompanyOut


class JobOut(BaseModel):
    id: str
    title: str
    company: CompanyOut
    location_display: str | None = None
    location_city: str | None = None
    location_country: str | None = None
    workplace_type: str | None = None
    commitment: str | None = None
    department: str | None = None
    description: str | None = None
    skills: list[str] | None = None
    yoe_min: int | None = None
    yoe_max: int | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    salary_currency: str | None = None
    job_posting_url: str | None = None
    posted_at: datetime

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    items: list[JobOut]
    next_cursor: str | None = None
    total: int | None = None


class JobFilters(BaseModel):
    keyword: str | None = None
    location: str | None = None
    workplace_type: list[str] | None = None
    commitment: list[str] | None = None
    department: list[str] | None = None
    yoe_min: int | None = None
    yoe_max: int | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    skills: list[str] | None = None
