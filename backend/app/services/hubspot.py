import logging
import re
from dataclasses import dataclass

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

HUBSPOT_API_BASE = "https://api.hubapi.com"
HUBSPOT_CONTACTS_URL = f"{HUBSPOT_API_BASE}/crm/v3/objects/contacts"
DEFAULT_TIMEOUT_SECONDS = 10


class HubSpotSyncError(Exception):
    def __init__(self, message: str, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


@dataclass(frozen=True)
class HubSpotSyncResult:
    contact_id: str


_CONFLICT_ID_RE = re.compile(r"Existing ID:\s*(\d+)", re.IGNORECASE)


def _parse_conflict_id(response: httpx.Response) -> str | None:
    """Extract the existing contact ID from a HubSpot 409 response body."""
    try:
        message = response.json().get("message", "")
    except Exception:
        message = response.text
    match = _CONFLICT_ID_RE.search(message)
    return match.group(1) if match else None


def _get_headers() -> dict[str, str]:
    if not settings.hubspot_access_token:
        raise HubSpotSyncError("HubSpot access token is not configured")
    return {
        "Authorization": f"Bearer {settings.hubspot_access_token}",
        "Content-Type": "application/json",
    }


def sync_contact(
    *,
    email: str,
    first_name: str,
    last_name: str,
    company: str,
    budget: str,
) -> HubSpotSyncResult:
    headers = _get_headers()
    # Budget is stored locally only until a custom HubSpot property (e.g. lead_budget) exists.
    _ = budget
    payload = {
        "properties": {
            "email": email,
            "firstname": first_name,
            "lastname": last_name,
            "company": company,
        }
    }

    try:
        with httpx.Client(timeout=DEFAULT_TIMEOUT_SECONDS) as client:
            response = client.post(HUBSPOT_CONTACTS_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            contact_id = data.get("id", "")
            logger.info(
                "hubspot_contact_created",
                extra={"email": email, "contact_id": contact_id},
            )
            return HubSpotSyncResult(contact_id=str(contact_id))
    except httpx.TimeoutException as exc:
        logger.error("hubspot_sync_timeout", extra={"email": email, "error": str(exc)})
        raise HubSpotSyncError(f"HubSpot request timed out: {exc}") from exc
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 409:
            existing_id = _parse_conflict_id(exc.response)
            if existing_id:
                logger.info(
                    "hubspot_contact_already_exists",
                    extra={"email": email, "existing_id": existing_id},
                )
                return HubSpotSyncResult(contact_id=existing_id)
        logger.error(
            "hubspot_sync_http_error",
            extra={
                "email": email,
                "status_code": exc.response.status_code,
                "body": exc.response.text[:500],
            },
        )
        raise HubSpotSyncError(
            f"HubSpot returned {exc.response.status_code}: {exc.response.text[:200]}",
            status_code=exc.response.status_code,
        ) from exc
    except httpx.HTTPError as exc:
        logger.error(
            "hubspot_sync_network_error", extra={"email": email, "error": str(exc)}
        )
        raise HubSpotSyncError(f"HubSpot network error: {exc}") from exc


def check_connection() -> tuple[bool, str | None]:
    if not settings.hubspot_access_token:
        return False, "HubSpot access token is not configured"
    try:
        with httpx.Client(timeout=DEFAULT_TIMEOUT_SECONDS) as client:
            response = client.get(
                f"{HUBSPOT_API_BASE}/crm/v3/objects/contacts",
                params={"limit": 1},
                headers=_get_headers(),
            )
            response.raise_for_status()
            return True, None
    except (httpx.HTTPError, HubSpotSyncError) as exc:
        return False, str(exc)
