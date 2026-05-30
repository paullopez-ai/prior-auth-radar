"""LangGraph state machine for PA analysis.

Six nodes run in sequence. Each node reads the accumulated state and returns a
partial update; because the graph is a linear chain, `errors` and `timing`
accumulate cleanly (each node forwards the prior values it received).

    fetch → priority → rag → cms → prediction → summary → END
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any

from langgraph.graph import END, StateGraph

from .nodes.cms_node import cms_node
from .nodes.fetch_node import fetch_node
from .nodes.prediction_node import prediction_node
from .nodes.priority_node import priority_node
from .nodes.rag_node import rag_node
from .nodes.summary_node import summary_node
from .state import PAAgentState


def build_graph():
    workflow = StateGraph(PAAgentState)

    workflow.add_node("fetch", fetch_node)
    workflow.add_node("priority", priority_node)
    workflow.add_node("rag", rag_node)
    workflow.add_node("cms", cms_node)
    workflow.add_node("prediction", prediction_node)
    workflow.add_node("summary", summary_node)

    workflow.set_entry_point("fetch")
    workflow.add_edge("fetch", "priority")
    workflow.add_edge("priority", "rag")
    workflow.add_edge("rag", "cms")
    workflow.add_edge("cms", "prediction")
    workflow.add_edge("prediction", "summary")
    workflow.add_edge("summary", END)

    return workflow.compile()


@lru_cache(maxsize=1)
def get_agent():
    """Compiled graph, cached for reuse across requests."""
    return build_graph()


def run_agent(mode: str, pa_items: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    initial: dict[str, Any] = {
        "mode": mode,
        "pa_items": pa_items or [],
        "errors": [],
        "timing": {},
    }
    return get_agent().invoke(initial)
