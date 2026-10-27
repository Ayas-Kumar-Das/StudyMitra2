"""Chat/query service layer."""

from app.models.chat import ChatRequest, ChatResponse
from app.generation.generator import generate_answer, generate_answer_stream
from app.utils.logging import get_logger
from typing import AsyncGenerator

logger = get_logger("chat_service")


async def handle_query(request: ChatRequest) -> ChatResponse:
    """Process a chat query and return a grounded answer.
    
    This is the main entry point for the chat API.
    """
    logger.info(f"Query: mode={request.mode.value}, query='{request.query[:80]}'")
    response = await generate_answer(request)
    return response


async def handle_query_stream(request: ChatRequest) -> AsyncGenerator[str, None]:
    """Stream a chat query response via SSE events."""
    logger.info(f"Stream query: mode={request.mode.value}, query='{request.query[:80]}'")
    async for event in generate_answer_stream(request):
        yield event
