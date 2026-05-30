import datetime
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class BudgetBucket(str, PyEnum):
    UNDER_10K = "under_10k"
    TEN_TO_FIFTY_K = "10k_50k"
    OVER_50K = "over_50k"


class SyncStatus(str, PyEnum):
    PENDING = "pending"
    SYNCED = "synced"
    FAILED = "failed"


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    last_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    budget: Mapped[BudgetBucket] = mapped_column(
        Enum(BudgetBucket, native_enum=False, length=20), nullable=False
    )
    sync_status: Mapped[SyncStatus] = mapped_column(
        Enum(SyncStatus, native_enum=False, length=20),
        default=SyncStatus.PENDING,
        nullable=False,
    )
    hubspot_contact_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    sync_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
