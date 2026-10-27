"""Structure-aware text chunking.

Chunks documents by respecting headings, paragraphs, and sentence 
boundaries instead of blindly splitting at fixed character counts.
"""

import re
import uuid
from typing import Any

from app.config import get_settings
from app.utils.logging import get_logger

logger = get_logger("chunker")


def chunk_sections(
    sections: list[dict],
    document_id: str,
    document_name: str,
    doc_metadata: dict,
) -> list[dict]:
    """Convert structured sections into overlapping chunks with metadata.
    
    Strategy:
    1. Group body sections under their headings
    2. Build logical sections (heading + body content)
    3. Split oversized sections at paragraph then sentence boundaries
    4. Add overlap between chunks
    5. Attach metadata to every chunk
    
    Args:
        sections: Structured sections from the loader
        document_id: Parent document ID
        document_name: Original filename
        doc_metadata: Document-level metadata (subject, semester, etc.)
    
    Returns:
        List of chunk dicts ready for embedding and storage
    """
    settings = get_settings()
    max_size = settings.CHUNK_SIZE
    overlap = settings.CHUNK_OVERLAP

    # Phase 1: Group sections into logical blocks under headings
    logical_blocks = _group_under_headings(sections)

    # Phase 2: Split oversized blocks
    raw_chunks: list[dict] = []
    for block in logical_blocks:
        text = block["text"]
        if len(text.split()) <= max_size:
            raw_chunks.append(block)
        else:
            splits = _split_text(text, max_size, overlap)
            for i, split_text in enumerate(splits):
                raw_chunks.append({
                    **block,
                    "text": split_text,
                    "split_index": i,
                })

    # Phase 3: Build final chunks with metadata and IDs
    chunks: list[dict] = []
    heading_path: list[str] = []

    for idx, block in enumerate(raw_chunks):
        # Track heading hierarchy
        if block.get("heading") and block.get("heading_level", 0) > 0:
            level = block["heading_level"]
            # Trim path to current level
            heading_path = heading_path[:level - 1]
            heading_path.append(block["heading"])

        chunk_id = uuid.uuid4().hex

        page_num = block.get("page_number")
        page_numbers = block.get("page_numbers", [page_num] if page_num else [])

        chunk = {
            "id": chunk_id,
            "text": block["text"],
            "document_id": document_id,
            "document_name": document_name,
            "chunk_index": idx,
            "page_number": page_num,
            "page_numbers": page_numbers,
            "chapter": heading_path[0] if heading_path else "",
            "section": heading_path[-1] if heading_path else "",
            "heading_path": list(heading_path),
            "doc_type": doc_metadata.get("doc_type", ""),
            "subject": doc_metadata.get("subject", ""),
            "semester": doc_metadata.get("semester", ""),
        }
        chunks.append(chunk)

    logger.info(
        f"Chunked '{document_name}': {len(sections)} sections → "
        f"{len(logical_blocks)} blocks → {len(chunks)} chunks"
    )
    return chunks


def _group_under_headings(sections: list[dict]) -> list[dict]:
    """Group consecutive body sections under their preceding heading.
    
    Merges heading text with its body to create semantically 
    coherent blocks.
    """
    blocks: list[dict] = []
    current_block: dict | None = None

    for section in sections:
        if section.get("is_heading"):
            # Flush previous block
            if current_block and current_block["text"].strip():
                blocks.append(current_block)

            current_block = {
                "text": section["text"],
                "heading": section.get("heading", ""),
                "heading_level": section.get("heading_level", 0),
                "page_number": section.get("page_number"),
                "page_numbers": [section["page_number"]] if section.get("page_number") else [],
            }
        else:
            if current_block is None:
                current_block = {
                    "text": "",
                    "heading": "",
                    "heading_level": 0,
                    "page_number": section.get("page_number"),
                    "page_numbers": [],
                }

            if current_block["text"]:
                current_block["text"] += "\n\n" + section["text"]
            else:
                current_block["text"] = section["text"]

            # Track page numbers
            page = section.get("page_number")
            if page and page not in current_block.get("page_numbers", []):
                current_block.setdefault("page_numbers", []).append(page)

    # Flush last block
    if current_block and current_block["text"].strip():
        blocks.append(current_block)

    return blocks


def _split_text(text: str, max_words: int, overlap_words: int) -> list[str]:
    """Split text into chunks respecting paragraph and sentence boundaries.
    
    Priority: paragraph breaks > sentence breaks > word breaks.
    """
    # Try splitting by paragraphs first
    paragraphs = re.split(r"\n\s*\n", text)
    paragraphs = [p.strip() for p in paragraphs if p.strip()]

    if not paragraphs:
        return [text]

    chunks: list[str] = []
    current_chunk: list[str] = []
    current_word_count = 0

    for para in paragraphs:
        para_words = len(para.split())

        if current_word_count + para_words <= max_words:
            current_chunk.append(para)
            current_word_count += para_words
        else:
            if current_chunk:
                chunks.append("\n\n".join(current_chunk))

            # If single paragraph exceeds max, split by sentences
            if para_words > max_words:
                sentence_chunks = _split_by_sentences(para, max_words)
                chunks.extend(sentence_chunks[:-1])
                current_chunk = [sentence_chunks[-1]] if sentence_chunks else []
                current_word_count = len(current_chunk[0].split()) if current_chunk else 0
            else:
                current_chunk = [para]
                current_word_count = para_words

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    # Add overlap between chunks
    if overlap_words > 0 and len(chunks) > 1:
        chunks = _add_overlap(chunks, overlap_words)

    return chunks


def _split_by_sentences(text: str, max_words: int) -> list[str]:
    """Split text by sentence boundaries."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks: list[str] = []
    current: list[str] = []
    current_count = 0

    for sentence in sentences:
        words = len(sentence.split())
        if current_count + words <= max_words:
            current.append(sentence)
            current_count += words
        else:
            if current:
                chunks.append(" ".join(current))
            current = [sentence]
            current_count = words

    if current:
        chunks.append(" ".join(current))

    return chunks


def _add_overlap(chunks: list[str], overlap_words: int) -> list[str]:
    """Add word-level overlap between consecutive chunks."""
    result = [chunks[0]]

    for i in range(1, len(chunks)):
        prev_words = chunks[i - 1].split()
        overlap_text = " ".join(prev_words[-overlap_words:])
        result.append(overlap_text + " " + chunks[i])

    return result
