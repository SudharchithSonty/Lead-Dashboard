import datetime
import re

from pydantic import BaseModel, field_validator

from app.models import BudgetBucket, SyncStatus

_EMAIL_RE = re.compile(
    r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
)

_FREE_EMAIL_DOMAINS = frozenset({
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "aol.com", "icloud.com", "mail.com", "protonmail.com",
    "zoho.com", "yandex.com",
})


class LeadCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    company: str
    budget: BudgetBucket

    @field_validator("first_name", "last_name", "company")
    @classmethod
    def not_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("must not be blank")
        return stripped

    @field_validator("email")
    @classmethod
    def valid_corporate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not _EMAIL_RE.match(v):
            raise ValueError("invalid email format")
        domain = v.split("@")[1]
        if domain in _FREE_EMAIL_DOMAINS:
            raise ValueError("please use a corporate email address")
        return v


class LeadResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    company: str
    budget: BudgetBucket
    sync_status: SyncStatus
    hubspot_contact_id: str | None
    sync_error: str | None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}


class AnalyticsResponse(BaseModel):
    total_leads: int
    total_pipeline_value: int
    budget_breakdown: dict[str, int]


class HubSpotStatusResponse(BaseModel):
    configured: bool
    last_sync_success: bool | None
    last_sync_error: str | None
