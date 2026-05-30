"""cms_node — pure-logic CMS compliance check (no LLM call).

Compares submission date against the mandatory CMS response window (7 calendar
days standard, 72 hours / 3 days urgent) and flags overdue PAs. Mirrors the
logic in lib/pa-utils.ts. LangSmith tag: cms_compliance.
"""

from __future__ import annotations

import time
from datetime import date
from typing import Any

from ... import config
from ..assembly import optum_by_id


def _today() -> date:
    return date.fromisoformat(config.TODAY)


def _parse(d: str | None) -> date | None:
    if not d:
        return None
    try:
        return date.fromisoformat(d[:10])
    except ValueError:
        return None


def cms_node(state: dict[str, Any]) -> dict[str, Any]:
    start = time.perf_counter()
    pa_items = state.get("pa_items", [])
    statuses = optum_by_id(state)
    today = _today()

    cms_flags: list[dict[str, Any]] = []
    for pa in pa_items:
        status = statuses.get(pa["id"]) or {}
        compliance = status.get("cmsComplianceStatus") if isinstance(status, dict) else None

        # Prefer the payer-reported compliance status; otherwise recompute.
        if compliance and compliance.get("isResponseOverdue") is not None:
            is_violated = bool(compliance.get("isResponseOverdue"))
            days_overdue = compliance.get("daysOverdue")
        else:
            window = 3 if pa["urgencyType"] == "URGENT" else 7
            submitted = _parse(pa["submittedDate"])
            is_pending = pa["scenario"].startswith("PENDING")
            if submitted is not None and is_pending:
                deadline = date.fromordinal(submitted.toordinal() + window)
                overdue_days = (today - deadline).days
                is_violated = overdue_days > 0
                days_overdue = overdue_days if is_violated else None
            else:
                is_violated = False
                days_overdue = None

        cms_flags.append(
            {
                "paId": pa["id"],
                "isCMSViolated": is_violated,
                "daysOverdue": days_overdue,
            }
        )

    timing = dict(state.get("timing", {}))
    timing["cms"] = int((time.perf_counter() - start) * 1000)
    return {"cms_flags": cms_flags, "timing": timing}
