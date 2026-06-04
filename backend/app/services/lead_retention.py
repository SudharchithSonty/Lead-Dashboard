import datetime
import logging

from sqlalchemy.orm import Session

from app.models import Lead

logger = logging.getLogger(__name__)


def purge_expired_leads(db: Session, *, retention_hours: int) -> int:
    """Delete leads with created_at older than retention_hours. Returns rows deleted."""
    if retention_hours <= 0:
        return 0

    cutoff = datetime.datetime.now(datetime.UTC) - datetime.timedelta(
        hours=retention_hours
    )
    # SQLite stores naive UTC timestamps from server_default=func.now().
    cutoff_naive = cutoff.replace(tzinfo=None)

    deleted = (
        db.query(Lead)
        .filter(Lead.created_at < cutoff_naive)
        .delete(synchronize_session="fetch")
    )
    db.commit()

    if deleted:
        logger.info(
            "lead_retention_purged",
            extra={"deleted": deleted, "retention_hours": retention_hours},
        )

    return deleted
