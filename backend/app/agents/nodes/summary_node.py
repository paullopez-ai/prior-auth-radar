"""summary_node — final Bedrock call producing the macro practice summary.

Receives the assembled state (priorities, cms_flags, predictions) and generates
the ClaudePASummary. Numeric count fields are recomputed deterministically and
override the model's numbers so the stats bar is always exact.
LangSmith tag: macro_summary.
"""

from __future__ import annotations

import time
from typing import Any

from ... import llm
from ..assembly import actions_by_id, cms_by_id, predictions_by_id
from ..fallbacks import compute_counts, fallback_summary
from ..prompts import SUMMARY_SYSTEM_PROMPT


def summary_node(state: dict[str, Any]) -> dict[str, Any]:
    start = time.perf_counter()
    errors = list(state.get("errors", []))
    pa_items = state.get("pa_items", [])

    actions = actions_by_id(state)
    cms_flags = cms_by_id(state)
    predictions = predictions_by_id(state)
    counts = compute_counts(pa_items, actions, cms_flags)

    payload = {
        "perPA": [
            {
                "paId": pa["id"],
                "authorizationNumber": pa["authorizationNumber"],
                "patientName": f"{pa['patientFirstName']} {pa['patientLastName']}",
                "payerName": pa["payerName"],
                "procedureDescription": pa["procedureDescription"],
                "priority": actions.get(pa["id"], {}).get("priority"),
                "priorityReason": actions.get(pa["id"], {}).get("priorityReason"),
                "cms": cms_flags.get(pa["id"]),
                "prediction": predictions.get(pa["id"]),
            }
            for pa in pa_items
        ],
        "counts": counts,
    }

    try:
        summary = llm.invoke_json(SUMMARY_SYSTEM_PROMPT, payload, "macro_summary")
        # Deterministic counts win over the model's arithmetic.
        summary.update(counts)
    except Exception as exc:  # noqa: BLE001 — degrade gracefully
        errors.append(f"summary_node: {exc}")
        summary = fallback_summary(counts)

    timing = dict(state.get("timing", {}))
    timing["summary"] = int((time.perf_counter() - start) * 1000)
    return {"summary": summary, "errors": errors, "timing": timing}
