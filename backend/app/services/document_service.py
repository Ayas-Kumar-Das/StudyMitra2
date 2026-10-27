"""Document management service layer."""

from pathlib import Path

from app.db import database as db
from app.utils.file_utils import save_upload, delete_upload, validate_file
from app.ingestion.pipeline import ingest_document, remove_document_vectors
from app.utils.logging import get_logger

logger = get_logger("document_service")


async def upload_and_ingest(
    file_content: bytes,
    original_filename: str,
    metadata: dict,
) -> dict:
    """Handle full document upload, storage, and ingestion.
    
    Args:
        file_content: Raw file bytes
        original_filename: Original filename
        metadata: User-provided metadata (subject, semester, etc.)
    
    Returns:
        Document record dict
    
    Raises:
        ValueError: On validation failure
    """
    # Validate
    is_valid, error = validate_file(original_filename, len(file_content))
    if not is_valid:
        raise ValueError(error)

    # Save to disk
    file_id, saved_path = save_upload(file_content, original_filename)

    # Create DB record
    ext = Path(original_filename).suffix.lower()
    doc_record = {
        "id": file_id,
        "filename": Path(saved_path).name,
        "original_filename": original_filename,
        "file_type": ext.lstrip("."),
        "file_size": len(file_content),
        "subject": metadata.get("subject", ""),
        "semester": metadata.get("semester", ""),
        "doc_type": metadata.get("doc_type", ""),
        "title": metadata.get("title", ""),
        "description": metadata.get("description", ""),
        "tags": metadata.get("tags", ""),
        "status": "pending",
    }
    await db.insert_document(doc_record)

    # Run ingestion pipeline
    try:
        result = await ingest_document(
            file_path=saved_path,
            document_id=file_id,
            original_filename=original_filename,
            user_metadata=metadata,
        )
        # Refresh record
        doc = await db.get_document(file_id)
        return doc
    except Exception as e:
        logger.error(f"Ingestion failed for {original_filename}: {e}")
        doc = await db.get_document(file_id)
        return doc


async def delete_document_full(document_id: str) -> bool:
    """Delete a document completely: vectors, file, and DB record.
    
    Returns True if successful, False if document not found.
    """
    doc = await db.get_document(document_id)
    if not doc:
        return False

    # Remove vectors from Qdrant + keyword index
    try:
        await remove_document_vectors(document_id)
    except Exception as e:
        logger.error(f"Failed to remove vectors for {document_id}: {e}")

    # Remove file from disk
    delete_upload(document_id)

    # Remove DB record
    await db.delete_document(document_id)

    logger.info(f"Fully deleted document: {document_id} ({doc['original_filename']})")
    return True


async def reindex_document(document_id: str) -> dict:
    """Re-index an existing document (remove old vectors, re-ingest).
    
    Returns updated document record.
    """
    doc = await db.get_document(document_id)
    if not doc:
        raise ValueError(f"Document not found: {document_id}")

    # Remove old vectors
    try:
        await remove_document_vectors(document_id)
    except Exception as e:
        logger.warning(f"Failed to remove old vectors: {e}")

    # Find the file on disk
    from app.utils.file_utils import get_file_path
    file_path = get_file_path(document_id)
    if not file_path:
        await db.update_document(document_id, {
            "status": "error",
            "error_message": "Original file not found on disk",
        })
        raise ValueError("Original file not found on disk")

    # Re-run ingestion
    metadata = {
        "subject": doc["subject"],
        "semester": doc["semester"],
        "doc_type": doc["doc_type"],
        "title": doc["title"],
        "description": doc["description"],
        "tags": doc["tags"],
    }

    await ingest_document(
        file_path=file_path,
        document_id=document_id,
        original_filename=doc["original_filename"],
        user_metadata=metadata,
    )

    updated = await db.get_document(document_id)
    logger.info(f"Re-indexed document: {document_id}")
    return updated


async def update_document_metadata(document_id: str, updates: dict) -> dict:
    """Update document metadata fields."""
    doc = await db.get_document(document_id)
    if not doc:
        raise ValueError(f"Document not found: {document_id}")

    # Filter to allowed fields
    allowed = {"subject", "semester", "doc_type", "title", "description", "tags"}
    filtered = {k: v for k, v in updates.items() if k in allowed and v is not None}

    if filtered:
        await db.update_document(document_id, filtered)

    updated = await db.get_document(document_id)
    return updated
