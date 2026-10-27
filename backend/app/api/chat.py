"""Chat/query API routes."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.models.chat import ChatRequest
from app.services.chat_service import handle_query, handle_query_stream
from app.utils.logging import get_logger

logger = get_logger("api.chat")
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def chat(request: ChatRequest):
    """Query the RAG pipeline and get a grounded answer.
    
    Retrieves relevant chunks from uploaded documents, generates
    an answer using the configured LLM, and returns source citations.
    """
    try:
        response = await handle_query(request)
        return response.model_dump()
    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """Stream a RAG-generated answer via Server-Sent Events.
    
    Events:
    - {"type": "token", "content": "..."} — incremental text
    - {"type": "sources", "sources": [...]} — citations
    - {"type": "done"} — stream complete
    """
    async def event_generator():
        try:
            async for event_data in handle_query_stream(request):
                yield f"data: {event_data}\n\n"
        except Exception as e:
            logger.error(f"Stream error: {e}", exc_info=True)
            import json
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
