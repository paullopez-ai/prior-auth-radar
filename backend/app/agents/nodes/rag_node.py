"""rag_node — pgvector similarity search for CMS / payer policy context.

For each PA, builds a query from procedure + diagnosis + payer, embeds it with
Bedrock Titan, and retrieves the top-K policy chunks. The chunks are carried in
state and injected into the prediction_node prompt. LangSmith tag: rag_retrieval.
"""

from __future__ import annotations

import time
from typing import Any

from ... import config
from ...rag import retriever


def _query_for(pa: dict[str, Any]) -> str:
    return (
        f"{pa['procedureCode']} {pa['procedureDescription']} "
        f"payer {pa['payerName']} urgency {pa['urgencyType']}. {pa['paContext']}"
    )


def rag_node(state: dict[str, Any]) -> dict[str, Any]:
    start = time.perf_counter()
    errors = list(state.get("errors", []))
    pa_items = state.get("pa_items", [])

    rag_context: list[dict[str, Any]] = []
    store = None
    try:
        store = retriever.get_retriever()
    except Exception as exc:  # noqa: BLE001 — RAG is best-effort
        errors.append(f"rag_node: retriever unavailable: {exc}")

    for pa in pa_items:
        chunks: list[dict[str, Any]] = []
        if store is not None:
            try:
                chunks = retriever.search(store, _query_for(pa), k=config.RAG_TOP_K)
            except Exception as exc:  # noqa: BLE001 — isolate per-query failures
                errors.append(f"rag_node {pa['id']}: {exc}")
        rag_context.append({"paId": pa["id"], "chunks": chunks})

    timing = dict(state.get("timing", {}))
    timing["rag"] = int((time.perf_counter() - start) * 1000)
    return {"rag_context": rag_context, "errors": errors, "timing": timing}
