"""
Backfill Clerk users into the local users table.

Usage (from backend/):
    uv run python scripts/backfill_clerk_users.py
    uv run python scripts/backfill_clerk_users.py --dry-run
    uv run python scripts/backfill_clerk_users.py --page-size 100
"""

import argparse
import sys
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from loguru import logger

# Make sure the backend package is importable when run from scripts/
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from app.core.config import settings
from app.core.database import SessionLocal
from app.services.clerk_sync_service import (
    ClerkSyncService,
    extract_display_name,
    extract_primary_email,
)


def iter_clerk_users(client: httpx.Client, page_size: int) -> list[dict[str, Any]]:
    users: list[dict[str, Any]] = []
    offset = 0

    while True:
        response = client.get(
            "users",
            params={"limit": page_size, "offset": offset},
        )
        response.raise_for_status()
        payload = response.json()

        if isinstance(payload, list):
            chunk = payload
            total_count = None
        elif isinstance(payload, dict):
            chunk = payload.get("data", [])
            total_count = payload.get("total_count")
        else:
            raise ValueError("Unexpected Clerk API response format")

        if not isinstance(chunk, list) or not chunk:
            break

        users.extend([item for item in chunk if isinstance(item, dict)])
        offset += len(chunk)

        if isinstance(total_count, int) and offset >= total_count:
            break
        if len(chunk) < page_size:
            break

    return users


def main() -> None:
    parser = argparse.ArgumentParser(description="Backfill Clerk users into Supabase users table")
    parser.add_argument("--dry-run", action="store_true", help="Do not write to database")
    parser.add_argument(
        "--page-size",
        type=int,
        default=100,
        help="Clerk API page size (default: 100)",
    )
    args = parser.parse_args()

    if not settings.clerk_secret_key:
        raise RuntimeError("CLERK_SECRET_KEY is required")

    client = httpx.Client(
        base_url=settings.clerk_api_base_url,
        headers={
            "Authorization": f"Bearer {settings.clerk_secret_key}",
            "Content-Type": "application/json",
        },
        timeout=30,
    )

    db = SessionLocal()
    try:
        users = iter_clerk_users(client, page_size=args.page_size)
        sync = ClerkSyncService(db)

        created = 0
        updated = 0
        skipped = 0
        errors = 0

        for user in users:
            clerk_id = user.get("id")
            if not isinstance(clerk_id, str) or not clerk_id.strip():
                skipped += 1
                continue

            email = extract_primary_email(user)
            if not email:
                skipped += 1
                continue

            name = extract_display_name(user)
            exists = sync.repo.get_by_clerk_id(clerk_id) is not None
            if args.dry_run:
                if exists:
                    updated += 1
                else:
                    created += 1
                continue

            try:
                sync.sync_user(clerk_id=clerk_id, email=email, name=name)
                if exists:
                    updated += 1
                else:
                    created += 1
            except Exception:
                logger.exception(f"Failed to sync clerk user: {clerk_id}")
                errors += 1

        logger.info(
            f"Backfill complete (dry_run={args.dry_run}) created={created} "
            f"updated={updated} skipped={skipped} errors={errors}"
        )
    finally:
        client.close()
        db.close()


if __name__ == "__main__":
    main()
