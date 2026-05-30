"""priority_node — Bedrock classification + per-PA action recommendation.

Produces the full ClaudePAAction object for every PA (priority, action steps,
risk assessment, documentation). LangSmith tag: priority_classification.
"""

from __future__ import annotations

import time
from typing import Any

from ... import llm
from ..assembly import optum_by_id
from ..fallbacks import fallback_action
from ..prompts import PRIORITY_SYSTEM_PROMPT


def _build_payload(pa_items: list[dict[str, Any]], statuses: dict[str, Any]) -> dict[str, Any]:
    critical = sum(
        1
        for pa in pa_items
        if pa.get("daysUntilProcedure") is not None
        and pa["daysUntilProcedure"] <= 5
        and pa.get("scenario") != "APPROVED_READY_TO_SCHEDULE"
    )
    return {
        "paRequests": [
            {
                "paId": pa["id"],
                "context": {
                    "patientName": f"{pa['patientFirstName']} {pa['patientLastName']}",
                    "procedureCode": pa["procedureCode"],
                    "procedureDescription": pa["procedureDescription"],
                    "payerName": pa["payerName"],
                    "urgencyType": pa["urgencyType"],
                    "submittedDate": pa["submittedDate"],
                    "daysSubmitted": pa["daysSubmitted"],
                    "scheduledProcedureDate": pa.get("scheduledProcedureDate"),
                    "daysUntilProcedure": pa.get("daysUntilProcedure"),
                    "cmsResponseDeadline": pa["cmsResponseDeadline"],
                    "isCMSWindowViolated": pa["isCMSWindowViolated"],
                    "daysCMSOverdue": pa.get("daysCMSOverdue"),
                    "paContext": pa["paContext"],
                },
                "statusResponse": statuses.get(pa["id"]),
            }
            for pa in pa_items
        ],
        "practiceContext": {
            "totalPAsInFeed": len(pa_items),
            "criticalCount": critical,
            "cmsViolationCount": sum(1 for pa in pa_items if pa["isCMSWindowViolated"]),
            "totalPending": sum(1 for pa in pa_items if pa["scenario"].startswith("PENDING")),
            "totalApproved": sum(1 for pa in pa_items if pa["scenario"].startswith("APPROVED")),
            "totalDenied": sum(1 for pa in pa_items if pa["scenario"].startswith("DENIED")),
        },
    }


def priority_node(state: dict[str, Any]) -> dict[str, Any]:
    start = time.perf_counter()
    errors = list(state.get("errors", []))
    pa_items = state.get("pa_items", [])
    statuses = optum_by_id(state)

    per_pa_actions: dict[str, dict[str, Any]] = {}
    try:
        result = llm.invoke_json(
            PRIORITY_SYSTEM_PROMPT, _build_payload(pa_items, statuses), "priority_classification"
        )
        per_pa_actions = result.get("perPAActions", {}) or {}
    except Exception as exc:  # noqa: BLE001 — degrade gracefully
        errors.append(f"priority_node: {exc}")

    priorities = []
    for pa in pa_items:
        action = per_pa_actions.get(pa["id"]) or fallback_action(pa.get("priority", "MONITOR"))
        priorities.append({"paId": pa["id"], "action": action})

    timing = dict(state.get("timing", {}))
    timing["priority"] = int((time.perf_counter() - start) * 1000)
    return {"priorities": priorities, "errors": errors, "timing": timing}
