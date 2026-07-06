# eli-shiru-backend/models/document.py
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship


class DocumentStatus(str, Enum):
    UPLOADED = "uploaded"
    INDEXING = "indexing"
    INDEXED = "indexed"
    FAILED = "failed"


class Document(SQLModel, table=True):
    """
    A single uploaded file (e.g. a PDF lecture note) that belongs to one Collection.
    Tracks processing state so the UI can show accurate upload/indexing progress.
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    collection_id: int = Field(foreign_key="collection.id", index=True)

    filename: str
    original_filename: str
    file_size_bytes: Optional[int] = None
    checksum: Optional[str] = None

    status: DocumentStatus = Field(default=DocumentStatus.UPLOADED)
    error_message: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    collection: "Collection" = Relationship(back_populates="documents")
    chunks: List["Chunk"] = Relationship(back_populates="document")