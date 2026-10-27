"""Ingestion pipeline: orchestrates load → chunk → embed → store."""

from pathlib import Path

from app.ingestion.loader import load_document
from app.ingestion.chunker import chunk_sections
from app.ingestion.metadata import extract_document_metadata
from app.retrieval.embedder import get_embedder
from app.retrieval.vector_store import get_vector_store
from app.retrieval.keyword import get_keyword_searcher
from app.db import database as db
from app.utils.logging import get_logger

logger = get_logger("pipeline")


async def ingest_document(
    file_path: str,
    document_id: str,
    original_filename: str,
    user_metadata: dict,
) -> dict:
    """Run the full ingestion pipeline for a single document.
    
    Steps:
    1. Load document (extract structured content)
    2. Extract/merge metadata
    3. Chunk into structure-aware segments
    4. Generate embeddings for all chunks
    5. Store vectors + payloads in Qdrant
    6. Update BM25 keyword index
    7. Update document record in SQLite
    
    Args:
        file_path: Path to the uploaded file
        document_id: Unique document ID
        original_filename: Original filename from upload
        user_metadata: User-provided metadata dict
    
    Returns:
        Summary dict with chunk count, page count, etc.
    
    Raises:
        Exception: On any pipeline failure (status set to 'error')
    """
    try:
        # Mark as processing
        await db.update_document(document_id, {"status": "processing"})

        # Step 1: Load
        logger.info(f"Loading document: {original_filename}")
        loaded = load_document(file_path)
        sections = loaded["sections"]
        total_pages = loaded["total_pages"]
        loader_metadata = loaded.get("metadata", {})

        if not sections:
            await db.update_document(document_id, {
                "status": "error",
                "error_message": "No content could be extracted from the document",
            })
            return {"error": "No content extracted", "chunks": 0}

        # Step 2: Metadata
        doc_metadata = extract_document_metadata(file_path, loader_metadata, user_metadata)

        # Step 3: Chunk
        logger.info(f"Chunking {len(sections)} sections...")
        chunks = chunk_sections(
            sections=sections,
            document_id=document_id,
            document_name=original_filename,
            doc_metadata=doc_metadata,
        )

        if not chunks:
            await db.update_document(document_id, {
                "status": "error",
                "error_message": "Chunking produced no chunks",
            })
            return {"error": "No chunks produced", "chunks": 0}

        # Step 4: Embed
        logger.info(f"Embedding {len(chunks)} chunks...")
        embedder = get_embedder()
        texts = [c["text"] for c in chunks]
        embeddings = embedder.embed(texts)

        # Step 5: Store in Qdrant
        logger.info(f"Storing {len(chunks)} vectors in Qdrant...")
        vector_store = get_vector_store()
        await vector_store.upsert_chunks(chunks, embeddings)

        # Step 6: Update keyword index
        keyword_searcher = get_keyword_searcher()
        keyword_searcher.add_chunks(chunks)

        # Step 7: Update document record
        await db.update_document(document_id, {
            "status": "indexed",
            "total_chunks": len(chunks),
            "total_pages": total_pages,
            "title": doc_metadata.get("title", ""),
            "error_message": "",
        })

        result = {
            "document_id": document_id,
            "chunks": len(chunks),
            "pages": total_pages,
            "status": "indexed",
        }
        logger.info(f"✓ Ingested '{original_filename}': {len(chunks)} chunks, {total_pages} pages")
        return result

    except Exception as e:
        logger.error(f"✗ Ingestion failed for '{original_filename}': {e}", exc_info=True)
        await db.update_document(document_id, {
            "status": "error",
            "error_message": str(e)[:500],
        })
        raise


async def remove_document_vectors(document_id: str):
    """Remove all vectors for a document from Qdrant and keyword index."""
    vector_store = get_vector_store()
    await vector_store.delete_by_document(document_id)

    keyword_searcher = get_keyword_searcher()
    keyword_searcher.remove_document(document_id)

    logger.info(f"Removed vectors for document {document_id}")
