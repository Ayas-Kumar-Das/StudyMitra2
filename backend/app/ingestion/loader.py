"""Document loaders for PDF and Markdown files.

Each loader returns a list of structured sections:
    {
        "text": str,
        "page_number": int | None,
        "heading": str,
        "heading_level": int,  # 0 = body text, 1-6 = heading levels
        "is_heading": bool,
    }
"""

import re
from pathlib import Path
from typing import Any

import fitz  # PyMuPDF
import frontmatter

from app.utils.logging import get_logger

logger = get_logger("loader")


# ── PDF Loader ───────────────────────────────────────────────────────────

def load_pdf(file_path: str) -> dict[str, Any]:
    """Extract structured content from a PDF file.
    
    Uses PyMuPDF to extract text block-by-block, detecting headings 
    via font size and bold style relative to the document's body text.
    
    Returns:
        {
            "sections": [structured section dicts],
            "total_pages": int,
            "toc": [[level, title, page], ...],
            "metadata": {title, author, ...}
        }
    """
    doc = fitz.open(file_path)
    total_pages = len(doc)

    # Extract table of contents if available
    toc = doc.get_toc()
    pdf_meta = doc.metadata or {}

    # First pass: collect all font sizes to determine body text size
    font_sizes: list[float] = []
    for page in doc:
        blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]
        for block in blocks:
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    text = span.get("text", "").strip()
                    if len(text) > 5:  # ignore tiny fragments
                        font_sizes.append(span.get("size", 12))

    body_size = _median(font_sizes) if font_sizes else 12.0

    # Second pass: extract sections
    sections: list[dict] = []
    current_heading = ""
    current_heading_level = 0

    for page_num, page in enumerate(doc, 1):
        blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]

        for block in blocks:
            if block.get("type") != 0:
                continue

            lines = block.get("lines", [])
            block_text_parts: list[str] = []
            block_max_size = 0.0
            block_is_bold = False

            for line in lines:
                line_text_parts: list[str] = []
                for span in line.get("spans", []):
                    text = span.get("text", "")
                    line_text_parts.append(text)
                    size = span.get("size", 12)
                    block_max_size = max(block_max_size, size)
                    font_name = span.get("font", "").lower()
                    if "bold" in font_name or "heavy" in font_name:
                        block_is_bold = True
                block_text_parts.append(" ".join(line_text_parts))

            text = "\n".join(block_text_parts).strip()
            if not text or len(text) < 2:
                continue

            # Determine if this block is a heading
            is_heading = False
            heading_level = 0

            if block_max_size > body_size * 1.15:
                is_heading = True
                if block_max_size > body_size * 1.5:
                    heading_level = 1
                elif block_max_size > body_size * 1.25:
                    heading_level = 2
                else:
                    heading_level = 3
            elif block_is_bold and len(text) < 120:
                is_heading = True
                heading_level = 3

            if is_heading:
                current_heading = text
                current_heading_level = heading_level

            sections.append({
                "text": text,
                "page_number": page_num,
                "heading": current_heading,
                "heading_level": heading_level if is_heading else 0,
                "is_heading": is_heading,
            })

    doc.close()
    logger.info(f"Loaded PDF: {Path(file_path).name} ({total_pages} pages, {len(sections)} sections)")

    return {
        "sections": sections,
        "total_pages": total_pages,
        "toc": toc,
        "metadata": {
            "title": pdf_meta.get("title", ""),
            "author": pdf_meta.get("author", ""),
            "subject": pdf_meta.get("subject", ""),
        },
    }


# ── Markdown Loader ──────────────────────────────────────────────────────

def load_markdown(file_path: str) -> dict[str, Any]:
    """Extract structured content from a Markdown file.
    
    Parses frontmatter (YAML) for metadata, then splits content
    by headings to create structured sections.
    """
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        post = frontmatter.load(f)

    content = post.content
    fm_metadata = dict(post.metadata) if post.metadata else {}

    # Split by headings
    heading_pattern = re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE)
    sections: list[dict] = []

    matches = list(heading_pattern.finditer(content))

    if not matches:
        # No headings — treat entire content as one section
        sections.append({
            "text": content.strip(),
            "page_number": None,
            "heading": "",
            "heading_level": 0,
            "is_heading": False,
        })
    else:
        # Content before first heading
        if matches[0].start() > 0:
            pre_text = content[:matches[0].start()].strip()
            if pre_text:
                sections.append({
                    "text": pre_text,
                    "page_number": None,
                    "heading": "",
                    "heading_level": 0,
                    "is_heading": False,
                })

        for i, match in enumerate(matches):
            level = len(match.group(1))
            title = match.group(2).strip()

            # Get content between this heading and the next
            start = match.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
            body = content[start:end].strip()

            # Add heading section
            sections.append({
                "text": title,
                "page_number": None,
                "heading": title,
                "heading_level": level,
                "is_heading": True,
            })

            # Add body section
            if body:
                sections.append({
                    "text": body,
                    "page_number": None,
                    "heading": title,
                    "heading_level": 0,
                    "is_heading": False,
                })

    logger.info(f"Loaded Markdown: {Path(file_path).name} ({len(sections)} sections)")

    return {
        "sections": sections,
        "total_pages": 0,
        "toc": [],
        "metadata": fm_metadata,
    }


# ── Plain Text Loader ────────────────────────────────────────────────────

def load_text(file_path: str) -> dict[str, Any]:
    """Load a plain text file as a single section."""
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read().strip()

    sections = [{
        "text": content,
        "page_number": None,
        "heading": "",
        "heading_level": 0,
        "is_heading": False,
    }] if content else []

    logger.info(f"Loaded text: {Path(file_path).name} ({len(content)} chars)")

    return {
        "sections": sections,
        "total_pages": 0,
        "toc": [],
        "metadata": {},
    }


# ── Dispatcher ───────────────────────────────────────────────────────────

def load_document(file_path: str) -> dict[str, Any]:
    """Load a document by dispatching to the appropriate loader."""
    ext = Path(file_path).suffix.lower()
    loaders = {
        ".pdf": load_pdf,
        ".md": load_markdown,
        ".txt": load_text,
    }

    loader = loaders.get(ext)
    if not loader:
        raise ValueError(f"Unsupported file type: {ext}")

    return loader(file_path)


# ── Helpers ──────────────────────────────────────────────────────────────

def _median(values: list[float]) -> float:
    """Calculate median of a list of numbers."""
    if not values:
        return 0.0
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    if n % 2 == 0:
        return (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2
    return sorted_vals[n // 2]
