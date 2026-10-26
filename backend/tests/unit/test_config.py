"""Unit tests for typed configuration settings."""
import os
import pytest
from app.core.config import Settings


def test_settings_default_values() -> None:
    """Settings must provide safe default values conforming to simulation mode."""
    settings = Settings()
    assert settings.mode == "simulation"
    assert "sqlite" in settings.database_url
    assert "http://localhost:5173" in settings.cors_origins
    assert "http://127.0.0.1:5173" in settings.cors_origins
    assert settings.enable_local_lab is False
    assert settings.version == "0.1.0"


def test_settings_cors_origins_parsing() -> None:
    """CORS origins must parse both comma-separated strings and JSON lists."""
    s1 = Settings(cors_origins="http://localhost:5173, http://127.0.0.1:5173")
    assert s1.cors_origins == ["http://localhost:5173", "http://127.0.0.1:5173"]

    s2 = Settings(cors_origins='["http://localhost:3000", "http://localhost:5173"]')
    assert s2.cors_origins == ["http://localhost:3000", "http://localhost:5173"]


def test_settings_environment_override(monkeypatch: pytest.MonkeyPatch) -> None:
    """Environment variables prefixed with AEGISLOOP_ must override defaults."""
    monkeypatch.setenv("AEGISLOOP_MODE", "simulation")
    monkeypatch.setenv("AEGISLOOP_LOG_LEVEL", "DEBUG")
    monkeypatch.setenv("AEGISLOOP_VERSION", "0.9.9")

    settings = Settings()
    assert settings.mode == "simulation"
    assert settings.log_level == "DEBUG"
    assert settings.version == "0.9.9"
