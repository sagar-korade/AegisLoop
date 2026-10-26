"""FastAPI dependencies for settings and services."""
from typing import Generator
from fastapi import Request
from sqlalchemy.orm import Session
from app.core.config import Settings, get_settings
from app.db.session import DatabaseManager, get_db_manager


def get_app_settings(request: Request) -> Settings:
    """Return settings from app.state if configured, otherwise fallback to cached settings."""
    if hasattr(request.app.state, "settings") and request.app.state.settings is not None:
        return request.app.state.settings
    return get_settings()


def get_db(request: Request) -> Generator[Session, None, None]:
    """Provide a database session from app.state.db_manager or default db manager."""
    if hasattr(request.app.state, "db_manager") and request.app.state.db_manager is not None:
        manager: DatabaseManager = request.app.state.db_manager
    else:
        manager = get_db_manager()
    yield from manager.get_db()


__all__ = ["get_app_settings", "get_settings", "get_db", "Settings"]
