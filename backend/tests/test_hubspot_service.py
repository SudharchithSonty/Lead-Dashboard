"""Tests for the HubSpot service client."""

from unittest.mock import patch, MagicMock

import httpx
import pytest

from app.services.hubspot import (
    HubSpotSyncError,
    HubSpotSyncResult,
    check_connection,
    sync_contact,
)


class TestHubSpotSync:
    """Verify HubSpot client behavior: auth headers, timeout, error handling."""

    @patch("app.services.hubspot.settings")
    def test_raises_when_token_not_configured(self, mock_settings: MagicMock) -> None:
        mock_settings.hubspot_access_token = ""
        with pytest.raises(HubSpotSyncError, match="not configured"):
            sync_contact(
                email="test@corp.com",
                first_name="T",
                last_name="U",
                company="C",
                budget="under_10k",
            )

    @patch("app.services.hubspot.settings")
    @patch("app.services.hubspot.httpx.Client")
    def test_sends_auth_header(
        self, mock_client_cls: MagicMock, mock_settings: MagicMock
    ) -> None:
        mock_settings.hubspot_access_token = "test-token"
        mock_response = MagicMock()
        mock_response.json.return_value = {"id": "12345"}
        mock_response.raise_for_status = MagicMock()

        mock_client = MagicMock()
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)
        mock_client.post.return_value = mock_response
        mock_client_cls.return_value = mock_client

        result = sync_contact(
            email="test@corp.com",
            first_name="T",
            last_name="U",
            company="C",
            budget="under_10k",
        )

        assert isinstance(result, HubSpotSyncResult)
        assert result.contact_id == "12345"

        call_kwargs = mock_client.post.call_args
        headers = call_kwargs.kwargs.get("headers", {})
        assert headers["Authorization"] == "Bearer test-token"

    @patch("app.services.hubspot.settings")
    @patch("app.services.hubspot.httpx.Client")
    def test_timeout_raises_sync_error(
        self, mock_client_cls: MagicMock, mock_settings: MagicMock
    ) -> None:
        mock_settings.hubspot_access_token = "test-token"
        mock_client = MagicMock()
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)
        mock_client.post.side_effect = httpx.TimeoutException("timed out")
        mock_client_cls.return_value = mock_client

        with pytest.raises(HubSpotSyncError, match="timed out"):
            sync_contact(
                email="test@corp.com",
                first_name="T",
                last_name="U",
                company="C",
                budget="under_10k",
            )

    @patch("app.services.hubspot.settings")
    @patch("app.services.hubspot.httpx.Client")
    def test_http_error_raises_sync_error(
        self, mock_client_cls: MagicMock, mock_settings: MagicMock
    ) -> None:
        mock_settings.hubspot_access_token = "test-token"
        mock_client = MagicMock()
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)

        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.text = "Bad Request"
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "bad request", request=MagicMock(), response=mock_response
        )
        mock_client.post.return_value = mock_response
        mock_client_cls.return_value = mock_client

        with pytest.raises(HubSpotSyncError, match="400"):
            sync_contact(
                email="test@corp.com",
                first_name="T",
                last_name="U",
                company="C",
                budget="under_10k",
            )


class TestHubSpotConnectionCheck:
    @patch("app.services.hubspot.settings")
    def test_not_configured(self, mock_settings: MagicMock) -> None:
        mock_settings.hubspot_access_token = ""
        ok, error = check_connection()
        assert ok is False
        assert error is not None
        assert "not configured" in error.lower()
