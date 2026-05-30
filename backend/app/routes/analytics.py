from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import BudgetBucket, Lead
from app.schemas import AnalyticsResponse

router = APIRouter()

BUDGET_VALUE_MAP: dict[str, int] = {
    BudgetBucket.UNDER_10K.value: 5_000,
    BudgetBucket.TEN_TO_FIFTY_K.value: 30_000,
    BudgetBucket.OVER_50K.value: 75_000,
}


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)) -> AnalyticsResponse:
    rows = (
        db.query(Lead.budget, func.count(Lead.id))
        .group_by(Lead.budget)
        .all()
    )

    total_leads = 0
    total_pipeline = 0
    breakdown: dict[str, int] = {}

    for bucket, count in rows:
        bucket_val = bucket.value if hasattr(bucket, "value") else bucket
        total_leads += count
        total_pipeline += count * BUDGET_VALUE_MAP.get(bucket_val, 0)
        breakdown[bucket_val] = count

    return AnalyticsResponse(
        total_leads=total_leads,
        total_pipeline_value=total_pipeline,
        budget_breakdown=breakdown,
    )
