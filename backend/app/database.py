"""
Database Configuration
=====================
SQLAlchemy engine and session setup for SQLite.
Uses synchronous SQLAlchemy with connection pooling.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings


# ─── Engine Setup ──────────────────────────────────────────────
# SQLite-specific: enable WAL mode and foreign keys for performance & integrity
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite with FastAPI
    echo=settings.DEBUG,  # Log SQL queries in debug mode
    pool_pre_ping=True,
)


# Enable SQLite foreign key enforcement (disabled by default in SQLite)
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Enable foreign keys and WAL mode for SQLite."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()


# ─── Session Factory ──────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ─── Base Model Class ─────────────────────────────────────────
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


# ─── Dependency Injection ─────────────────────────────────────
def get_db():
    """
    FastAPI dependency that provides a database session.
    Automatically closes the session after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
