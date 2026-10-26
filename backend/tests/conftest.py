"""Pytest configuration and shared test fixtures."""
import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.db.session import DatabaseManager, reset_default_db_manager
from app.main import create_app


@pytest.fixture(autouse=True, scope="session")
def reset_db_at_start_and_end():
    reset_default_db_manager()
    yield
    reset_default_db_manager()


@pytest.fixture
def test_settings() -> Settings:
    """Provide isolated settings for test execution."""
    return Settings(
        mode="simulation",
        database_url="sqlite://",
        cors_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        log_level="DEBUG",
        enable_local_lab=False,
        version="0.1.0",
    )


@pytest.fixture
def app(test_settings: Settings):
    """Provide application instance initialized with test settings and isolated DB."""
    db_manager = DatabaseManager(test_settings.database_url)
    db_manager.init_db()
    application = create_app(settings=test_settings, db_manager=db_manager)
    try:
        yield application
    finally:
        db_manager.close()


@pytest.fixture
def client(app) -> TestClient:
    """Provide TestClient instance configured for the test app."""
    with TestClient(app=app, base_url="http://testserver") as test_client:
        yield test_client
