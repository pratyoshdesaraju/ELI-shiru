# ELI-Shiru Phase 2 Product Backlog

## Purpose

This document presents the Phase 2 backlog for ELI-Shiru from the product owner's point of view. Each story states the outcome expected for the product, the learner-facing or system-facing value it delivers, and the acceptance criteria used to confirm the story is truly done. Stories are grouped into five sequences that reflect the order of delivery for Phase 2.

**Status legend:** 🔲 Not Started · 🟡 In Progress · 🔵 In Review · ✅ Done · ⛔ Blocked

## Status overview

| Story | Title | Status |
|---|---|---|
| P0-01 | Define collection, document, and chunk domain models | ✅ Done |
| P0-02 | Implement deterministic local file storage | ✅ Done |
| P0-03 | Build collection and document upload APIs | ✅ Done |
| P0-04 | Add background indexing orchestration | 🔲 Not Started |
| P0-05 | Implement page-aware PDF extraction | 🔲 Not Started |
| P0-06 | Create chunking service with provenance metadata | 🔲 Not Started |
| P0-07 | Add local embedding generation and storage | 🔲 Not Started |
| P0-14 | Prepare MIT 6.100L corpus ingestion and metadata conventions | 🔲 Not Started |
| P0-08 | Implement collection-scoped semantic retrieval | 🔲 Not Started |
| P0-09 | Build grounded answer generation service | 🔲 Not Started |
| P0-10 | Add grounding fallback behavior and labeling | 🔲 Not Started |
| P0-15 | Create golden-question evaluation set | 🔲 Not Started |
| P0-11 | Build document library UI | 🔲 Not Started |
| P0-12 | Build source drawer and source badges in chat UI | 🔲 Not Started |
| P0-13 | Preserve explanation-level controls in grounded chat | 🔲 Not Started |
| P0-16 | Stabilize the full vertical slice for demo readiness | 🔲 Not Started |
| P1-01 | Add document re-index and retry actions | 🔲 Not Started |
| P1-02 | Add document and collection filters | 🔲 Not Started |
| P1-03 | Add retrieval inspection and developer diagnostics | 🔲 Not Started |
| P1-04 | Add simple grounding quality indicator | 🔲 Not Started |
| P1-05 | Add one lightweight study workflow from grounded answers | 🔲 Not Started |
| P1-06 | Update README, screenshots, and architecture note for Phase 2 | 🔲 Not Started |

---

## Sequence 1: Foundation

### P0-01: Define collection, document, and chunk domain models

**Status:** ✅ Done

**Description**

As the product owner, this story exists so ELI-Shiru has a reliable, structured way to represent a learner's study materials. Before any document can be uploaded, indexed, or cited, the product needs a clear model of what a "collection" of materials is, what a "document" within it looks like, and what a retrievable "chunk" of that document is. This foundation determines how confidently the product can promise "your materials, organized and traceable" throughout every later feature.

**Acceptance criteria**

- [ ] The product can create and store a named collection (for example, "Intro Python").
- [ ] The product can associate one or more documents with a collection.
- [ ] The product can represent a document's processing state such as uploaded, indexing, indexed, or failed.
- [ ] The product can represent a chunk of a document with enough metadata (document link, page range, order) to support later citation.
- [ ] Data model decisions are documented so future teammates or reviewers can understand the product's information architecture.

---

### P0-02: Implement deterministic local file storage

**Status:** ✅ Done

**Description**

As the product owner, this story exists to protect the "local-first, offline-first" promise that defines ELI-Shiru's identity. Learners should be able to trust that uploaded study materials stay on their machine, are stored predictably, and are never silently lost between sessions. This is also a foundational trust signal for the product's positioning as private-by-design.

**Acceptance criteria**

- [ ] Every uploaded PDF is saved to a predictable local location tied to its collection and document identity.
- [ ] Basic file facts (original filename, size, type, checksum) are retained alongside the document record.
- [ ] A learner can delete a document and know that both its record and its stored file are removed.
- [ ] The product behaves consistently after a restart; previously uploaded documents are still present and usable.

---

### P0-03: Build collection and document upload APIs

**Status:** ✅ Done

**Description**

