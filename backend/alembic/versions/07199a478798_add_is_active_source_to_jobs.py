"""add_is_active_source_to_jobs

Revision ID: 07199a478798
Revises: 6c7230917c19
Create Date: 2026-04-27 11:48:48.364849

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '07199a478798'
down_revision: Union[str, Sequence[str], None] = '6c7230917c19'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('jobs', sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False))
    op.add_column('jobs', sa.Column('source', sa.String(length=100), nullable=True))
    op.create_index('ix_jobs_is_active', 'jobs', ['is_active'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_jobs_is_active', table_name='jobs')
    op.drop_column('jobs', 'source')
    op.drop_column('jobs', 'is_active')
