"""pgvector similarity search via langchain-postgres PGVector.

Cosine distance, top-K results. Returns plain dicts so the rest of the pipeline
stays framework-agnostic.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any

from .. import config
from .embeddings import get_embeddings


def _connection_string() -> str:
    """Normalize DATABASE_URL to a SQLAlchemy + psycopg2 driver URL."""
    url = config.DATABASE_URL
    if url.startswith("postgresql+"):
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    return url


@lru_cache(maxsize=1)
def get_retriever() -> Any:
    """Return a cached PGVector store handle."""
    from langchain_postgres import PGVector

    return PGVector(
        embeddings=get_embeddings(),
        collection_name=config.RAG_COLLECTION,
        connection=_connection_string(),
        use_jsonb=True,
    )


def search(store: Any, query: str, k: int = 3) -> list[dict[str, Any]]:
    docs = store.similarity_search(query, k=k)
    return [
        {"content": d.page_content, "metadata": getattr(d, "metadata", {}) or {}}
        for d in docs
    ]