As the product owner, this story exists to give learners (and the frontend) a simple, dependable way to create a study collection and add materials to it. This is the first moment where the "upload your notes" promise becomes real and testable. The experience here should feel lightweight, since document upload will become one of the most frequent actions in the product.

**Acceptance criteria**

- [ ] A learner-facing action exists to create a new collection.
- [ ] A learner-facing action exists to list existing collections.
- [ ] A learner-facing action exists to upload one or more PDFs into a chosen collection.
- [ ] After upload, the product immediately shows the new document with an accurate initial status.
- [ ] The upload flow does not lose or corrupt files, even for reasonably large PDFs.

---

### P0-04: Add background indexing orchestration

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists so uploading a document never feels slow, frozen, or broken to the learner. Indexing large PDFs takes time, and the product needs to process that work in the background while keeping the interface responsive and honest about progress. This directly affects how "polished" and "product-like" ELI-Shiru feels during a live demo.

**Acceptance criteria**

- [ ] Uploading a document returns quickly, without waiting for full processing to complete.
- [ ] The learner can see a document move through clear states (for example, uploaded, indexing, indexed, failed).
- [ ] If indexing fails, the learner sees a clear failure state rather than a silently stuck document.
- [ ] Reprocessing a failed or stuck document is possible without deleting and re-uploading it.

---

## Sequence 2: Indexing pipeline

### P0-05: Implement page-aware PDF extraction

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to protect ELI-Shiru's core Phase 2 promise: every answer can be traced back to a specific page in the learner's own materials. Losing page context during extraction would permanently weaken the product's trust story, since provenance depends on knowing exactly where an answer came from. This is one of the most important "invisible" engineering decisions in the whole phase.

**Acceptance criteria**

- [ ] Text extracted from a PDF retains a clear mapping to the page(s) it came from.
- [ ] Standard text-based academic PDFs, such as the MIT lecture notes, extract cleanly.
- [ ] Documents that cannot be extracted reliably (for example, scanned images) fail clearly rather than producing garbled content.
- [ ] Extracted content is structured well enough to flow directly into chunking without additional cleanup work.

---

### P0-06: Create chunking service with provenance metadata

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to make sure the "pieces" of a learner's materials are meaningful, traceable, and useful for retrieval. Good chunking is what makes both accurate answers and accurate citations possible later; poor chunking would quietly undermine the entire Phase 2 experience. This is a quality-defining internal capability, even though learners will never see "chunks" directly.

**Acceptance criteria**

- [ ] Each chunk of a document carries clear metadata: which document it came from, which pages it covers, and its position in the document.
- [ ] Chunk sizes are appropriate for explaining academic concepts, not arbitrarily small or overly long.
- [ ] Re-processing the same document produces stable, predictable chunks.
- [ ] Chunks can be retrieved and inspected independently for later debugging and evaluation.

---

### P0-07: Add local embedding generation and storage

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to give ELI-Shiru real semantic understanding of a learner's materials, fully on-device. This is what elevates the product from "keyword search over PDFs" to genuine retrieval-augmented learning support, while preserving the local-first commitment. It is a core differentiator in the product's engineering story.

**Acceptance criteria**

- [ ] Every successfully chunked piece of a document receives a locally generated embedding.
- [ ] Embeddings are stored in a way that supports fast semantic search later.
- [ ] If embedding generation fails, the document is not incorrectly marked as fully indexed.
- [ ] Re-indexing a document safely refreshes its embeddings without leaving orphaned old data behind.

---

