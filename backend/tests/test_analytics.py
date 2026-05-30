"""Tests for the analytics endpoint."""

from unittest.mock import patch

from fastapi.testclient import TestClient

from app.services.hubspot import HubSpotSyncResult


VALID_LEAD = {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@acmecorp.com",
    "company": "Acme Corp",
    "budget": "under_10k",
}


class TestAnalytics:
    """Verify analytics are computed from persisted leads."""

    def test_empty_analytics(self, client: TestClient) -> None:
        resp = client.get("/api/analytics")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_leads"] == 0
        assert data["total_pipeline_value"] == 0
        assert data["budget_breakdown"] == {}

    @patch("app.routes.leads.sync_contact")
    def test_analytics_after_leads(
        self, mock_sync: object, client: TestClient
    ) -> None:
        mock_sync.return_value = HubSpotSyncResult(contact_id="hs-1")  # type: ignore[attr-defined]

        client.post("/api/leads", json={**VALID_LEAD, "budget": "under_10k"})
        client.post(
            "/api/leads",
            json={
                **VALID_LEAD,
                "email": "bob@acmecorp.com",
                "budget": "over_50k",
            },
        )

        resp = client.get("/api/analytics")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_leads"] == 2
        assert data["total_pipeline_value"] == 5_000 + 75_000
        assert data["budget_breakdown"]["under_10k"] == 1
        assert data["budget_breakdown"]["over_50k"] == 1

    @patch("app.routes.leads.sync_contact")
    def test_pipeline_value_for_mid_bucket(
        self, mock_sync: object, client: TestClient
    ) -> None:
        mock_sync.return_value = HubSpotSyncResult(contact_id="hs-2")  # type: ignore[attr-defined]

        client.post(
            "/api/leads",
            json={**VALID_LEAD, "budget": "10k_50k"},
        )
        resp = client.get("/api/analytics")
        data = resp.json()
        assert data["total_pipeline_value"] == 30_000
