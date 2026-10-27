"""Document management API routes."""

import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import Optional

from app.services.document_service import (
    upload_and_ingest,
    delete_document_full,
    reindex_document,
    update_document_metadata,
)
from app.services.library_service import get_all_documents, get_library_stats, get_subjects
from app.db import database as db
from app.utils.logging import get_logger

logger = get_logger("api.documents")
router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    subject: str = Form(""),
    semester: str = Form(""),
    doc_type: str = Form(""),
    title: str = Form(""),
    description: str = Form(""),
    tags: str = Form(""),
):
    """Upload and ingest a document.
    
    Accepts PDF, Markdown, or plain text files with optional metadata.
    The document is processed, chunked, embedded, and stored immediately.
    """
    try:
        content = await file.read()

        if not content:
            raise HTTPException(status_code=400, detail="Empty file")

        metadata = {
            "subject": subject,
            "semester": semester,
            "doc_type": doc_type,
            "title": title,
            "description": description,
            "tags": tags,
        }

        doc = await upload_and_ingest(
            file_content=content,
            original_filename=file.filename or "unknown",
            metadata=metadata,
        )

        return {"status": "success", "document": doc}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Upload error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("")
async def list_documents(
    subject: Optional[str] = Query(None),
    doc_type: Optional[str] = Query(None),
):
    """List all documents with optional filtering."""
    try:
        documents = await get_all_documents(subject=subject, doc_type=doc_type)
        stats = await get_library_stats()
        return {
            "documents": documents,
            "total": len(documents),
            "stats": stats,
        }
    except Exception as e:
        logger.error(f"List documents error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subjects")
async def list_subjects():
    """Get all unique subjects."""
    subjects = await get_subjects()
    return {"subjects": subjects}


@router.get("/stats")
async def document_stats():
    """Get library statistics."""
    stats = await get_library_stats()
    return stats


@router.get("/{document_id}")
async def get_document(document_id: str):
    """Get a single document's details."""
    doc = await db.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"document": doc}


@router.put("/{document_id}")
async def update_document(document_id: str, updates: dict):
    """Update document metadata."""
    try:
        doc = await update_document_metadata(document_id, updates)
        return {"status": "success", "document": doc}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Update error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Delete a document and all its vectors."""
    success = await delete_document_full(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "success", "message": "Document deleted"}


@router.post("/{document_id}/reindex")
async def reindex(document_id: str):
    """Re-index a document (remove old vectors and re-ingest)."""
    try:
        doc = await reindex_document(document_id)
        return {"status": "success", "document": doc}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Re-index error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
