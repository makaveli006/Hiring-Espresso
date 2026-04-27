from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class RawJob:
    source: str
    external_id: str
    title: str
    company_name: str
    job_posting_url: str
    description_html: str
    company_website: str | None = None
    company_logo_url: str | None = None
    location_raw: str | None = None
    remote_flag: bool | None = None
    tags: list[str] = field(default_factory=list)
    posted_at: datetime | None = None
    salary_raw: str | None = None
    commitment_raw: str | None = None


@dataclass
class NormalizedJob:
    title: str
    company_name: str
    job_posting_url: str
    description: str
    posted_at: datetime
    source: str
    external_id: str
    dedup_hash: str
    company_website: str | None = None
    company_logo_url: str | None = None
    workplace_type: str | None = None
    commitment: str | None = None
    department: str | None = None
    skills: list[str] = field(default_factory=list)
    yoe_min: int | None = None
    yoe_max: int | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    salary_currency: str | None = None
    location_city: str | None = None
    location_state: str | None = None
    location_country: str | None = None
    location_display: str | None = None
    quality_score: int | None = None
    is_recruiter_post: bool = False
