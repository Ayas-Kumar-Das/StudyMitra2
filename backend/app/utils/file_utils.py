"""File validation and storage utilities."""

import os
import uuid
import shutil
from pathlib import Path

from app.config import get_settings
from app.utils.logging import get_logger

logger = get_logger("file_utils")


def validate_file(filename: str, file_size: int) -> tuple[bool, str]:
    """Validate uploaded file by extension and size.
    
    Returns (is_valid, error_message).
    """
    settings = get_settings()
    ext = Path(filename).suffix.lower()

    if ext not in settings.allowed_extensions_list:
        return False, f"File type '{ext}' not allowed. Supported: {settings.ALLOWED_EXTENSIONS}"

    if file_size > settings.max_file_size_bytes:
        return False, f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit"

    return True, ""


def save_upload(file_content: bytes, original_filename: str) -> tuple[str, str]:
    """Save uploaded file to disk with a unique name.
    
    Returns (file_id, saved_path).
    """
    settings = get_settings()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    file_id = uuid.uuid4().hex
    ext = Path(original_filename).suffix.lower()
    safe_filename = f"{file_id}{ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(saved_path, "wb") as f:
        f.write(file_content)

    logger.info(f"Saved upload: {original_filename} → {safe_filename} ({len(file_content)} bytes)")
    return file_id, saved_path


def delete_upload(file_id: str) -> bool:
    """Delete an uploaded file from disk."""
    settings = get_settings()
    upload_dir = Path(settings.UPLOAD_DIR)

    for file_path in upload_dir.iterdir():
        if file_path.stem == file_id:
            file_path.unlink()
            logger.info(f"Deleted upload: {file_path.name}")
            return True

    logger.warning(f"Upload not found for deletion: {file_id}")
    return False


def get_file_path(file_id: str) -> str | None:
    """Get the full path of an uploaded file by its ID."""
    settings = get_settings()
    upload_dir = Path(settings.UPLOAD_DIR)

    for file_path in upload_dir.iterdir():
        if file_path.stem == file_id:
            return str(file_path)

    return None
