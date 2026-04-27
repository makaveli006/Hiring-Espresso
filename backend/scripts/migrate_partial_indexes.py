"""
Replace full indexes with partial indexes on the jobs table.

Partial indexes are 5-20x smaller and faster because they only index rows
that match the WHERE condition. Since nearly all queries filter on
is_active = true, we limit both indexes to active jobs only.

Usage:
    uv run python scripts/migrate_partial_indexes.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from app.core.config import settings  # noqa: E402

NEW_REVISION = "a3f8c1e9b042"
PREV_REVISION = "2186ad0aad53"


def to_session_pooler_url(pooler_url: str) -> str:
    return pooler_url.replace(":5432/", ":6543/")


def run() -> None:
    import psycopg2

    session_url = to_session_pooler_url(settings.database_url)
    print("Connecting via Supabase session pooler (port 6543)...")
    conn = psycopg2.connect(session_url, connect_timeout=15, sslmode="require")
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SET statement_timeout = 0")

    print(f"Applying migration: partial indexes on jobs (revision {NEW_REVISION})...")

    cur.execute("SELECT version_num FROM alembic_version")
    row = cur.fetchone()
    if row and row[0] == NEW_REVISION:
        print(f"  ✓ Already at revision {NEW_REVISION} — nothing to do.")
        cur.close()
        conn.close()
        return

    # Drop full indexes and replace with partial ones
    cur.execute("DROP INDEX IF EXISTS ix_jobs_last_validated_at")
    print("  ✓ Dropped ix_jobs_last_validated_at (full)")

    cur.execute(
        "CREATE INDEX IF NOT EXISTS ix_jobs_last_validated_at "
        "ON jobs(last_validated_at) WHERE is_active = true"
    )
    print("  ✓ Created ix_jobs_last_validated_at (partial: is_active = true)")

    cur.execute("DROP INDEX IF EXISTS ix_jobs_external_id")
    print("  ✓ Dropped ix_jobs_external_id (full)")

    cur.execute(
        "CREATE INDEX IF NOT EXISTS ix_jobs_external_id "
        "ON jobs(external_id) WHERE external_id IS NOT NULL"
    )
    print("  ✓ Created ix_jobs_external_id (partial: external_id IS NOT NULL)")

    cur.execute(
        f"UPDATE alembic_version SET version_num = '{NEW_REVISION}' "
        f"WHERE version_num = '{PREV_REVISION}'"
    )
    if cur.rowcount == 0:
        print("  Warning: could not stamp alembic_version — check current version.")
    else:
        print(f"  ✓ Alembic version stamped to {NEW_REVISION}")

    cur.close()
    conn.close()
    print("\nMigration complete.")


if __name__ == "__main__":
    run()
