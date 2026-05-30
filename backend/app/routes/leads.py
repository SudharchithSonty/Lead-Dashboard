import asyncio
import json
import logging
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse

from app.broadcast import broadcaster
from app.db import get_db
from app.models import Lead, SyncStatus
from app.schemas import LeadCreate, LeadResponse
from app.services.hubspot import HubSpotSyncError, sync_contact

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_PAGE_SIZE = 100
DEFAULT_PAGE_SIZE = 50


@router.post("/leads", response_model=LeadResponse, status_code=201)
async def create_lead(payload: LeadCreate, db: Session = Depends(get_db)) -> Lead:
    lead = Lead(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        company=payload.company,
        budget=payload.budget,
    )

    db.add(lead)
    db.flush()
    db.commit()
    db.refresh(lead)

    try:
        result = await asyncio.to_thread(
            sync_contact,
            email=lead.email,
            first_name=lead.first_name,
            last_name=lead.last_name,
            company=lead.company,
            budget=lead.budget.value,
        )
        lead.sync_status = SyncStatus.SYNCED
        lead.hubspot_contact_id = result.contact_id
        lead.sync_error = None
        db.commit()
    except HubSpotSyncError as exc:
        logger.error(
            "lead_sync_failed",
            extra={"lead_id": lead.id, "error": str(exc)},
        )
        lead.sync_status = SyncStatus.FAILED
        lead.sync_error = str(exc)
        db.commit()

    db.refresh(lead)

    lead_data = LeadResponse.model_validate(lead).model_dump(mode="json")
    await broadcaster.publish(json.dumps(lead_data))

    return lead


@router.get("/leads", response_model=list[LeadResponse])
def list_leads(
    offset: int = Query(0, ge=0),
    limit: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    db: Session = Depends(get_db),
) -> list[Lead]:
    return (
        db.query(Lead)
        .order_by(Lead.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/leads/stream")
async def lead_stream() -> EventSourceResponse:
    async def event_generator() -> AsyncGenerator[dict[str, str], None]:
        async for data in broadcaster.subscribe():
            yield {"data": data}

    return EventSourceResponse(event_generator())
