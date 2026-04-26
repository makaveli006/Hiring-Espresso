from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class HiddenJob(Base):
    __tablename__ = "hidden_jobs"
    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_hidden_job"),)

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    job_id: Mapped[str] = mapped_column(String, ForeignKey("jobs.id"), nullable=False)
    hidden_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="hidden_jobs")  # noqa: F821
    job: Mapped["Job"] = relationship("Job", back_populates="hidden_by")  # noqa: F821
