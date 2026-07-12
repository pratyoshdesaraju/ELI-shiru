# eli-shiru-backend/schemas.py
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from models import DocumentStatus


class CollectionCreateRequest(BaseModel):
    name: str


class DocumentResponse(BaseModel):
    id: int
    original_filename: str
    status: DocumentStatus
    file_size_bytes: Optional[int]
    checksum: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CollectionResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    document_count: int

    class Config:
        from_attributes = True


class CollectionDetailResponse(CollectionResponse):
    documents: List[DocumentResponse]