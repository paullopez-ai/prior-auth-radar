"""Optum sandbox client (sandbox mode only).

Python port of lib/optum-auth.ts and lib/optum-pa-status.ts. Uses the stdlib
urllib so sandbox mode adds no extra dependency. Mock mode never touches this.
"""

from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from typing import Any

from . import config

_PA_STATUS_QUERY = """
query PAStatus($authorizationNumber: String!, $tradingPartnerServiceId: String!) {
  priorAuthorizationStatus(
    authorizationNumber: $authorizationNumber
    tradingPartnerServiceId: $tradingPartnerServiceId
  ) {
    authorizationNumber
    tradingPartnerServiceId
    status { statusCode statusDescription statusCategory effectiveDate expirationDate }
    requestedProcedure { procedureCode procedureDescription serviceTypeCode quantity unitType }
    requestedProvider { npi organizationName firstName lastName }
    requestingProvider { npi organizationName }
    member { memberId firstName lastName dateOfBirth groupNumber }
    payer { name payerId }
    submittedDate
    scheduledProcedureDate
    urgencyType
    denialInfo { isDenied denialReason denialCode appealDeadline peerToPeerAvailable }
    additionalInfoRequired { isRequired infoType description dueDate }
    cmsComplianceStatus { standardResponseWindowDays submittedDate responseDeadline isResponseOverdue daysOverdue }
  }
}
"""

_cached_token: str | None = None
_token_expiry: float = 0.0


def get_bearer_token() -> str:
    global _cached_token, _token_expiry
    if _cached_token and time.time() < _token_expiry:
        return _cached_token

    if not (config.OPTUM_CLIENT_ID and config.OPTUM_CLIENT_SECRET and config.OPTUM_AUTH_URL):
        raise RuntimeError("Optum API credentials are not configured")

    data = urllib.parse.urlencode(
        {
            "grant_type": "client_credentials",
            "client_id": config.OPTUM_CLIENT_ID,
            "client_secret": config.OPTUM_CLIENT_SECRET,
        }
    ).encode()
    req = urllib.request.Request(
        config.OPTUM_AUTH_URL,
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.loads(resp.read().decode())

    _cached_token = payload["access_token"]
    _token_expiry = time.time() + payload.get("expires_in", 300) - 60
    return _cached_token


def fetch_pa_status(
    authorization_number: str, trading_partner_service_id: str, token: str
) -> dict[str, Any]:
    if not config.OPTUM_GRAPHQL_URL:
        raise RuntimeError("OPTUM_GRAPHQL_URL is not configured")

    body = json.dumps(
        {
            "query": _PA_STATUS_QUERY,
            "variables": {
                "authorizationNumber": authorization_number,
                "tradingPartnerServiceId": trading_partner_service_id,
            },
        }
    ).encode()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "x-optum-consumer-correlation-id": f"prior-auth-radar-{int(time.time() * 1000)}",
        "environment": "sandbox",
    }
    if config.OPTUM_PROVIDER_TAX_ID:
        headers["providerTaxId"] = config.OPTUM_PROVIDER_TAX_ID

    req = urllib.request.Request(
        config.OPTUM_GRAPHQL_URL, data=body, headers=headers, method="POST"
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode())

    if result.get("errors"):
        err = result["errors"][0]
        code = (err.get("extensions") or {}).get("code", "UNKNOWN")
        raise RuntimeError(f"Optum GraphQL error [{code}]: {err.get('message')}")

    status = (result.get("data") or {}).get("priorAuthorizationStatus")
    if not status:
        raise RuntimeError("Optum returned null data for this authorization number")
    return status
