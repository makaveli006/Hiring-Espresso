"""
Manual job ingestion CLI.

Usage (from the backend/ directory):
    uv run python scripts/ingest.py                         # all sources
    uv run python scripts/ingest.py --source arbeitnow      # single source
    uv run python scripts/ingest.py --source remotive
    uv run python scripts/ingest.py --source greenhouse
    uv run python scripts/ingest.py --dry-run               # no DB writes
    uv run python scripts/ingest.py --verbose               # debug logging
"""
import argparse
import sys
from pathlib import Path

# Make sure the backend package is importable when run from scripts/
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from loguru import logger
from app.core.database import SessionLocal
from app.ingestion.pipeline import IngestionPipeline


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest real job data into Hiring Espresso")
    parser.add_argument(
        "--source",
        choices=["arbeitnow", "remotive", "greenhouse", "all"],
        default="all",
        help="Which data source to run (default: all)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Fetch and normalize but skip writing to the database",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Max jobs to fetch per source (useful for testing)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug-level logging",
    )
    args = parser.parse_args()

    if args.verbose:
        logger.remove()
        logger.add(sys.stderr, level="DEBUG")
    else:
        logger.remove()
        logger.add(sys.stderr, level="INFO")

    logger.info(f"Starting ingestion: source={args.source} dry_run={args.dry_run}")

    db = SessionLocal()
    try:
        pipeline = IngestionPipeline(db, source=args.source, max_jobs=args.limit)
        stats = pipeline.run(dry_run=args.dry_run)
        logger.info(f"Done: {stats}")
        if args.dry_run:
            logger.info("(dry-run: no records written to DB)")
    finally:
        db.close()


if __name__ == "__main__":
    main()
