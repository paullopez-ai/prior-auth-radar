"""FastAPI entrypoint for the Prior Auth Radar agent backend."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .api.routes import analyze

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pa_agent")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed the pgvector store on startup (idempotent, best-effort).
    try:
        from .rag.seed import seed_if_empty

        seed_if_empty()
    except Exception as exc:  # noqa: BLE001 — never block startup on seeding
        logger.warning("RAG seed step skipped: %s", exc)
    yield


app = FastAPI(title="Prior Auth Radar — Agent Backend", lifespan=lifespan)

app.include_router(analyze.router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "pa-agent"}
