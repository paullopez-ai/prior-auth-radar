"""Runtime configuration, sourced from environment variables.

Local development reads these from backend/.env (see .env.example). In ECS they
are injected from Secrets Manager / task definition environment.
"""

from __future__ import annotations

import os

# 'mock' uses the bundled synthetic fixtures; 'sandbox' calls the real Optum
# sandbox API. The server-side decision lives here so the frontend never has to
# know which data source produced a trace.
APP_ENV: str = os.getenv("APP_ENV", "mock")

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://pa_user:pa_password@localhost:5432/pa_agent",
)

AWS_REGION: str = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

BEDROCK_INFERENCE_MODEL: str = os.getenv(
    "BEDROCK_INFERENCE_MODEL", "anthropic.claude-3-5-sonnet-20241022-v2:0"
)
BEDROCK_EMBEDDING_MODEL: str = os.getenv(
    "BEDROCK_EMBEDDING_MODEL", "amazon.titan-embed-text-v1"
)

# pgvector collection name used by the RAG layer.
RAG_COLLECTION: str = os.getenv("RAG_COLLECTION", "pa_policies")
RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "3"))

# Optum sandbox (only used when APP_ENV=sandbox).
OPTUM_CLIENT_ID: str | None = os.getenv("OPTUM_CLIENT_ID")
OPTUM_CLIENT_SECRET: str | None = os.getenv("OPTUM_CLIENT_SECRET")
OPTUM_AUTH_URL: str | None = os.getenv("OPTUM_AUTH_URL")
OPTUM_GRAPHQL_URL: str | None = os.getenv("OPTUM_GRAPHQL_URL")
OPTUM_PROVIDER_TAX_ID: str | None = os.getenv("OPTUM_PROVIDER_TAX_ID")

# The dashboard computes "today"-relative urgency against this fixed date so the
# synthetic scenarios stay stable over time. Matches lib/pa-utils.ts.
TODAY: str = os.getenv("PA_RADAR_TODAY", "2026-02-28")


def is_mock() -> bool:
    return APP_ENV != "sandbox"
