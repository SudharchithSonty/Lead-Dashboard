import asyncio
import contextlib
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.db import SessionLocal
from app.services.lead_retention import purge_expired_leads

logger = logging.getLogger(__name__)


async def _retention_poll_loop() -> None:
    interval = max(settings.lead_retention_poll_seconds, 60)
    while True:
        await asyncio.sleep(interval)
        db = SessionLocal()
        try:
            purge_expired_leads(db, retention_hours=settings.lead_retention_hours)
        finally:
            db.close()


def run_startup_retention_purge() -> None:
    db = SessionLocal()
    try:
        purge_expired_leads(db, retention_hours=settings.lead_retention_hours)
    finally:
        db.close()


@asynccontextmanager
async def app_lifespan(_app: FastAPI) -> AsyncIterator[None]:
    poll_task: asyncio.Task[None] | None = None

    if settings.lead_retention_enabled:
        run_startup_retention_purge()
        poll_task = asyncio.create_task(_retention_poll_loop())
        logger.info(
            "lead_retention_started",
            extra={
                "retention_hours": settings.lead_retention_hours,
                "poll_seconds": settings.lead_retention_poll_seconds,
            },
        )

    yield

    if poll_task is not None:
        poll_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await poll_task
