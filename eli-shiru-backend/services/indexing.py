# eli-shiru-backend/services/indexing.py
"""
Background indexing orchestration (P0-04).

This module owns the *pipeline trigger and status tracking* for turning an
uploaded Document into an indexed one. It does NOT do extraction, chunking,
or embedding itself -- those are P0-05, P0-06, and P0-07. For now this file
contains a placeholder processing step so the state machine (UPLOADED ->
INDEXING -> INDEXED / FAILED) is real and demonstrable end-to-end, even
before the real pipeline stages exist.

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
"""

from sqlmodel import Session

from database import engine
from models import Document, DocumentStatus


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
            _run_pipeline_placeholder(document)
        except Exception as e:
            document.status = DocumentStatus.FAILED
            document.error_message = f"Indexing failed: {e}"
            session.add(document)
            session.commit()
            return

        document.status = DocumentStatus.INDEXED
        session.add(document)
        session.commit()


def _run_pipeline_placeholder(document: Document) -> None:
    """
    Stand-in for the real pipeline until P0-05 (extraction), P0-06
    (chunking), and P0-07 (embedding) exist. Intentionally does nothing
    beyond proving the orchestration path works. Replace the body of this
    function -- not index_document()'s structure -- as each later story
    lands.
    """
    pass