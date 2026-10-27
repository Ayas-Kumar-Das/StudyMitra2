"""Async SQLite database for document metadata storage."""

import os
import aiosqlite
from app.config import get_settings
from app.utils.logging import get_logger

logger = get_logger("database")

# Module-level connection reference
_db: aiosqlite.Connection | None = None

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    subject TEXT DEFAULT '',
    semester TEXT DEFAULT '',
    doc_type TEXT DEFAULT '',
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    total_chunks INTEGER DEFAULT 0,
    total_pages INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    error_message TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_subject ON documents(subject);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
"""


async def init_db() -> aiosqlite.Connection:
    """Initialize the database connection and create tables."""
    global _db
    settings = get_settings()
    os.makedirs(os.path.dirname(settings.DATABASE_PATH), exist_ok=True)

    _db = await aiosqlite.connect(settings.DATABASE_PATH)
    _db.row_factory = aiosqlite.Row
    await _db.executescript(SCHEMA_SQL)
    await _db.commit()
    logger.info(f"Database initialized at {settings.DATABASE_PATH}")
    return _db


async def get_db() -> aiosqlite.Connection:
    """Get the database connection."""
    global _db
    if _db is None:
        return await init_db()
    return _db


async def close_db():
    """Close the database connection."""
    global _db
    if _db is not None:
        await _db.close()
        _db = None
        logger.info("Database connection closed")


# ── Document CRUD ────────────────────────────────────────────────────────

async def insert_document(doc: dict) -> dict:
    """Insert a new document record."""
    db = await get_db()
    await db.execute(
        """INSERT INTO documents (id, filename, original_filename, file_type, file_size,
           subject, semester, doc_type, title, description, tags, status)
           VALUES (:id, :filename, :original_filename, :file_type, :file_size,
           :subject, :semester, :doc_type, :title, :description, :tags, :status)""",
        doc,
    )
    await db.commit()
    return doc


async def get_document(doc_id: str) -> dict | None:
    """Get a single document by ID."""
    db = await get_db()
    cursor = await db.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    row = await cursor.fetchone()
    return dict(row) if row else None


async def list_documents(
    subject: str | None = None,
    doc_type: str | None = None,
    status: str | None = None,
) -> list[dict]:
    """List documents with optional filtering."""
    db = await get_db()
    query = "SELECT * FROM documents WHERE 1=1"
    params: list = []

    if subject:
        query += " AND subject = ?"
        params.append(subject)
    if doc_type:
        query += " AND doc_type = ?"
        params.append(doc_type)
    if status:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY created_at DESC"
    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    return [dict(row) for row in rows]


async def update_document(doc_id: str, updates: dict) -> bool:
    """Update document fields."""
    db = await get_db()
    set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [doc_id]
    result = await db.execute(
        f"UPDATE documents SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        values,
    )
    await db.commit()
    return result.rowcount > 0


async def delete_document(doc_id: str) -> bool:
    """Delete a document record."""
    db = await get_db()
    result = await db.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    await db.commit()
    return result.rowcount > 0


async def get_subjects() -> list[str]:
    """Get distinct subjects."""
    db = await get_db()
    cursor = await db.execute(
        "SELECT DISTINCT subject FROM documents WHERE subject != '' ORDER BY subject"
    )
    rows = await cursor.fetchall()
    return [row["subject"] for row in rows]


async def get_document_stats() -> dict:
    """Get aggregate statistics."""
    db = await get_db()
    cursor = await db.execute(
        """SELECT 
            COUNT(*) as total_documents,
            COUNT(DISTINCT subject) as total_subjects,
            COALESCE(SUM(total_chunks), 0) as total_chunks,
            COALESCE(SUM(file_size), 0) as total_size_bytes
           FROM documents WHERE status = 'indexed'"""
    )
    row = await cursor.fetchone()
    return dict(row)
