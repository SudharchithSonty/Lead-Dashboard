"""Tests for lead creation validation at the API boundary."""

import pytest
from fastapi.testclient import TestClient


VALID_LEAD = {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@acmecorp.com",
    "company": "Acme Corp",
    "budget": "under_10k",
}


class TestLeadCreationValidation:
    """Verify that the API rejects malformed, missing, and invalid input."""

    def test_missing_first_name(self, client: TestClient) -> None:
        payload = {**VALID_LEAD}
        del payload["first_name"]
        resp = client.post("/api/leads", json=payload)
        assert resp.status_code == 422

    def test_blank_first_name(self, client: TestClient) -> None:
        resp = client.post("/api/leads", json={**VALID_LEAD, "first_name": "  "})
        assert resp.status_code == 422

    def test_missing_last_name(self, client: TestClient) -> None:
        payload = {**VALID_LEAD}
        del payload["last_name"]
        resp = client.post("/api/leads", json=payload)
        assert resp.status_code == 422

    def test_blank_last_name(self, client: TestClient) -> None:
        resp = client.post("/api/leads", json={**VALID_LEAD, "last_name": ""})
        assert resp.status_code == 422

    def test_missing_email(self, client: TestClient) -> None:
        payload = {**VALID_LEAD}
        del payload["email"]
        resp = client.post("/api/leads", json=payload)
        assert resp.status_code == 422

    def test_invalid_email_format(self, client: TestClient) -> None:
        resp = client.post("/api/leads", json={**VALID_LEAD, "email": "not-an-email"})
        assert resp.status_code == 422

    def test_free_email_rejected(self, client: TestClient) -> None:
        resp = client.post("/api/leads", json={**VALID_LEAD, "email": "jane@gmail.com"})
        assert resp.status_code == 422

    def test_missing_company(self, client: TestClient) -> None:
        payload = {**VALID_LEAD}
        del payload["company"]
        resp = client.post("/api/leads", json=payload)
        assert resp.status_code == 422

    def test_blank_company(self, client: TestClient) -> None:
        resp = client.post("/api/leads", json={**VALID_LEAD, "company": "  "})
        assert resp.status_code == 422

    def test_missing_budget(self, client: TestClient) -> None:
        payload = {**VALID_LEAD}
        del payload["budget"]
        resp = client.post("/api/leads", json=payload)
        assert resp.status_code == 422

    def test_invalid_budget_value(self, client: TestClient) -> None:
        resp = client.post("/api/leads", json={**VALID_LEAD, "budget": "a_million"})
        assert resp.status_code == 422

    def test_null_first_name(self, client: TestClient) -> None:
        resp = client.post("/api/leads", json={**VALID_LEAD, "first_name": None})
        assert resp.status_code == 422

    def test_null_email(self, client: TestClient) -> None:
        resp = client.post("/api/leads", json={**VALID_LEAD, "email": None})
        assert resp.status_code == 422

    def test_empty_body(self, client: TestClient) -> None:
        resp = client.post("/api/leads", json={})
        assert resp.status_code == 422

    @pytest.mark.parametrize("budget", ["under_10k", "10k_50k", "over_50k"])
    def test_valid_budget_values_accepted(
        self, client: TestClient, budget: str
    ) -> None:
        resp = client.post("/api/leads", json={**VALID_LEAD, "budget": budget})
        assert resp.status_code in (201, 422)
