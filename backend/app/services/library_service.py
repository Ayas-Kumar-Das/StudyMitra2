"""Library/catalog service layer."""

from app.db import database as db
from app.utils.logging import get_logger

logger = get_logger("library_service")


async def get_library_stats() -> dict:
    """Get library-wide statistics."""
    stats = await db.get_document_stats()
    subjects = await db.get_subjects()
    stats["subjects"] = subjects
    return stats


async def get_all_documents(
    subject: str | None = None,
    doc_type: str | None = None,
) -> list[dict]:
    """Get all documents with optional filters."""
    return await db.list_documents(subject=subject, doc_type=doc_type)


async def get_subjects() -> list[str]:
    """Get all unique subjects."""
    return await db.get_subjects()
