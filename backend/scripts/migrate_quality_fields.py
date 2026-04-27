"""
Apply the quality-fields migration directly via Supabase session pooler.

Bypasses pgBouncer DDL timeout. Run once after generating the Alembic migration.

Usage:
    uv run python scripts/migrate_quality_fields.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from app.core.config import settings  # noqa: E402


def to_session_pooler_url(pooler_url: str) -> str:
    return pooler_url.replace(":5432/", ":6543/")


def run() -> None:
    import psycopg2

    pooler_url = settings.database_url
    session_url = to_session_pooler_url(pooler_url)

    print("Connecting via Supabase session pooler (port 6543)...")
    conn = psycopg2.connect(session_url, connect_timeout=15, sslmode="require")
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("SET statement_timeout = 0")
    print("Applying migration: add quality fields to jobs (revision 2186ad0aad53)...")

    # Check if already applied
    cur.execute("SELECT version_num FROM alembic_version")
    row = cur.fetchone()
    if row and row[0] == "2186ad0aad53":
        print("  ✓ Already at revision 2186ad0aad53 — nothing to do.")
        cur.close()
        conn.close()
        return

    cur.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS external_id VARCHAR(255)")
    print("  ✓ Added external_id")

    cur.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dedup_hash VARCHAR(64)")
    print("  ✓ Added dedup_hash")

    cur.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS quality_score INTEGER")
    print("  ✓ Added quality_score")

    cur.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_recruiter_post BOOLEAN NOT NULL DEFAULT false")
    print("  ✓ Added is_recruiter_post")

    cur.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS last_validated_at TIMESTAMP")
    print("  ✓ Added last_validated_at")

    cur.execute("CREATE INDEX IF NOT EXISTS ix_jobs_external_id ON jobs(external_id)")
    print("  ✓ Created index ix_jobs_external_id")

    cur.execute("CREATE INDEX IF NOT EXISTS ix_jobs_last_validated_at ON jobs(last_validated_at)")
    print("  ✓ Created index ix_jobs_last_validated_at")

    cur.execute("ALTER TABLE jobs ADD CONSTRAINT uq_jobs_dedup_hash UNIQUE (dedup_hash)")
    print("  ✓ Added unique constraint on dedup_hash")

    # Stamp the Alembic version
    cur.execute(
        "UPDATE alembic_version SET version_num = '2186ad0aad53' WHERE version_num = '07199a478798'"
    )
    if cur.rowcount == 0:
        print("  Warning: could not stamp alembic_version — check current version above.")
    else:
        print("  ✓ Alembic version stamped to 2186ad0aad53")

    cur.close()
    conn.close()
    print("\nMigration complete.")


if __name__ == "__main__":
    run()
