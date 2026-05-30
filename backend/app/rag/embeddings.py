"""Bedrock Titan embedding generation for the RAG layer.

Lazy imports keep the module importable without the AWS extras installed.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any

from .. import config


@lru_cache(maxsize=1)
def get_embeddings() -> Any:
    """Return a cached BedrockEmbeddings client (Titan)."""
    from langchain_aws import BedrockEmbeddings

    return BedrockEmbeddings(
        model_id=config.BEDROCK_EMBEDDING_MODEL,
        region_name=config.AWS_REGION,
    )
