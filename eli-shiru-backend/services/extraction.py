# eli-shiru-backend/services/extraction.py
"""
Page-aware PDF extraction (P0-05).

This module owns exactly one job: turn a PDF file on disk into a list of
(page_number, page_text) pairs. It does NOT chunk, embed, or touch the
database -- that separation matters because this function should be usable
and testable completely on its own, independent of the indexing pipeline
that calls it.

Design notes (why it's built this way):
- Returns List[Tuple[int, str]] -- one entry per PDF page -- instead of a
  single concatenated string. This is the core design decision for this
  story: PDFs naturally give you text per page, and once you flatten that
  into one blob, page provenance is gone forever. Every later story that
  depends on "which page did this text come from" (P0-06 chunking,
  P0-12 source drawer) reads that information out of this list's structure,
  not by re-parsing text.
- page_number is 1-indexed to match how a learner reads and refers to pages
  in a real PDF (page_number=1 is what a human calls "page 1"), not the
  0-indexed position pdfplumber uses internally.
- A page with no extractable text (e.g. a scanned image with no text layer)
  produces an empty string for that page rather than being skipped. Skipping
  it would silently shift page numbers for every page after it, which would
  corrupt provenance for the rest of the document. An empty string preserves
  the page's slot in the sequence and lets the caller decide what "empty"
  means.
- If every single page comes back empty, that's treated as a hard failure
  (PDFExtractionError) rather than a "successful" extraction of nothing.
  A document that silently indexes as INDEXED with zero usable content
  would be worse than a document that's honestly marked FAILED.
"""

from pathlib import Path
from typing import List, Tuple

import pdfplumber


class PDFExtractionError(Exception):
    """Raised when a PDF cannot be opened, or yields no extractable text at all."""


def extract_pages(file_path: Path) -> List[Tuple[int, str]]:
    """
    Extract text from a PDF, page by page.

    Returns a list of (page_number, page_text) tuples, one per page, in
    document order. page_number is 1-indexed. page_text is "" for a page
    that produced no extractable text (e.g. a scanned image), rather than
    that page being omitted from the list.

    Raises PDFExtractionError if the file cannot be opened as a PDF, or if
    every page comes back with no extractable text.
    """
    try:
        with pdfplumber.open(file_path) as pdf:
            pages: List[Tuple[int, str]] = []
            for index, page in enumerate(pdf.pages):
                page_number = index + 1
                text = page.extract_text() or ""
                pages.append((page_number, text.strip()))
    except PDFExtractionError:
        raise
    except Exception as e:
        raise PDFExtractionError(f"Could not open or read PDF: {e}") from e

    if not pages:
        raise PDFExtractionError("PDF contains no pages.")

    if all(text == "" for _, text in pages):
        raise PDFExtractionError(
            "No extractable text found on any page. "
            "This usually means the PDF is a scanned image with no text layer."
        )

    return pages