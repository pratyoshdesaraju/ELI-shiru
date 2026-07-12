# eli-shiru-backend/routers/collections.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select

from database import get_session
from models import Collection, Document, DocumentStatus
from schemas import (
    CollectionCreateRequest,
    CollectionResponse,
    CollectionDetailResponse,
    DocumentResponse,
)
from services.storage import save_file, delete_file

router = APIRouter()

ALLOWED_CONTENT_TYPES = {"application/pdf"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB safety cap


def _to_collection_response(collection: Collection) -> CollectionResponse:
    return CollectionResponse(
        id=collection.id,
        name=collection.name,
        created_at=collection.created_at,
        document_count=len(collection.documents),
    )


@router.post("/collections", response_model=CollectionResponse)
def create_collection(
    payload: CollectionCreateRequest,
    session: Session = Depends(get_session),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Collection name cannot be empty.")

    collection = Collection(name=name)
    session.add(collection)
    session.commit()
    session.refresh(collection)
    return _to_collection_response(collection)


@router.get("/collections", response_model=List[CollectionResponse])
def list_collections(session: Session = Depends(get_session)):
    collections = session.exec(select(Collection)).all()
    return [_to_collection_response(c) for c in collections]


@router.get("/collections/{collection_id}", response_model=CollectionDetailResponse)
def get_collection(collection_id: int, session: Session = Depends(get_session)):
    collection = session.get(Collection, collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found.")

    return CollectionDetailResponse(
        id=collection.id,
        name=collection.name,
        created_at=collection.created_at,
        document_count=len(collection.documents),
        documents=[DocumentResponse.model_validate(d) for d in collection.documents],
    )


@router.post(
    "/collections/{collection_id}/documents",
    response_model=List[DocumentResponse],
)
async def upload_documents(
    collection_id: int,
    files: List[UploadFile] = File(...),
    session: Session = Depends(get_session),
):
    collection = session.get(Collection, collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found.")

    if not files:
        raise HTTPException(status_code=400, detail="No files were provided.")

    created_documents: List[Document] = []

    for upload in files:
        if upload.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type for '{upload.filename}'. Only PDF is allowed.",
            )

        file_bytes = await upload.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"'{upload.filename}' is empty.",
            )

        if len(file_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"'{upload.filename}' exceeds the {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB limit.",
            )

        document = Document(
            collection_id=collection_id,
            filename=upload.filename,
            original_filename=upload.filename,
            status=DocumentStatus.UPLOADED,
        )
        session.add(document)
        session.commit()
        session.refresh(document)

        try:
            _, file_size_bytes, checksum = save_file(
                collection_id=collection_id,
                document_id=document.id,
                filename=document.filename,
                file_bytes=file_bytes,
            )
        except Exception as e:
            document.status = DocumentStatus.FAILED
            document.error_message = f"Failed to save file: {e}"
            session.add(document)
            session.commit()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save '{upload.filename}'.",
            )

        document.file_size_bytes = file_size_bytes
        document.checksum = checksum
        session.add(document)
        session.commit()
        session.refresh(document)

        created_documents.append(document)

    return [DocumentResponse.model_validate(d) for d in created_documents]


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, session: Session = Depends(get_session)):
    document = session.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    return DocumentResponse.model_validate(document)


@router.delete("/documents/{document_id}")
def delete_document(document_id: int, session: Session = Depends(get_session)):
    document = session.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    delete_file(
        collection_id=document.collection_id,
        document_id=document.id,
        filename=document.filename,
    )

    session.delete(document)
    session.commit()
    return {"deleted": True, "document_id": document_id}