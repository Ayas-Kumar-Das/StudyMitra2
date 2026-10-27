"""Health check endpoint."""

from fastapi import APIRouter
from app.models.common import HealthResponse
from app.retrieval.vector_store import get_vector_store
from app.db import database as db

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check application health and service connectivity."""
    # Check Qdrant
    qdrant_status = "unknown"
    try:
        vs = get_vector_store()
        healthy = await vs.health_check()
        qdrant_status = "connected" if healthy else "disconnected"
    except Exception:
        qdrant_status = "error"

    # Get document count
    docs_indexed = 0
    try:
        stats = await db.get_document_stats()
        docs_indexed = stats.get("total_documents", 0)
    except Exception:
        pass

    return HealthResponse(
        status="ok",
        service="StudyMitra",
        qdrant=qdrant_status,
        documents_indexed=docs_indexed,
    )
