from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from loguru import logger

from app.core.config import settings
from app.core.database import SessionLocal
from app.ingestion.pipeline import IngestionPipeline
from app.ingestion.validation_pipeline import ValidationPipeline

_scheduler: BackgroundScheduler | None = None


def _run_pipeline_job() -> None:
    logger.info("[scheduler] ingestion run starting")
    db = SessionLocal()
    try:
        pipeline = IngestionPipeline(db)
        stats = pipeline.run()
        logger.info(f"[scheduler] ingestion run complete: {stats}")
    except Exception as exc:
        logger.error(f"[scheduler] ingestion run failed: {exc}")
    finally:
        db.close()


def _run_validation_job() -> None:
    logger.info("[scheduler] validation run starting")
    db = SessionLocal()
    try:
        pipeline = ValidationPipeline(db)
        stats = pipeline.run()
        logger.info(f"[scheduler] validation run complete: {stats}")
    except Exception as exc:
        logger.error(f"[scheduler] validation run failed: {exc}")
    finally:
        db.close()


def start_scheduler() -> None:
    global _scheduler
    if not settings.ingestion_enabled:
        logger.info("[scheduler] ingestion disabled (INGESTION_ENABLED=false)")
        return

    _scheduler = BackgroundScheduler()
    _scheduler.add_job(
        _run_pipeline_job,
        trigger=IntervalTrigger(hours=settings.ingestion_schedule_hours),
        id="job_ingestion",
        replace_existing=True,
        next_run_time=None,  # don't fire immediately on startup
    )
    _scheduler.add_job(
        _run_validation_job,
        trigger=IntervalTrigger(hours=settings.validation_schedule_hours),
        id="job_validation",
        replace_existing=True,
        next_run_time=None,  # don't fire immediately on startup
    )
    _scheduler.start()
    logger.info(
        f"[scheduler] ingestion scheduler started "
        f"(every {settings.ingestion_schedule_hours}h)"
    )
    logger.info(
        f"[scheduler] validation scheduler started "
        f"(every {settings.validation_schedule_hours}h)"
    )


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("[scheduler] ingestion scheduler stopped")
