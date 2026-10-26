"""Database engine, connection pooling, and session management.

Ensures strict SQLite foreign key enforcement, connection isolation,
and clean connection disposal.
"""
from contextlib import contextmanager
from typing import Generator, Optional
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool, StaticPool
from app.db.schema import create_tables


def configure_sqlite_engine(engine: Engine) -> None:
    """Register SQLite connection pragma for foreign key enforcement."""

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):  # pragma: no cover
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def create_db_engine(database_url: str) -> Engine:
    """Create a SQLAlchemy engine tailored for SQLite."""
    connect_args = {"check_same_thread": False}

    if database_url in {"sqlite://", "sqlite:///:memory:"}:
        engine = create_engine(
            database_url,
            connect_args=connect_args,
            poolclass=StaticPool,
        )
    else:
        engine = create_engine(
            database_url,
            connect_args=connect_args,
            poolclass=NullPool,
        )

    configure_sqlite_engine(engine)
    return engine


class DatabaseManager:
    """Encapsulates engine, session factory, and lifecycle for an SQLite database."""

    def __init__(self, database_url: str) -> None:
        self.database_url = database_url
        self.engine = create_db_engine(database_url)
        self.session_factory = sessionmaker(
            bind=self.engine,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )

    def init_db(self) -> None:
        """Idempotently create tables."""
        create_tables(self.engine)

    def close(self) -> None:
        """Dispose engine connections cleanly."""
        self.engine.dispose()

    @contextmanager
    def session(self) -> Generator[Session, None, None]:
        """Context manager providing a transactional session."""
        sess: Session = self.session_factory()
        try:
            yield sess
            sess.commit()
        except Exception:
            sess.rollback()
            raise
        finally:
            sess.close()

    def get_db(self) -> Generator[Session, None, None]:
        """Generator for FastAPI Depends injection with commit/rollback/close."""
        sess: Session = self.session_factory()
        try:
            yield sess
            sess.commit()
        except Exception:
            sess.rollback()
            raise
        finally:
            sess.close()


_default_manager: Optional[DatabaseManager] = None


def get_db_manager(database_url: Optional[str] = None) -> DatabaseManager:
    """Get or create database manager without binding tests to global state."""
    global _default_manager
    if database_url is not None:
        return DatabaseManager(database_url)
    if _default_manager is None:
        from app.core.config import get_settings
        settings = get_settings()
        _default_manager = DatabaseManager(settings.database_url)
    return _default_manager


def reset_default_db_manager() -> None:
    """Cleanly close and reset the default manager for testing teardown."""
    global _default_manager
    if _default_manager is not None:
        _default_manager.close()
        _default_manager = None
