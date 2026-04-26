from datetime import datetime
from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    clerk_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    saved_jobs: Mapped[list["SavedJob"]] = relationship("SavedJob", back_populates="user")  # noqa: F821
    hidden_jobs: Mapped[list["HiddenJob"]] = relationship("HiddenJob", back_populates="user")  # noqa: F821
