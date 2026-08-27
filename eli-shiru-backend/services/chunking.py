# eli-shiru-backend/services/chunking.py
"""
Paragraph-based chunking with provenance metadata (P0-06).

This module owns exactly one job: turn the page-aware output of
extract_pages() -- a list of (page_number, page_text) pairs -- into a list
of chunk records ready to be persisted as Chunk rows. It does NOT touch the
database itself; the caller (indexing.py) is responsible for constructing
and saving Chunk model instances from what this returns.

Design notes (why it's built this way):
- Splitting rule: a paragraph boundary is one or more consecutive blank
  lines (regex `\n\s*\n+`). This mirrors how pdfplumber represents visual
  paragraph spacing in extracted PDF text -- wrapped lines within a
  paragraph come back as single newlines, while a real paragraph break
  produces a blank line between blocks.
- This is a deliberately "pure" first pass: no merging of short paragraphs,
  no splitting of long ones, no target chunk-size enforcement. The goal
  right now is to observe the real distribution of paragraph lengths across
  the actual corpus before deciding whether size-based refinement is worth
  the added complexity. Treat any later merge/split logic as a separate,
  deliberate change -- not something to sneak in here.
- Every chunk is scoped to exactly one page. page_start and page_end are
  always equal in this version, even though the Chunk model supports a
  range. A paragraph that is visually split across a PDF page break becomes
  two separate chunks, one per page, each with fully correct single-page
  provenance -- rather than attempting to detect and stitch fragments back
  together, which would reintroduce the "pure paragraph" experiment's
  variability and contradicts the goal of observing raw paragraph lengths.
- Empty-string pages (from extract_pages(), e.g. scanned pages with no text
  layer) produce zero chunks for that page, not an error and not a junk
  empty chunk.
- Whitespace-only or trivially short paragraph fragments are still kept as
  their own chunk (as long as they are non-empty after stripping). This is
  intentional for this pass: the point is to see the real variance in
  paragraph lengths, including the short/noisy ones, not to pre-filter them
  out before you've looked at the data.
- chunk_index is assigned sequentially across the *entire document*, not
  reset per page. This preserves the paragraph's position in reading order
  regardless of which page it's on, which is what "position in the
  document" means for the P0-06 acceptance criteria.
"""

import re
from typing import List, Tuple, TypedDict

PARAGRAPH_BREAK = re.compile(r"\n\s*\n+")


class ChunkRecord(TypedDict):
    text: str
    page_start: int
    page_end: int
    chunk_index: int


def chunk_pages(pages: List[Tuple[int, str]]) -> List[ChunkRecord]:
    """
    Split page-aware extracted text into paragraph-based chunks.

    `pages` is the output of extract_pages(): a list of (page_number,
    page_text) tuples, one per PDF page, in document order, 1-indexed.

    Returns a list of ChunkRecord dicts in document reading order, with
    chunk_index assigned sequentially across the whole document. Does not
    touch the database -- the caller builds Chunk rows from these records.
    """
    chunks: List[ChunkRecord] = []
    chunk_index = 0

    for page_number, page_text in pages:
        if not page_text or not page_text.strip():
            continue

        paragraphs = PARAGRAPH_BREAK.split(page_text)

        for paragraph in paragraphs:
            cleaned = paragraph.strip()
            if not cleaned:
                continue

            chunks.append(
                ChunkRecord(
                    text=cleaned,
                    page_start=page_number,
                    page_end=page_number,
                    chunk_index=chunk_index,
                )
            )
            chunk_index += 1

    return chunks