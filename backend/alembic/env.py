from logging.config import fileConfig
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import pool

from alembic import context

# Load .env before anything else so DATABASE_URL is available
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Wire up our models — imports populate Base.metadata as a side effect
from app.core.config import settings  # noqa: E402
from app.core.database import Base  # noqa: E402
from app.models import Company, Job, User, SavedJob, HiddenJob  # noqa: E402

_models = (Company, Job, User, SavedJob, HiddenJob)

target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = settings.database_url
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    from sqlalchemy import create_engine

    # Build engine directly to avoid configparser % interpolation issues
    connectable = create_engine(
        settings.database_url,
        poolclass=pool.NullPool,
        connect_args={"options": "-c statement_timeout=0"},
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
