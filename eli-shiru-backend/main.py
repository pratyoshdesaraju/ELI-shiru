# eli-shiru-backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

from database import init_db


class ExplainRequest(BaseModel):
    question: str
    level: str


class ExplainResponse(BaseModel):
    level: str
    question: str
    explanation: str


app = FastAPI()


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "eli-shiru-backend"}


def build_prompt(question: str, level: str) -> str:
    if level == "ELI1":
        style_instruction = (
            "Explain this to someone with about 1 year of experience in the relevant field. "
            "Assume they know the basics and common terminology, but still need simple, direct explanations "
            "and one concrete example."
        )
    elif level == "ELI5":
        style_instruction = (
            "Explain this to someone with about 5 years of experience in the relevant field. "
            "Assume they are comfortable with core concepts and standard terminology. "
            "Give a practical explanation, include important details, and show how it is used in real work."
        )
    elif level == "ELI10":
        style_instruction = (
            "Explain this to someone with about 10 years of experience in the relevant field. "
            "Use precise professional language, discuss design considerations, and connect the concept "
            "to deeper implementation details, trade-offs, or architecture."
        )
    elif level == "ELI15":
        style_instruction = (
            "Explain this to someone with about 15 years of experience in the relevant field. "
            "Assume deep professional expertise. Focus on subtleties, edge cases, trade-offs, failure modes, "
            "and how experts reason about this concept in practice."
        )
    else:
        style_instruction = (
            "Explain this clearly based on the experience level requested."
        )

    prompt = (
        f"{style_instruction}\n\n"
        f"Topic/question:\n{question}\n\n"
        f"Infer the professional field from the question. "
        f"For example, if the question is about arrays, treat the field as software engineering/computer science. "
        f"Adjust the explanation to match the requested years of experience in that field. "
        f"Write one cohesive explanation at the requested level."
    )
    return prompt


async def call_ollama(prompt: str) -> str:
    """
    Call Ollama's /api/generate endpoint and collect the streamed 'response' text.
    """
    model_name = "llama3"
    generated = []

    try:
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                "http://127.0.0.1:11434/api/generate",
                json={"model": model_name, "prompt": prompt},
            ) as resp:
                if resp.status_code != 200:
                    text = await resp.aread()
                    raise HTTPException(
                        status_code=resp.status_code,
                        detail=f"Ollama returned {resp.status_code}: {text.decode(errors='ignore')}",
                    )

                async for line in resp.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        data = httpx.Response(200, content=line).json()
                    except Exception:
                        continue
                    chunk = data.get("response")
                    if chunk:
                        generated.append(chunk)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Error talking to Ollama: {e}",
        )

    text = "".join(generated).strip()
    if not text:
        raise HTTPException(
            status_code=500,
            detail="Ollama returned an empty response.",
        )

    return text


@app.post("/explain", response_model=ExplainResponse)
async def explain(req: ExplainRequest):
    prompt = build_prompt(req.question, req.level)
    explanation = await call_ollama(prompt)

    return ExplainResponse(
        level=req.level,
        question=req.question,
        explanation=explanation,
    )