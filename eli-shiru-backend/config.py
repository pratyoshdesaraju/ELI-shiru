# eli-shiru-backend/config.py
from pathlib import Path

# Anchor every path to this file's location so behavior never
# depends on which directory you happened to run uvicorn from.
BACKEND_ROOT = Path(__file__).resolve().parent

UPLOAD_ROOT = BACKEND_ROOT / "uploads"
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
