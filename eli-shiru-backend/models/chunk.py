# eli-shiru-backend/models/chunk.py
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class Chunk(SQLModel, table=True):
    """
    A retrievable slice of a Document's text, with enough provenance metadata
    (page range + order) to support later citation in grounded answers.
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="document.id", index=True)

    text: str
    page_start: int
    page_end: int
    chunk_index: int = Field(index=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    document: "Document" = Relationship(back_populates="chunks")