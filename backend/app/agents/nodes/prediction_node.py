"""prediction_node — Bedrock outcome prediction for pending/denied PAs.

The prompt includes the RAG context retrieved in rag_node, so the model reasons
over retrieved CMS guidelines and payer criteria rather than hardcoded rules.
APPROVED PAs get a null prediction. LangSmith tag: outcome_prediction.
"""

from __future__ import annotations

import time
from typing import Any

from ... import llm
from ..assembly import optum_by_id, rag_by_id
from ..fallbacks import fallback_prediction
from ..prompts import PREDICTION_SYSTEM_PROMPT


def _is_eligible(pa: dict[str, Any]) -> bool:
    scenario = pa.get("scenario", "")
    return scenario.startswith("PENDING") or scenario.startswith("DENIED")


def prediction_node(state: dict[str, Any]) -> dict[str, Any]:
    start = time.perf_counter()
    errors = list(state.get("errors", []))
    pa_items = state.get("pa_items", [])
    statuses = optum_by_id(state)
    rag = rag_by_id(state)

    eligible = [pa for pa in pa_items if _is_eligible(pa)]

    per_pa_predictions: dict[str, Any] = {}
    if eligible:
        payload = {
            "paRequests": [
                {
                    "paId": pa["id"],
                    "context": {
                        "patientName": f"{pa['patientFirstName']} {pa['patientLastName']}",
                        "procedureCode": pa["procedureCode"],
                        "procedureDescription": pa["procedureDescription"],
                        "payerName": pa["payerName"],
                        "scenario": pa["scenario"],
                        "isCMSWindowViolated": pa["isCMSWindowViolated"],
                        "paContext": pa["paContext"],
                    },
                    "statusResponse": statuses.get(pa["id"]),
                    "ragContext": [c.get("content", "") for c in rag.get(pa["id"], [])],
                }
                for pa in eligible
            ]
        }
        try:
            result = llm.invoke_json(
                PREDICTION_SYSTEM_PROMPT, payload, "outcome_prediction"
            )
            per_pa_predictions = result.get("perPAPredictions", {}) or {}
        except Exception as exc:  # noqa: BLE001 — degrade gracefully
            errors.append(f"prediction_node: {exc}")
            per_pa_predictions = {pa["id"]: fallback_prediction() for pa in eligible}

    predictions = []
    for pa in pa_items:
        if _is_eligible(pa):
            predictions.append(
                {"paId": pa["id"], "prediction": per_pa_predictions.get(pa["id"])}
            )
        else:
            predictions.append({"paId": pa["id"], "prediction": None})

    timing = dict(state.get("timing", {}))
    timing["prediction"] = int((time.perf_counter() - start) * 1000)
    return {"predictions": predictions, "errors": errors, "timing": timing}
