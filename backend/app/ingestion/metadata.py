"""Metadata extraction and enrichment for document chunks."""

from pathlib import Path
from app.utils.logging import get_logger

logger = get_logger("metadata")


def extract_document_metadata(
    file_path: str,
    loader_metadata: dict,
    user_metadata: dict,
) -> dict:
    """Merge loader-extracted metadata with user-provided metadata.
    
    User-provided metadata takes precedence over auto-extracted values.
    
    Args:
        file_path: Path to the uploaded file
        loader_metadata: Metadata from the document loader (title, author, etc.)
        user_metadata: Metadata from the upload form (subject, semester, etc.)
    
    Returns:
        Merged metadata dict
    """
    filename = Path(file_path).name

    # Start with defaults
    metadata = {
        "title": "",
        "subject": "",
        "semester": "",
        "doc_type": _guess_doc_type(filename),
        "description": "",
        "tags": "",
    }

    # Layer on loader metadata
    if loader_metadata.get("title"):
        metadata["title"] = loader_metadata["title"]
    if loader_metadata.get("subject"):
        metadata["subject"] = loader_metadata["subject"]

    # Layer on user metadata (highest priority)
    for key in ["title", "subject", "semester", "doc_type", "description", "tags"]:
        if user_metadata.get(key):
            metadata[key] = user_metadata[key]

    # Fallback title to filename
    if not metadata["title"]:
        metadata["title"] = Path(file_path).stem.replace("_", " ").replace("-", " ").title()

    logger.debug(f"Extracted metadata for {filename}: {metadata}")
    return metadata


def _guess_doc_type(filename: str) -> str:
    """Heuristic doc_type from filename patterns."""
    name = filename.lower()
    patterns = {
        "pyq": ["pyq", "previous year", "past paper", "exam paper", "question paper"],
        "notes": ["notes", "lecture", "class notes"],
        "textbook": ["textbook", "book", "chapter"],
        "assignment": ["assignment", "homework", "hw", "problem set"],
        "paper": ["paper", "research", "journal", "arxiv"],
    }
    for doc_type, keywords in patterns.items():
        if any(kw in name for kw in keywords):
            return doc_type
    return ""
