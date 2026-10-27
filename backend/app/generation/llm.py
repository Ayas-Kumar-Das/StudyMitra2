"""LLM provider abstraction.

Uses the OpenAI client library which is compatible with OpenAI, 
Groq, Ollama (with OpenAI-compat endpoint), and other providers.
"""

from typing import AsyncGenerator
from openai import AsyncOpenAI
from app.config import get_settings
from app.utils.logging import get_logger

logger = get_logger("llm")

_client: AsyncOpenAI | None = None


def get_llm_client() -> AsyncOpenAI:
    """Get or create the LLM client singleton."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = AsyncOpenAI(
            api_key=settings.LLM_API_KEY or "not-needed",
            base_url=settings.LLM_BASE_URL,
        )
        logger.info(
            f"LLM client initialized: provider={settings.LLM_PROVIDER}, "
            f"model={settings.LLM_MODEL}, base_url={settings.LLM_BASE_URL}"
        )
    return _client


async def generate(
    system_prompt: str,
    user_prompt: str,
) -> str:
    """Generate a complete response from the LLM.
    
    Args:
        system_prompt: System/instruction prompt
        user_prompt: User's message (query + context)
    
    Returns:
        Generated text response
    """
    settings = get_settings()
    client = get_llm_client()

    response = await client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=settings.LLM_TEMPERATURE,
        max_tokens=settings.LLM_MAX_TOKENS,
    )

    content = response.choices[0].message.content or ""
    logger.debug(f"LLM generated {len(content)} chars")
    return content


async def generate_stream(
    system_prompt: str,
    user_prompt: str,
) -> AsyncGenerator[str, None]:
    """Stream tokens from the LLM.
    
    Yields individual text chunks as they arrive.
    """
    settings = get_settings()
    client = get_llm_client()

    stream = await client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=settings.LLM_TEMPERATURE,
        max_tokens=settings.LLM_MAX_TOKENS,
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta
        if delta.content:
            yield delta.content
