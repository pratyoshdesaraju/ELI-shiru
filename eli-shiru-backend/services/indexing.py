# eli-shiru-backend/services/indexing.py
"""
Background indexing orchestration (P0-04), now driving real extraction (P0-05).

This module owns the *pipeline trigger and status tracking* for turning an
uploaded Document into an indexed one. As of P0-05, it drives page-aware PDF
extraction. Chunking and embedding (P0-06, P0-07) still happen inside
_run_pipeline for now, and will be added to this same function as each story
lands -- the state machine around it doesn't change.

Design notes (why it's built this way):
- Runs via FastAPI's BackgroundTasks, so it executes after the HTTP response
  is already sent to the client. Because of that, it CANNOT reuse the
  request-scoped session from `Depends(get_session)` -- that session's
  lifetime is tied to the request, not to this task. So this module opens
  its own Session directly from the shared `engine`.
- Status is committed in two separate steps (UPLOADED -> INDEXING, then
  INDEXING -> INDEXED/FAILED) so the "INDEXING" state is actually observable
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
"""

from sqlmodel import Session

from database import engine
from models import Document, DocumentStatus
from services.storage import get_file_path
from services.extraction import extract_pages, PDFExtractionError


def index_document(document_id: int) -> None:
    """
    Entry point handed to BackgroundTasks. Owns its own DB session because
    it runs after the request/response cycle that created the original
    session has already ended.
    """
    with Session(engine) as session:
        document = session.get(Document, document_id)
        if document is None:
            # Document was deleted between upload and indexing kicking off.
            # Nothing to do -- there's no row left to mark as failed.
            return

        document.status = DocumentStatus.INDEXING
        document.error_message = None
        session.add(document)
        session.commit()

        try:
            _run_pipeline(document)
        except Exception as e:
            document.status = DocumentStatus.FAILED
            document.error_message = f"Indexing failed: {e}"
            session.add(document)
            session.commit()
            return

        document.status = DocumentStatus.INDEXED
        session.add(document)
        session.commit()


def _run_pipeline(document: Document) -> None:
    """
    Runs the indexing pipeline stages that exist so far.

    P0-05: extract page-aware text from the stored PDF.
    P0-06 (chunking) and P0-07 (embedding) will extend this function with
    their own stages as they land -- index_document()'s structure above
    does not need to change when they do.
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

    # P0-06 will consume `pages` here to build Chunk rows.
    # P0-07 will consume those chunks to generate embeddings.