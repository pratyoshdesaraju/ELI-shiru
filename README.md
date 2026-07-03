eli‑shiru · Local‑first study companion (Phase 1)
eli‑shiru is a local‑first AI study companion that helps you understand topics with layered explanations (ELI5 → Beginner → Intermediate → Advanced). It uses:

React + Vite for the frontend

FastAPI for the backend

Ollama to run a local LLM (e.g., llama3:latest) on your machine

Phase 1 focuses on progressive explanations over the model’s built‑in knowledge (no document uploads yet).

1. Project structure
After cloning:

text
eli-shiru/
├── eli-shiru-frontend   # React + Vite UI
└── eli-shiru-backend    # FastAPI backend calling Ollama
You’ll run frontend and backend separately, both talking to a local Ollama server.

2. Prerequisites
You’ll need:

Node.js (v18+ recommended) and npm for the frontend.

Python 3.10+ for the backend.

Ollama installed and a model pulled (e.g., llama3:latest).

Install Ollama and pull a model
Follow Ollama’s install docs for your OS.

Then:

bash
ollama pull llama3
You can check:

bash
ollama list
to verify llama3:latest is available.

3. Backend setup (FastAPI + Ollama)
Create and activate a virtual environment
From the repo root:

bash
cd eli-shiru-backend

python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
Install backend dependencies
bash
pip install fastapi uvicorn[standard] httpx
Start Ollama server (if not already running)
In another terminal:

bash
ollama serve
You can confirm it’s up:

bash
curl http://127.0.0.1:11434/api/version
You should see a JSON version string.

Run the FastAPI backend
From eli-shiru-backend (venv activated):

bash
uvicorn main:app --reload --port 8000
API base URL: http://127.0.0.1:8000

Health check: GET /health → {"status": "ok", "service": "eli-shiru-backend"}

The key endpoint is:

POST /explain

Request JSON: { "question": "...", "level": "ELI5" | "Beginner" | "Intermediate" | "Advanced" }

Response JSON: { "level": "...", "question": "...", "explanation": "..." }

This endpoint builds a level‑specific prompt and calls Ollama’s /api/generate with your local model.

4. Frontend setup (React + Vite)
Install dependencies
In a new terminal:

bash
cd eli-shiru-frontend
npm install
Run the dev server
bash
npm run dev
Vite will print a URL, usually http://localhost:5173.

Open that URL in your browser.

5. Using the app
With all three running:

Ollama server (ollama serve)

Backend (uvicorn main:app --reload --port 8000)

Frontend (npm run dev)

Visit http://localhost:5173 and:

Enter a topic/question in the text area.

Choose an explanation level: ELI5 / Beginner / Intermediate / Advanced.

Click “Ask eli‑shiru”.

The app will:

Send { question, level } to POST /explain on the backend.

Backend calls your local Ollama model (e.g., llama3) and generates an explanation at the requested depth.

The frontend displays the explanation along with the selected level.

6. Common issues
Frontend error: “Sorry, something went wrong talking to the backend.”

Check that uvicorn is running and reachable: curl http://127.0.0.1:8000/health.

Backend 500 from /explain:

Ensure Ollama is running (curl http://127.0.0.1:11434/api/version).

Verify you have the model configured in main.py (model_name = "llama3" or another from ollama list).

CORS / preflight issues:

The backend includes CORS middleware for http://localhost:5173; if you change dev port or host, update the origins list in main.py.
