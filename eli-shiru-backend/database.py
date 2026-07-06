# eli-shiru-backend/database.py
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///./eli_shiru.db"

engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def init_db() -> None:
    """Create all tables on startup if they do not already exist."""
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session