import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Lead, SyncStatus
from app.schemas import HubSpotStatusResponse
from app.services.hubspot import check_connection

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/hubspot/status", response_model=HubSpotStatusResponse)
def get_hubspot_status(db: Session = Depends(get_db)) -> HubSpotStatusResponse:
    configured, error = check_connection()

    last_synced = (
        db.query(Lead)
        .filter(Lead.sync_status.in_([SyncStatus.SYNCED, SyncStatus.FAILED]))
        .order_by(Lead.updated_at.desc())
        .first()
    )

    last_sync_success: bool | None = None
    last_sync_error: str | None = error

    if last_synced is not None:
        last_sync_success = last_synced.sync_status == SyncStatus.SYNCED
        if last_synced.sync_error:
            last_sync_error = last_synced.sync_error

    return HubSpotStatusResponse(
        configured=configured,
        last_sync_success=last_sync_success,
        last_sync_error=last_sync_error,
    )
