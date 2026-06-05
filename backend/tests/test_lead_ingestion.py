"""Tests for lead creation persistence and sync behavior."""

from unittest.mock import patch

from fastapi.testclient import TestClient

from app.models import SyncStatus
from app.services.hubspot import HubSpotSyncError, HubSpotSyncResult


VALID_LEAD = {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@acmecorp.com",
    "company": "Acme Corp",
    "budget": "under_10k",
}


class TestLeadIngestion:
    """Verify leads are persisted and HubSpot sync status is tracked."""

    @patch("app.routes.leads.sync_contact")
    def test_successful_creation_returns_201(
        self, mock_sync: object, client: TestClient
    ) -> None:
        mock_sync.return_value = HubSpotSyncResult(contact_id="hs-123")  # type: ignore[attr-defined]
        resp = client.post("/api/leads", json=VALID_LEAD)
        assert resp.status_code == 201
        data = resp.json()
        assert data["first_name"] == "Jane"
        assert data["email"] == "jane@acmecorp.com"
        assert data["sync_status"] == SyncStatus.SYNCED.value
        assert data["hubspot_contact_id"] == "hs-123"

    @patch("app.routes.leads.sync_contact")
    def test_lead_persisted_in_database(
        self, mock_sync: object, client: TestClient
    ) -> None:
        mock_sync.return_value = HubSpotSyncResult(contact_id="hs-456")  # type: ignore[attr-defined]
        client.post("/api/leads", json=VALID_LEAD)
        resp = client.get("/api/leads")
        assert resp.status_code == 200
        leads = resp.json()
        assert len(leads) == 1
        assert leads[0]["email"] == "jane@acmecorp.com"

    @patch("app.routes.leads.sync_contact")
    def test_hubspot_failure_marks_lead_as_failed(
        self, mock_sync: object, client: TestClient
    ) -> None:
        mock_sync.side_effect = HubSpotSyncError("timeout from HubSpot")  # type: ignore[attr-defined]
        resp = client.post("/api/leads", json=VALID_LEAD)
        assert resp.status_code == 201
        data = resp.json()
        assert data["sync_status"] == SyncStatus.FAILED.value
        assert "timeout" in (data["sync_error"] or "").lower()

    @patch("app.routes.leads.sync_contact")
    def test_lead_created_even_when_hubspot_fails(
        self, mock_sync: object, client: TestClient
    ) -> None:
        mock_sync.side_effect = HubSpotSyncError("service unavailable")  # type: ignore[attr-defined]
        resp = client.post("/api/leads", json=VALID_LEAD)
        assert resp.status_code == 201
        leads_resp = client.get("/api/leads")
        assert len(leads_resp.json()) == 1

    @patch("app.routes.leads.sync_contact")
    def test_email_is_lowercased(
        self, mock_sync: object, client: TestClient
    ) -> None:
        mock_sync.return_value = HubSpotSyncResult(contact_id="hs-789")  # type: ignore[attr-defined]
        resp = client.post(
            "/api/leads", json={**VALID_LEAD, "email": "JANE@AcmeCorp.com"}
        )
        assert resp.status_code == 201
        assert resp.json()["email"] == "jane@acmecorp.com"

    @patch("app.routes.leads.sync_contact")
    def test_created_at_has_utc_timezone(
        self, mock_sync: object, client: TestClient
    ) -> None:
        """created_at must include UTC timezone so JS parses it correctly."""
        mock_sync.return_value = HubSpotSyncResult(contact_id="hs-tz")  # type: ignore[attr-defined]
        resp = client.post("/api/leads", json=VALID_LEAD)
        assert resp.status_code == 201
        created_at = resp.json()["created_at"]
        # Must end with +00:00 or Z so browsers don't misinterpret as local time.
        assert created_at.endswith("+00:00") or created_at.endswith("Z"), (
            f"created_at missing UTC marker: {created_at!r}"
        )

    @patch("app.routes.leads.sync_contact")
    def test_list_leads_pagination(
        self, mock_sync: object, client: TestClient
    ) -> None:
        mock_sync.return_value = HubSpotSyncResult(contact_id="hs-x")  # type: ignore[attr-defined]
        for i in range(5):
            client.post(
                "/api/leads",
                json={**VALID_LEAD, "email": f"user{i}@acmecorp.com"},
            )
        resp = client.get("/api/leads", params={"limit": 2, "offset": 0})
        assert resp.status_code == 200
        assert len(resp.json()) == 2

        resp2 = client.get("/api/leads", params={"limit": 2, "offset": 2})
        assert len(resp2.json()) == 2
