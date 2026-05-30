"""LangGraph AgentState definition."""

from __future__ import annotations

from typing import Any, TypedDict


class PAAgentState(TypedDict, total=False):
    # Execution mode for this run: "mock" or "sandbox". Sourced from the request
    # body, falling back to APP_ENV. The frontend forwards the current UI mode.
    mode: str

    pa_items: list[dict[str, Any]]       # input PA records (SyntheticPA dicts)
    optum_results: list[dict[str, Any]]  # raw PA status data (mock or live)
    priorities: list[dict[str, Any]]     # priority classification / action per PA
    rag_context: list[dict[str, Any]]    # retrieved CMS and payer criteria per PA
    cms_flags: list[dict[str, Any]]      # compliance violation flags per PA
    predictions: list[dict[str, Any]]    # outcome predictions for pending PAs
    summary: dict[str, Any]              # macro practice-wide summary
    timing: dict[str, int]               # wall-clock ms per node
    errors: list[str]                    # non-fatal errors accumulated across nodes
