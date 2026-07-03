# ELI‑shiru — Local‑First AI Study Companion

ELI‑shiru is a local‑first learning assistant that explains technical concepts at different “experience levels” (ELI1, ELI5, ELI10, ELI15) using a chat‑style interface and a local LLM. It’s designed as a practical senior‑engineer project: end‑to‑end system with a React frontend, FastAPI backend, and Ollama‑powered LLM, with a roadmap toward Retrieval‑Augmented Generation (RAG) over user documents. 

## Features

- **Layered explanations by experience level**  
  Ask a question and choose an explanation depth like ELI1 (1 year SWE experience), ELI5, ELI10, or ELI15. The backend shapes prompts so answers match the selected level, making it easier to relearn or deepen understanding of familiar topics.

- **Local‑first architecture**  
  Runs entirely on your machine using a local LLM via Ollama, so you can experiment without sending code or notes to a cloud provider.

- **Clean frontend + backend separation**  
  React + Vite frontend for the chat UI, FastAPI backend for teaching logic and LLM integration, keeping the system easy to reason about and extend.

- **Phase 2 roadmap: RAG over documents**  
  Planned support for uploading your own PDFs/notes, building embeddings and a vector store, and answering questions grounded in your documents with clear source attribution.

## Tech Stack

- **Frontend:** React, Vite, TypeScript/JavaScript
- **Backend:** FastAPI (Python)
- **LLM Runtime:** Ollama (e.g., `llama3:8b-instruct` or similar local model)
- **Data / Future RAG:** Embeddings + vector database (e.g., FAISS / Chroma) — planned for Phase 2

## Project Structure

```text
ELI-shiru/
├── eli-shiru-frontend/   # React + Vite chat UI
├── eli-shiru-backend/    # FastAPI + Ollama backend
└── README.md             # This documentation
```

Inside `eli-shiru-backend`, you’ll typically have:

```text
eli-shiru-backend/
├── main.py               # FastAPI app and /explain endpoint
├── models/               # Request/response Pydantic models
├── services/             # LLM / teaching logic (prompt building, Ollama calls)
├── requirements.txt      # Backend dependencies
└── ...
```

Inside `eli-shiru-frontend`:

```text
eli-shiru-frontend/
├── src/
│   ├── App.tsx / App.jsx # Main chat view (question input, level selector, response area)
│   └── ...
├── package.json          # Frontend dependencies and scripts
└── ...
```

(Adjust these subtrees to match your actual files.)

## Installation

### Prerequisites

- Git
- Node.js (for React + Vite)
- Python 3.10+
- Ollama installed locally and a compatible model pulled (for example, `llama3:8b-instruct`)

### Clone the repo

```bash
git clone https://github.com/pratyoshdesaraju/ELI-shiru.git
cd ELI-shiru
```

### Backend setup

```bash
cd eli-shiru-backend
python -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Make sure Ollama is running and a model is available
# For example:
ollama run llama3:8b-instruct  # first-time model pull

# Start the FastAPI backend
uvicorn main:app --reload
```

### Frontend setup

Open a second terminal:

```bash
cd eli-shiru-frontend
npm install
npm run dev
```

By default, Vite runs on `http://localhost:5173` and the FastAPI backend on `http://localhost:8000`. You can configure the frontend to call `http://localhost:8000/explain`.

## Usage

1. Open the frontend in your browser (e.g., `http://localhost:5173`).  
2. Type a question about a topic you’re studying (e.g., “Explain Redis caching for web applications”).  
3. Choose an explanation level (ELI1, ELI5, ELI10, ELI15).  
4. Click **Ask** — the app sends your question and level to the FastAPI backend, which builds a tailored prompt and calls the local LLM.  
5. Read the response and, if needed, ask follow‑up questions at a higher or lower experience level.

This flow is designed to feel like a tutor who adjusts to your existing experience rather than just simplifying to “kid‑friendly” language.

## Phase 1 vs Phase 2

### Phase 1 (implemented)

- Local LLM via Ollama.  
- Explanation level selector (ELI1/5/10/15) wired end‑to‑end.  
- Single `/explain` API that takes `{ question, level }` and returns a structured explanation.  
- React UI with question input, level selection, loading state, and response display.

### Phase 2 (planned, Currently WIP)

- **Document upload:** Let users attach their own PDFs/notes for ingestion.  
- **Embeddings + vector store:** Chunk documents, create embeddings, and store them in a local vector database.  
- **RAG pipeline:** Retrieve relevant chunks for each question and pass them as context to the LLM.  
- **Source attribution:** UI distinguishes whether an answer came from uploaded documents, model knowledge, or both, with links/snippets to the underlying sources.  
- **Learning workflows:** Summaries, flashcards, and quiz generation built on top of the retrieved material.

## Why this project exists

ELI‑shiru is built as a portfolio‑grade system to showcase:

- End‑to‑end design of a modern AI application (frontend, backend, model integration).  
- Experience working with local LLMs and, in Phase 2, Retrieval‑Augmented Generation.  
- A focus on learning UX: explanations tuned by experience level, not just “simpler English.”

It’s intended as a demonstration of senior‑level engineering skills, not just a wrapper around a single API call.

## License

[Choose a license, e.g. MIT, Apache 2.0, or other, and mention it here]

## Contact

Built by [Pratyosh Desaraju](https://www.linkedin.com/in/pratyosh) — feel free to reach out with questions or suggestions.
