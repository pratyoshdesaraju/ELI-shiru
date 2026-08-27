# eli-shiru-backend/test_extraction_batch.py
"""
One-off manual verification script for P0-05.

Run this from inside eli-shiru-backend/ with the venv active:
    python3 test_extraction_batch.py

Points at docs/RAG Documents/ (adjust RAG_DOCS_DIR below if your path differs)
and runs extract_pages() against every PDF, reporting page counts, any
empty pages, and any files that raise PDFExtractionError.

This is a throwaway diagnostic script, not part of the app -- delete it
once P0-05 is verified, or leave it in a scripts/ folder if you want to
re-run this kind of check after future extraction changes.
"""

from pathlib import Path
from services.extraction import extract_pages, PDFExtractionError

RAG_DOCS_DIR = Path("../docs/RAG Documents")

pdf_files = sorted(RAG_DOCS_DIR.glob("*.pdf"))
print(f"Found {len(pdf_files)} PDF files.\n")

succeeded = 0
failed = 0
total_empty_pages = 0

for pdf_path in pdf_files:
    try:
        pages = extract_pages(pdf_path)
        empty_pages = [p for p, text in pages if text == ""]
        total_empty_pages += len(empty_pages)
        succeeded += 1
        print(
            f"OK   {pdf_path.name!r}: {len(pages)} pages, "
            f"{len(empty_pages)} empty, "
            f"first page starts: {pages[0][1][:60]!r}"
        )
    except PDFExtractionError as e:
        failed += 1
        print(f"FAIL {pdf_path.name!r}: {e}")

print(f"\n{succeeded} succeeded, {failed} failed, {total_empty_pages} total empty pages across all successes.")
