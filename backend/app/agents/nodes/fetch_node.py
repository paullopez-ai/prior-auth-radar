"""fetch_node — loads PA data (mock fixtures or live Optum sandbox).

Individual PA failures are isolated and appended to `errors`; the workflow does
not abort. This is where the server-side mock-vs-sandbox decision lives, so the
frontend never has to know which data source produced a trace.
"""

from __future__ import annotations

import time
from typing import Any

from ... import config
from ...data.pa_items import PA_ITEMS
from ...data.pa_status_fixtures import MOCK_PA_STATUS_FIXTURES


def fetch_node(state: dict[str, Any]) -> dict[str, Any]:
    start = time.perf_counter()
    errors = list(state.get("errors", []))

    mode = state.get("mode") or config.APP_ENV
    pa_items = state.get("pa_items") or PA_ITEMS

    optum_results: list[dict[str, Any]] = []

    if mode != "sandbox":
        for pa in pa_items:
            status = MOCK_PA_STATUS_FIXTURES.get(pa.get("mockPAScenario", ""))
            if status is None:
                errors.append(f"{pa['id']}: no mock fixture for scenario "
                              f"'{pa.get('mockPAScenario')}'")
            optum_results.append(
                {"paId": pa["id"], "statusResponse": status, "error": None}
            )
    else:
        from ...optum_client import fetch_pa_status, get_bearer_token

        try:
            token = get_bearer_token()
        except Exception as exc:  # noqa: BLE001 — surface auth failure, keep going
            errors.append(f"Optum auth failed: {exc}")
            token = None

        for pa in pa_items:
            if token is None:
                optum_results.append(
                    {"paId": pa["id"], "statusResponse": None, "error": "no token"}
                )
                continue
            try:
                status = fetch_pa_status(
                    pa["authorizationNumber"], pa["tradingPartnerServiceId"], token
                )
                optum_results.append(
                    {"paId": pa["id"], "statusResponse": status, "error": None}
                )
            except Exception as exc:  # noqa: BLE001 — isolate per-PA failures
                msg = str(exc)
                errors.append(f"{pa['id']}: {msg}")
                optum_results.append(
                    {"paId": pa["id"], "statusResponse": None, "error": msg}
                )

    timing = dict(state.get("timing", {}))
    timing["fetch"] = int((time.perf_counter() - start) * 1000)

    return {
        "mode": mode,
        "pa_items": pa_items,
        "optum_results": optum_results,
        "errors": errors,
        "timing": timing,
    }
