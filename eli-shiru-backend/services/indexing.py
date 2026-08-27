# eli-shiru-backend/services/indexing.py
"""
Background indexing orchestration (P0-04), now driving real extraction
(P0-05) and paragraph-based chunking (P0-06).

This module owns the *pipeline trigger and status tracking* for turning an
uploaded Document into an indexed one. As of P0-06, it drives page-aware
PDF extraction and paragraph-based chunking with provenance metadata.
Embedding (P0-07) will still be added to this same function as that story
lands -- the state machine around it doesn't change.

Design notes (why it's built this way):
- Runs via FastAPI's BackgroundTasks, so it executes after the HTTP response
  is already sent to the client. Because of that, it CANNOT reuse the
  request-scoped session from Depends(get_session) -- that session's lifetime
  is tied to the request, not to this task. So this module opens its own
  Session directly from the shared engine.
- Status is committed in two separate steps (UPLOADED -> INDEXING, then
  INDEXING -> INDEXED/FAILED) so the INDEXING state is actually observable
  by the frontend while work is happening, not just a value that flashes by.
- Single-user, local-first app -> BackgroundTasks is the pragmatic choice
  over a persistent job queue. The tradeoff we're accepting: if the app
  process dies mid-index, the Document row stays stuck on INDEXING with no
  automatic recovery. Document.status/error_message are the durable record
  P1-01 (re-index and retry) will read from later -- retrying will just mean
  calling index_document() again for any document sitting in FAILED (or a
  stale INDEXING) state.
- P0-05 note: extraction failures (PDFExtractionError) are caught by the
  same broad except block that already existed for the placeholder. A bad
  PDF is not a bug in this code -- it's an expected, user-facing failure
  mode (per P0-05's acceptance criteria: "documents that cannot be
  extracted reliably fail clearly"), so it flows through the existing
  FAILED path with a real error message instead of a special case.
- P0-06 note: chunking is a pure in-memory transformation (services/chunking.py)
  that does not touch the database. This function is the one place that
  takes chunk_pages()'s output and actually constructs + persists Chunk
  rows, so chunking.py stays independently testable and free of any
  database/session concerns.
- P0-06 note: on re-indexing (a document that already has Chunk rows from a
  previous run), existing chunks for this document are deleted before new
  ones are inserted. This keeps re-processing idempotent -- re-running the
  pipeline replaces old chunks rather than appending duplicates alongside
  them. Without this, re-indexing the same document twice would silently
  double every chunk in retrieval later.
"""

from sqlmodel import Session, select

from database import engine
from models import Document, DocumentStatus, Chunk
from services.storage import get_file_path
from services.extraction import extract_pages, PDFExtractionError
from services.chunking import chunk_pages


def index_document(document_id: int) -> None:
    """
    Entry point handed to BackgroundTasks. Owns its own DB session because
    it runs after the request/response cycle that created the original
    session has already ended.
    """
    with Session(engine) as session:
        document = session.get(Document, document_id)
        if document is None:
            # Nothing to do -- there's no row left to mark as failed.
            return

        document.status = DocumentStatus.INDEXING
        document.error_message = None
        session.add(document)
        session.commit()

        try:
            _run_pipeline(document, session)
        except Exception as e:
            document.status = DocumentStatus.FAILED
            document.error_message = f"Indexing failed: {e}"
            session.add(document)
            session.commit()
            return

        document.status = DocumentStatus.INDEXED
        session.add(document)
        session.commit()


def _run_pipeline(document: Document, session: Session) -> None:
    """
    Runs the indexing pipeline stages that exist so far.

    P0-05: extract page-aware text from the stored PDF.
    P0-06: split extracted pages into paragraph-based chunks and persist
    them as Chunk rows, replacing any chunks left over from a prior run.
    P0-07 (embedding) will extend this function with its own stage as it
    lands -- index_document()'s structure above does not need to change
    when it does.
    """
    file_path = get_file_path(
        collection_id=document.collection_id,
        document_id=document.id,
        filename=document.filename,
    )

    # (page_number, page_text) pairs, one per PDF page. Raises
    # PDFExtractionError if the file can't be opened or has no extractable
    # text at all -- that exception propagates up to index_document(),
    # which marks the Document FAILED with the error message.
    pages = extract_pages(file_path)

    # Pure in-memory paragraph splitting -- see services/chunking.py for the
    # splitting rule and why this first pass is deliberately unrefined.
    chunk_records = chunk_pages(pages)

    # Re-indexing safety: clear out any chunks from a previous run before
    # inserting new ones, so re-processing never leaves orphaned duplicates
    # behind for this document.
    existing_chunks = session.exec(
        select(Chunk).where(Chunk.document_id == document.id)
    ).all()
    for old_chunk in existing_chunks:
        session.delete(old_chunk)

    for record in chunk_records:
        session.add(
            Chunk(
                document_id=document.id,
                text=record["text"],
                page_start=record["page_start"],
                page_end=record["page_end"],
                chunk_index=record["chunk_index"],
            )
        )

    session.commit()

    # P0-07 will consume these Chunk rows here to generate embeddings.