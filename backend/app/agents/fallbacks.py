"""Deterministic fallbacks that preserve the response contract.

If a Bedrock call fails (or AWS is not configured), the node records the error
and uses these builders so the assembled PAFeedResult still matches the
frontend's `ClaudePAAnalysis` shape and the dashboard renders raw status data.
"""

from __future__ import annotations

from typing import Any

PRIORITY_ORDER = ["CRITICAL", "URGENT", "ACTION_REQUIRED", "MONITOR", "APPROVED"]


def fallback_action(priority: str = "MONITOR") -> dict[str, Any]:
    return {
        "priority": priority,
        "priorityReason": "AI analysis unavailable — using rule-based fallback.",
        "immediateAction": None,
        "actionDeadline": None,
        "actionSteps": [],
        "cmsComplianceAction": None,
        "statusInterpretation": "AI analysis unavailable — showing raw PA status.",
        "riskAssessment": {
            "procedureDateRisk": False,
            "cmsViolationRisk": False,
            "denialRisk": False,
            "appealDeadlineRisk": False,
            "riskSummary": None,
        },
        "recommendedDocumentation": [],
        "contactPayer": False,
        "contactPayerReason": None,
    }


def fallback_prediction() -> dict[str, Any]:
    return {
        "approvalLikelihood": "NOT_APPLICABLE",
        "confidenceExplanation": "AI prediction unavailable.",
        "keyFactors": [],
        "likelyDenialReason": None,
        "bestApproachToApproval": "AI prediction unavailable — review PA manually.",
        "peerToPeerRecommended": False,
        "alternativeProcedureCode": None,
    }


def compute_counts(
    pa_items: list[dict[str, Any]],
    actions: dict[str, dict[str, Any]],
    cms_flags: dict[str, dict[str, Any]],
) -> dict[str, int]:
    """Deterministic count fields for the macro summary / stats bar."""
    counts = {
        "criticalCount": 0,
        "urgentCount": 0,
        "actionRequiredCount": 0,
        "monitorCount": 0,
        "approvedCount": 0,
        "totalPAsInFeed": len(pa_items),
        "cmsViolationCount": 0,
        "proceduresAtRiskCount": 0,
    }
    key_by_priority = {
        "CRITICAL": "criticalCount",
        "URGENT": "urgentCount",
        "ACTION_REQUIRED": "actionRequiredCount",
        "MONITOR": "monitorCount",
        "APPROVED": "approvedCount",
    }
    for pa in pa_items:
        pa_id = pa["id"]
        priority = actions.get(pa_id, {}).get("priority", "MONITOR")
        counts[key_by_priority.get(priority, "monitorCount")] += 1

        if cms_flags.get(pa_id, {}).get("isCMSViolated"):
            counts["cmsViolationCount"] += 1

        # A procedure is "at risk" when it is imminent (within 5 days) and the
        # PA still demands attention (critical/urgent) — including an approved
        # authorization that is about to expire before the procedure date.
        days = pa.get("daysUntilProcedure")
        if days is not None and days <= 5 and priority in ("CRITICAL", "URGENT"):
            counts["proceduresAtRiskCount"] += 1
    return counts


def fallback_summary(counts: dict[str, int]) -> dict[str, Any]:
    return {
        **counts,
        "topThreeActions": [],
        "practiceHealthSummary": "PA intelligence summary unavailable — showing raw data.",
        "cmsComplianceSummary": None,
        "flaggedForImmediateAttention": [],
        "insight": "AI analysis unavailable.",
    }
