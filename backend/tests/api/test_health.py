"""Tests for GET /health endpoint per API contract."""
from fastapi.testclient import TestClient
from app.core.config import Settings
from app.main import create_app


def test_health_endpoint_default(client: TestClient) -> None:
    """GET /health must return HTTP 200 with documented JSON shape."""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data == {
        "status": "ok",
        "mode": "simulation",
        "version": "0.1.0",
    }


def test_health_endpoint_propagates_request_id(client: TestClient) -> None:
    """GET /health must include X-Request-ID header on response."""
    response = client.get("/health", headers={"X-Request-ID": "test-req-1234"})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == "test-req-1234"


def test_health_endpoint_generates_request_id_when_missing(client: TestClient) -> None:
    """GET /health must generate an opaque request ID when no header is supplied."""
    response = client.get("/health")
    assert response.status_code == 200
    req_id = response.headers.get("X-Request-ID")
    assert req_id is not None
    assert req_id.startswith("req_")


def test_health_endpoint_reflects_settings() -> None:
    """GET /health must reflect active mode and version from injected settings."""
    custom_settings = Settings(
        mode="simulation",
        version="0.2.0",
        database_url="sqlite://",
    )
    custom_app = create_app(settings=custom_settings)
    custom_client = TestClient(custom_app)

    response = custom_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "mode": "simulation",
        "version": "0.2.0",
    }
