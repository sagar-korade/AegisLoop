"""Smoke tests confirming SQLite and SQLAlchemy behavior on Python 3.14.

Permanently replaces the Phase 0b scratch script (backend/scratch_test_sqlalchemy.py).
"""
from sqlalchemy import create_engine, text


def test_sqlite_in_memory_basic_crud() -> None:
    """SQLAlchemy must execute CRUD operations on SQLite in-memory database."""
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False})
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE TABLE IF NOT EXISTS _smoke (id INTEGER PRIMARY KEY, val TEXT)"))
            conn.execute(text("INSERT INTO _smoke (val) VALUES ('smoke_ok')"))
            conn.commit()

            row = conn.execute(text("SELECT val FROM _smoke")).fetchone()
            assert row is not None
            assert row[0] == "smoke_ok"
    finally:
        engine.dispose()


def test_sqlite_foreign_keys_pragma() -> None:
    """PRAGMA foreign_keys = ON must be respected by SQLite connections."""
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False})
    try:
        with engine.connect() as conn:
            conn.execute(text("PRAGMA foreign_keys = ON"))
            fk_status = conn.execute(text("PRAGMA foreign_keys")).fetchone()
            assert fk_status is not None
            assert fk_status[0] == 1, "Foreign keys pragma must be active (1)"
    finally:
        engine.dispose()
