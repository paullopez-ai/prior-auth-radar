"""Amazon Bedrock inference helpers.

Uses ChatBedrockConverse from langchain-aws so every call is captured as a
LangSmith span automatically (when LANGCHAIN_TRACING_V2=true). Imports are lazy
so the module loads even when AWS/LangChain extras are unavailable, which keeps
the service importable in environments without Bedrock configured.
"""

from __future__ import annotations

import json
import re
from functools import lru_cache
from typing import Any

from . import config


@lru_cache(maxsize=1)
def get_chat_model() -> Any:
    """Return a cached ChatBedrockConverse client for the inference model."""
    from langchain_aws import ChatBedrockConverse

    return ChatBedrockConverse(
        model=config.BEDROCK_INFERENCE_MODEL,
        region_name=config.AWS_REGION,
        temperature=0,
        max_tokens=4096,
    )


def _extract_json(text: str) -> Any:
    """Parse a JSON object from a model response, tolerating stray fences."""
    text = text.strip()
    # Strip ```json ... ``` fences if the model added them despite instructions.
    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fall back to the outermost {...} span.
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start : end + 1])
        raise


def invoke_json(system_prompt: str, user_payload: Any, tag: str) -> dict[str, Any]:
    """Invoke Bedrock with a system prompt + JSON user payload, return parsed JSON.

    `tag` is attached to the LangSmith run so each node is identifiable in the
    trace (priority_classification, outcome_prediction, macro_summary, ...).
    """
    model = get_chat_model()
    user_content = (
        user_payload if isinstance(user_payload, str) else json.dumps(user_payload)
    )
    messages = [
        ("system", system_prompt),
        ("human", user_content),
    ]
    response = model.invoke(messages, config={"tags": [tag], "run_name": tag})
    content = response.content
    if isinstance(content, list):
        # ChatBedrockConverse may return a list of content blocks.
        content = "".join(
            block.get("text", "") if isinstance(block, dict) else str(block)
            for block in content
        )
    return _extract_json(content)
