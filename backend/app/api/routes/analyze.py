"""POST /api/analyze — runs the LangGraph workflow and returns a PAFeedResult."""

from __future__ import annotations

import time
from typing import Any, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from ... import config
from ...agents.assembly import build_feed_result
from ...agents.pa_agent import run_agent

router = APIRouter()


class AnalyzeRequest(BaseModel):
    # The frontend forwards the current UI mode. pa_items is optional — when
    # omitted the backend sources the synthetic records itself (mock mode).
    mode: Optional[str] = None
    pa_items: Optional[list[dict[str, Any]]] = None


@router.post("/analyze")
def analyze(req: AnalyzeRequest) -> dict[str, Any]:
    start = time.perf_counter()
    mode = req.mode or config.APP_ENV
    state = run_agent(mode=mode, pa_items=req.pa_items)
    total_ms = int((time.perf_counter() - start) * 1000)
    return build_feed_result(state, total_ms)
