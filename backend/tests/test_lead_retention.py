"""Tests for automatic purging of leads older than the retention window."""

import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.config import settings
from app.models import BudgetBucket, Lead, SyncStatus
from app.services.lead_retention import purge_expired_leads


def _make_lead(
    *,
    email: str,
    created_at: datetime.datetime,
) -> Lead:
    return Lead(
        first_name="Demo",
        last_name="User",
        email=email,
        company="Acme",
        budget=BudgetBucket.UNDER_10K,
        sync_status=SyncStatus.SYNCED,
        created_at=created_at,
        updated_at=created_at,
    )


class TestLeadRetention:
    def test_purge_removes_leads_older_than_retention_window(
        self, db_session: Session
    ) -> None:
        now = datetime.datetime.now(datetime.UTC)
        old = _make_lead(
            email="old@acmecorp.com",
            created_at=now - datetime.timedelta(hours=25),
        )
        recent = _make_lead(
            email="new@acmecorp.com",
            created_at=now - datetime.timedelta(hours=1),
        )
        db_session.add_all([old, recent])
        db_session.commit()

        deleted = purge_expired_leads(db_session, retention_hours=24)

        assert deleted == 1
        remaining = db_session.query(Lead).order_by(Lead.id).all()
        assert len(remaining) == 1
        assert remaining[0].email == "new@acmecorp.com"

    def test_purge_returns_zero_when_no_expired_leads(
        self, db_session: Session
    ) -> None:
        now = datetime.datetime.now(datetime.UTC)
        lead = _make_lead(
            email="fresh@acmecorp.com",
            created_at=now - datetime.timedelta(hours=2),
        )
        db_session.add(lead)
        db_session.commit()

        assert purge_expired_leads(db_session, retention_hours=24) == 0
        assert db_session.query(Lead).count() == 1

    def test_purge_at_boundary_keeps_lead_created_23_hours_ago(
        self, db_session: Session
    ) -> None:
        now = datetime.datetime.now(datetime.UTC)
        borderline = _make_lead(
            email="border@acmecorp.com",
            created_at=now - datetime.timedelta(hours=23),
        )
        db_session.add(borderline)
        db_session.commit()

        assert purge_expired_leads(db_session, retention_hours=24) == 0

    def test_list_leads_purges_expired_when_retention_enabled(
        self,
        client: TestClient,
        db_session: Session,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        monkeypatch.setattr(settings, "lead_retention_enabled", True)
        now = datetime.datetime.now(datetime.UTC)
        db_session.add(
            _make_lead(
                email="stale@acmecorp.com",
                created_at=now - datetime.timedelta(hours=48),
            )
        )
        db_session.commit()

        resp = client.get("/api/leads")

        assert resp.status_code == 200
        assert resp.json() == []
        assert db_session.query(Lead).count() == 0
