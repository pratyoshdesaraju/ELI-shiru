# ELI-Shiru Phase 2 Data Model — P0-01

## Purpose
This document records the domain model decisions for Collection, Document,
and Chunk, the three entities that give ELI-Shiru a structured, traceable
representation of a learner's study materials.

## Entities

### Collection
A named group of documents (e.g. "Intro Python"). A Collection is the
top-level container a learner uploads materials into and the scope used
for retrieval in Phase 2.

### Document
A single uploaded file that belongs to exactly one Collection. Tracks a
`status` (uploaded, indexing, indexed, failed) so the UI can show accurate
processing progress, and an `error_message` for transparent failure states.
File identity fields (`checksum`, `file_size_bytes`) support deterministic
local storage in P0-02.

### Chunk
A retrievable slice of a Document's extracted text. Carries `page_start`,
`page_end`, and `chunk_index` so any answer generated later can cite the
exact page and position it came from. This is the foundation for source
provenance in grounded answers (P0-08–P0-12).

## Relationships
- One Collection has many Documents.
- One Document has many Chunks.
- Chunks are never shared across Documents.

## Design notes
- `DocumentStatus` is a string enum for readability in the database and API responses.
- Timestamps are stored in UTC to avoid timezone ambiguity across environments.
- SQLite via SQLModel is used to preserve the local-first, offline-first architecture.