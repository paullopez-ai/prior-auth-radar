"""Helpers to index node outputs by paId and assemble the final response.

The final response must match the frontend's `PAFeedResult` TypeScript type
exactly (camelCase keys), so all assembly funnels through here.
"""

from __future__ import annotations

from typing import Any

from .fallbacks import fallback_action


def optum_by_id(state: dict[str, Any]) -> dict[str, Any | None]:
    return {r["paId"]: r.get("statusResponse") for r in state.get("optum_results", [])}


def errors_by_id(state: dict[str, Any]) -> dict[str, str | None]:
    return {r["paId"]: r.get("error") for r in state.get("optum_results", [])}


def actions_by_id(state: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {p["paId"]: p["action"] for p in state.get("priorities", [])}


def cms_by_id(state: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {c["paId"]: c for c in state.get("cms_flags", [])}


def predictions_by_id(state: dict[str, Any]) -> dict[str, Any | None]:
    return {p["paId"]: p.get("prediction") for p in state.get("predictions", [])}


def rag_by_id(state: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    return {r["paId"]: r.get("chunks", []) for r in state.get("rag_context", [])}


def build_feed_result(
    state: dict[str, Any], total_ms: int
) -> dict[str, Any]:
    """Assemble the PAFeedResult payload from the final graph state."""
    pa_items = state.get("pa_items", [])
    statuses = optum_by_id(state)
    item_errors = errors_by_id(state)
    actions = actions_by_id(state)
    predictions = predictions_by_id(state)

    feed_items: list[dict[str, Any]] = []
    success_count = 0
    error_count = 0

    for pa in pa_items:
        pa_id = pa["id"]
        status = statuses.get(pa_id)
        err = item_errors.get(pa_id)
        if status is None:
            error_count += 1
        else:
            success_count += 1
        feed_items.append(
            {
                "pa": pa,
                "statusResponse": status,
                "paAction": actions.get(pa_id) or fallback_action(pa.get("priority", "MONITOR")),
                "paOutcomePrediction": predictions.get(pa_id),
                "timingMs": 0,
                "error": err,
            }
        )

    pa_analysis = {
        "perPAActions": {pa["id"]: actions.get(pa["id"]) or fallback_action(pa.get("priority", "MONITOR")) for pa in pa_items},
        "perPAPredictions": {pa["id"]: predictions.get(pa["id"]) for pa in pa_items},
        "paSummary": state.get("summary", {}),
    }

    timing = state.get("timing", {})
    llm_ms = sum(
        timing.get(k, 0) for k in ("priority", "rag", "prediction", "summary")
    )

    return {
        "paItems": feed_items,
        "paAnalysis": pa_analysis,
        "timing": {
            "parallelStatusMs": timing.get("fetch", 0),
            "claudeMs": llm_ms,
            "totalMs": total_ms,
        },
        "mode": state.get("mode", "mock"),
        "successCount": success_count,
        "errorCount": error_count,
        # Surfaced for debugging / the dev console; harmless extra fields.
        "nodeTimings": timing,
        "errors": state.get("errors", []),
    }
