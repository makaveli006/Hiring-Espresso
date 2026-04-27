"""replace_full_indexes_with_partial_on_jobs

Revision ID: a3f8c1e9b042
Revises: 2186ad0aad53
Create Date: 2026-04-27

Replace full indexes with partial indexes (5-20x smaller):
- ix_jobs_last_validated_at: only active jobs (is_active = true)
- ix_jobs_external_id: only rows with a non-null external_id
"""
from typing import Sequence, Union

from alembic import op


revision: str = "a3f8c1e9b042"
down_revision: Union[str, Sequence[str], None] = "2186ad0aad53"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_jobs_last_validated_at", table_name="jobs")
    op.execute(
        "CREATE INDEX ix_jobs_last_validated_at ON jobs(last_validated_at) "
        "WHERE is_active = true"
    )

    op.drop_index("ix_jobs_external_id", table_name="jobs")
    op.execute(
        "CREATE INDEX ix_jobs_external_id ON jobs(external_id) "
        "WHERE external_id IS NOT NULL"
    )


def downgrade() -> None:
    op.drop_index("ix_jobs_last_validated_at", table_name="jobs")
    op.create_index("ix_jobs_last_validated_at", "jobs", ["last_validated_at"])

    op.drop_index("ix_jobs_external_id", table_name="jobs")
    op.create_index("ix_jobs_external_id", "jobs", ["external_id"])
