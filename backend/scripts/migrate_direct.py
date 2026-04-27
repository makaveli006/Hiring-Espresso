"""
Run pending Alembic migrations using a direct Supabase connection (bypasses pgBouncer).

Supabase's pooler (pgBouncer) enforces a short statement_timeout that kills DDL.
This script derives the direct DB URL from your DATABASE_URL and runs migrations
with autocommit + no timeout.

Usage:
    uv run python scripts/migrate_direct.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from app.core.config import settings


def to_session_pooler_url(pooler_url: str) -> str:
    """
    Switch from Supabase transaction pooler (port 5432) to session pooler (port 6543).
    Session mode supports SET statement_timeout and is suitable for DDL migrations.
    """
    # Simply replace port 5432 with 6543 in the URL
    return pooler_url.replace(":5432/", ":6543/")


def run():
    import psycopg2

    pooler_url = settings.database_url
    session_url = to_session_pooler_url(pooler_url)

    print("Connecting via Supabase session pooler (port 6543)...")

    conn = psycopg2.connect(session_url, connect_timeout=15, sslmode="require")
    conn.autocommit = True
    cur = conn.cursor()

    # Disable statement timeout for this session
    cur.execute("SET statement_timeout = 0")

    print("Applying migration: add is_active + source columns to jobs...")

    cur.execute("""
        ALTER TABLE jobs
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true
    """)
    print("  ✓ Added is_active column")

    cur.execute("""
        ALTER TABLE jobs
        ADD COLUMN IF NOT EXISTS source VARCHAR(100)
    """)
    print("  ✓ Added source column")

    cur.execute("""
        CREATE INDEX IF NOT EXISTS ix_jobs_is_active ON jobs(is_active)
    """)
    print("  ✓ Created index on is_active")

    # Stamp the alembic version so alembic knows this migration ran
    cur.execute("""
        UPDATE alembic_version SET version_num = '07199a478798'
        WHERE version_num = '6c7230917c19'
    """)
    if cur.rowcount == 0:
        # In case the alembic_version row is already at the new version (re-run)
        cur.execute("SELECT version_num FROM alembic_version")
        row = cur.fetchone()
        if row and row[0] == '07199a478798':
            print("  ✓ Alembic version already at 07199a478798")
        else:
            print(f"  Warning: unexpected alembic version: {row}")
    else:
        print("  ✓ Alembic version stamped to 07199a478798")

    cur.close()
    conn.close()
    print("\nMigration complete.")


if __name__ == "__main__":
    run()