### P0-14: Prepare MIT 6.100L corpus ingestion and metadata conventions

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to give the product a coherent, realistic, and demo-ready dataset before it is presented to recruiters, collaborators, or interviewers. Using a consistent academic corpus (MIT's Intro to CS and Programming using Python lecture notes) ensures every later feature can be demonstrated meaningfully rather than tested on scattered, inconsistent files.

**Acceptance criteria**

- [ ] A dedicated collection exists specifically for the MIT 6.100L lecture materials.
- [ ] Each lecture document follows a consistent naming and metadata convention (lecture number, title, topic tags).
- [ ] The full lecture set can be ingested into the product without manual cleanup or inconsistent labeling.
- [ ] This collection becomes the default demo dataset referenced in later product walkthroughs.

---

## Sequence 3: Grounded answers

### P0-08: Implement collection-scoped semantic retrieval

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to ensure that when a learner asks a question, ELI-Shiru finds the most relevant pieces of their own materials rather than guessing. This capability is the retrieval half of "retrieval-augmented generation" and is what will make grounded answers feel accurate and specific rather than generic.

**Acceptance criteria**

- [ ] A question can be matched against the chunks belonging to a specific, selected collection.
- [ ] The most relevant chunks are returned in a ranked, usable order.
- [ ] If a collection has no indexed content, the product clearly communicates that no sources are available.
- [ ] Retrieval results can be tested and reviewed independently from the final generated answer.

---

### P0-09: Build grounded answer generation service

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to deliver the core Phase 2 value proposition: answers that are actually grounded in the learner's own study materials, not just general model knowledge. This story is the moment ELI-Shiru becomes a "source-aware learning companion" instead of a plain chatbot.

**Acceptance criteria**

- [ ] A learner can ask a question and select an explanation level, and receive an answer informed by retrieved material.
- [ ] The returned answer includes both the explanation text and the specific sources used to produce it.
- [ ] The system clearly distinguishes between an answer grounded in the learner's documents and one produced without them.
- [ ] The experience still feels like one coherent product, consistent with the Phase 1 conversational flow.

---

### P0-10: Add grounding fallback behavior and labeling

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to protect learner trust by making sure ELI-Shiru never pretends to have sources it doesn't actually have. Being honest about when an answer is "model-only" versus "grounded in your materials" is a defining trust and integrity decision for the product, not just a technical detail.

**Acceptance criteria**

- [ ] When no relevant sources exist, the product clearly labels the answer as model-only rather than implying grounding.
- [ ] When sources are weak or partial, the product avoids fabricating confident-looking citations.
- [ ] The grounding state is a clear, structured signal the interface can rely on, not something inferred from free text.
- [ ] Learners can visually tell the difference between grounded and non-grounded answers at a glance.

---

### P0-15: Create golden-question evaluation set

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to protect quality over time as the retrieval and generation pipeline evolves. Without a repeatable set of test questions, it becomes easy to unknowingly regress answer quality while iterating on chunking, embeddings, or prompts. This story is about protecting the product's credibility every time changes are made.

**Acceptance criteria**

- [ ] A fixed list of 10 to 15 representative questions exists, covering key topics from the MIT lecture corpus.
- [ ] Each question has a reasonable expectation of which lecture or topic area should answer it.
- [ ] The list can be re-run manually after major pipeline changes to catch obvious regressions.
- [ ] Findings from running the golden set can be captured simply, even without full automation at this stage.

---

## Sequence 4: Product UI

### P0-11: Build document library UI

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to give learners a clear, confidence-inspiring way to manage their study materials inside ELI-Shiru. This is the first Phase 2 surface learners will interact with, and it needs to feel as polished and intentional as the rest of the product, not like a bolted-on admin panel.

**Acceptance criteria**

- [ ] A learner can create a collection and see it listed clearly.
- [ ] A learner can upload one or more documents into a chosen collection through the interface.
- [ ] Each document's status (uploading, indexing, indexed, failed) is visible and easy to understand at a glance.
- [ ] The library experience feels consistent with ELI-Shiru's existing visual and interaction style.

---

### P0-12: Build source drawer and source badges in chat UI

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to make the product's grounding promise visible and tangible to the learner, not just something happening behind the scenes. Seeing exactly which passage supported an answer is what turns "trust me" into "see for yourself," which is core to the Phase 2 value proposition.

**Acceptance criteria**

- [ ] Every grounded answer displays a visible indication that sources were used.
- [ ] A learner can open a source drawer or expand a source card to see the exact snippet and page reference behind an answer.
- [ ] Multiple sources for one answer are presented clearly without cluttering the conversation view.
- [ ] Viewing sources does not disrupt or lose the learner's place in the conversation.

---

### P0-13: Preserve explanation-level controls in grounded chat

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to make sure Phase 2 feels like a natural evolution of ELI-Shiru, not a separate product bolted on top. The ELI1 through ELI15 explanation-level system is core to the product's identity, and learners should be able to use it seamlessly even when answers are grounded in their own materials.

**Acceptance criteria**

- [ ] A learner can ask a grounded question at any existing explanation level (ELI1, ELI5, ELI10, ELI15).
- [ ] A learner can change explanation level mid-conversation without losing the active document context.
- [ ] Changing explanation level changes the style and depth of the answer while keeping source grounding intact.
- [ ] Conversation history clearly reflects which explanation level was used for each grounded answer.

---

### P0-16: Stabilize the full vertical slice for demo readiness

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to convert everything built so far into something that can actually be shown to other people with confidence. A working backend and frontend individually are not enough; the full upload-to-answer-to-citation journey needs to feel dependable, understandable, and impressive end to end.

**Acceptance criteria**

- [ ] The complete flow, from uploading MIT lecture PDFs to receiving a cited, grounded answer, works without manual workarounds.
- [ ] Empty, loading, indexing, and error states all look intentional rather than broken or unfinished.
- [ ] A first-time viewer can understand what is happening in the product without needing a verbal explanation.
- [ ] The experience is stable enough to be recorded as a demo and referenced confidently in interviews or documentation.

---

## Sequence 5: Post-MVP polish

### P1-01: Add document re-index and retry actions

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to reduce friction during ongoing development and real usage by allowing learners (and the team) to recover from indexing problems without starting over. This keeps the product resilient as more documents and edge cases are introduced over time.

**Acceptance criteria**

- [ ] A learner can trigger re-indexing for a document that previously failed.
- [ ] A learner or developer can manually re-index a document after logic or pipeline changes.
- [ ] Retry actions are reflected clearly in the document's visible status.

---

### P1-02: Add document and collection filters

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to keep the product usable and clear as learners accumulate more documents and collections over time. It also unlocks sharper, more controlled demo moments, such as "answer only using Lecture 15."

**Acceptance criteria**

- [ ] A learner can filter the document library by status or topic tag.
- [ ] A learner can narrow a question's retrieval scope to a specific document or subset of lectures.
- [ ] The active retrieval scope is visible during the conversation so context is never ambiguous.

---

### P1-03: Add retrieval inspection and developer diagnostics

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to give the team (and future collaborators) a way to understand why an answer looked the way it did, which builds confidence in the system's engineering quality. This is more of an internal transparency tool than a learner-facing feature.

**Acceptance criteria**

- [ ] A developer-facing view shows which chunks were retrieved for a given question.
- [ ] Retrieved chunk ranking and metadata are inspectable without needing direct database access.
- [ ] This diagnostic view can be hidden or disabled for the standard learner experience.

---

### P1-04: Add simple grounding quality indicator

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to give learners a slightly more nuanced sense of answer confidence, beyond a simple grounded/not-grounded flag. The goal is added trust and transparency, without overstating precision the system doesn't actually have.

**Acceptance criteria**

- [ ] Answers are labeled using a simple, honest scale such as grounded, partially grounded, or model-only.
- [ ] The label always matches the real availability and strength of retrieved sources.
- [ ] The indicator is visually understated and consistent with the product's overall design restraint.

---

### P1-05: Add one lightweight study workflow from grounded answers

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to give learners a first taste of ELI-Shiru's longer-term vision (flashcards, quizzes, structured study support) without expanding Phase 2 scope too far. Flashcards are chosen deliberately as the smallest meaningful step in that direction.

**Acceptance criteria**

- [ ] A learner can generate 3 to 5 flashcards directly from a grounded answer.
- [ ] Each flashcard retains a link back to the source material it came from.
- [ ] This feature stays clearly optional and does not complicate or slow down the primary chat experience.

---

### P1-06: Update README, screenshots, and architecture note for Phase 2

**Status:** 🔲 Not Started

**Description**

As the product owner, this story exists to make sure all of the engineering work in Phase 2 is legible and compelling to outside audiences: recruiters, interviewers, and future collaborators. A great feature that isn't well documented does not fully deliver its value as a portfolio asset.

**Acceptance criteria**

- [ ] The README clearly explains what Phase 2 adds and where its boundaries are.
- [ ] New screenshots or short clips show upload, grounded answers, and the source drawer in action.
- [ ] An architecture note explains the ingestion, indexing, retrieval, and answer-generation flow in plain language.
- [ ] The updated documentation can be directly reused in resume bullets, interview stories, and demo scripts.
