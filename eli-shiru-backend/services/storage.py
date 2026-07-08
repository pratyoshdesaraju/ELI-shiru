# eli-shiru-backend/services/storage.py
import hashlib
from pathlib import Path
from typing import Tuple

from config import UPLOAD_ROOT


def _document_dir(collection_id: int, document_id: int) -> Path:
    """
    Deterministic folder for one document's file.
    Always resolves the same way given the same ids —
    no randomness, no timestamps in the path.
    """
    return UPLOAD_ROOT / "collections" / str(collection_id) / "documents" / str(document_id)


def get_file_path(collection_id: int, document_id: int, filename: str) -> Path:
    """
    Returns the full path where a document's file lives (or will live).
    Does not touch the filesystem — pure path calculation.
    """
    return _document_dir(collection_id, document_id) / filename


def save_file(
    collection_id: int,
    document_id: int,
    filename: str,
    file_bytes: bytes,
) -> Tuple[Path, int, str]:
    """
    Writes file_bytes to disk at the deterministic path for this
    collection/document pair. Returns (path, size_in_bytes, sha256_checksum)
    so the caller can persist those facts on the Document row.
    """
    target_dir = _document_dir(collection_id, document_id)
    target_dir.mkdir(parents=True, exist_ok=True)

    target_path = target_dir / filename

    checksum = hashlib.sha256(file_bytes).hexdigest()
    file_size_bytes = len(file_bytes)

    with open(target_path, "wb") as f:
        f.write(file_bytes)

    return target_path, file_size_bytes, checksum


def delete_file(collection_id: int, document_id: int, filename: str) -> bool:
    """
    Deletes the stored file for a document, if it exists.
    Returns True if a file was actually deleted, False if it was already gone.
    Never raises just because the file is missing — deletion should be idempotent.
    """
    target_path = get_file_path(collection_id, document_id, filename)

    if target_path.exists():
        target_path.unlink()
        # Clean up now-empty parent directory (the document's own folder)
        try:
            target_path.parent.rmdir()
        except OSError:
            pass  # not empty, or already gone — that's fine
        return True

    return False
