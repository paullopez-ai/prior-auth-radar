"""Seed the pgvector store with CMS guidelines and payer criteria.

Runs on backend startup (called from main.py lifespan). Idempotent: checks the
collection's row count and skips if already populated. Chunks the seed markdown
into ~200-token segments with ~20-token overlap, embeds via Bedrock Titan, and
inserts into pgvector.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from .. import config
from . import retriever

logger = logging.getLogger("pa_agent.seed")

SEED_DIR = Path(__file__).parent / "seed"

# Rough token→char heuristic (~4 chars/token) for the chunk sizing in the PRD.
_CHUNK_CHARS = 200 * 4
_OVERLAP_CHARS = 20 * 4


def _chunk(text: str, source: str) -> list[dict[str, Any]]:
    words = text.split()
    chunks: list[dict[str, Any]] = []
    step_chars = max(_CHUNK_CHARS - _OVERLAP_CHARS, 1)

    buf: list[str] = []
    length = 0
    for word in words:
        buf.append(word)
        length += len(word) + 1
        if length >= _CHUNK_CHARS:
            chunks.append({"content": " ".join(buf), "source": source})
            # Retain a small overlap tail for the next chunk.
            overlap_words = max(1, int(_OVERLAP_CHARS / 6))
            buf = buf[-overlap_words:]
            length = sum(len(w) + 1 for w in buf)
    if buf:
        chunks.append({"content": " ".join(buf), "source": source})
    # Silence "step_chars unused" while keeping the intent documented.
    _ = step_chars
    return chunks


def _count_existing(store: Any) -> int:
    try:
        # Cheap existence probe; if anything is indexed, treat as seeded.
        hits = store.similarity_search("prior authorization", k=1)
        return len(hits)
    except Exception:  # noqa: BLE001
        return 0


def seed_if_empty() -> None:
    from langchain_core.documents import Document

    try:
        store = retriever.get_retriever()
    except Exception as exc:  # noqa: BLE001 — seeding is best-effort at startup
        logger.warning("Skipping RAG seed — vector store unavailable: %s", exc)
        return

    if _count_existing(store) > 0:
        logger.info("RAG store already seeded — skipping.")
        return

    docs: list[Document] = []
    for path in sorted(SEED_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        for chunk in _chunk(text, path.name):
            docs.append(
                Document(page_content=chunk["content"], metadata={"source": chunk["source"]})
            )

    if not docs:
        logger.warning("No seed documents found in %s", SEED_DIR)
        return

    store.add_documents(docs)
    logger.info("Seeded %d policy chunks into collection '%s'.", len(docs), config.RAG_COLLECTION)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed_if_empty()
