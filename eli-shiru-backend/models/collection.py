# eli-shiru-backend/models/collection.py
from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship


class Collection(SQLModel, table=True):
    """
    A named group of study materials (e.g. "Intro Python").
    A Collection is the top-level container a learner uploads documents into.
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    documents: List["Document"] = Relationship(back_populates="collection")