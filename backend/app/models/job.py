from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        Index("ix_jobs_posted_at", "posted_at"),
        Index("ix_jobs_workplace_type", "workplace_type"),
        Index("ix_jobs_location_country", "location_country"),
        Index("ix_jobs_external_id", "external_id"),
        Index("ix_jobs_last_validated_at", "last_validated_at"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    company_id: Mapped[str] = mapped_column(String, ForeignKey("companies.id"), nullable=False)
    location_city: Mapped[str | None] = mapped_column(String(255))
    location_state: Mapped[str | None] = mapped_column(String(255))
    location_country: Mapped[str | None] = mapped_column(String(100))
    location_display: Mapped[str | None] = mapped_column(String(500))
    workplace_type: Mapped[str | None] = mapped_column(String(50))  # remote|hybrid|onsite
    commitment: Mapped[str | None] = mapped_column(String(50))  # full_time|part_time|contract
    department: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    skills: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    yoe_min: Mapped[int | None] = mapped_column(Integer)
    yoe_max: Mapped[int | None] = mapped_column(Integer)
    salary_min: Mapped[int | None] = mapped_column(Integer)
    salary_max: Mapped[int | None] = mapped_column(Integer)
    salary_currency: Mapped[str | None] = mapped_column(String(10))
    job_posting_url: Mapped[str | None] = mapped_column(String(1000))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true", index=True)
    source: Mapped[str | None] = mapped_column(String(100))
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    dedup_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True)
    quality_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_recruiter_post: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    last_validated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    posted_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    company: Mapped["Company"] = relationship("Company", back_populates="jobs")  # noqa: F821
    saved_by: Mapped[list["SavedJob"]] = relationship("SavedJob", back_populates="job")  # noqa: F821
    hidden_by: Mapped[list["HiddenJob"]] = relationship("HiddenJob", back_populates="job")  # noqa: F821
