from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.settings import settings

# SQLite (local dev without Postgres) needs check_same_thread off for FastAPI's threadpool.
_connect_args = {"check_same_thread": False} if settings.effective_database_url.startswith("sqlite") else {}
engine = create_engine(settings.effective_database_url, pool_pre_ping=True, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
