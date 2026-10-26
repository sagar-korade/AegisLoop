"""API tests for CORS configuration and restrictive origin enforcement."""
from fastapi.testclient import TestClient


def test_cors_preflight_allowed_origins(client: TestClient) -> None:
    """Preflight OPTIONS request from allowed local origins must return Access-Control-Allow-Origin."""
    for origin in ["http://localhost:5173", "http://127.0.0.1:5173"]:
        response = client.options(
            "/api/v1/scenarios",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "X-Request-ID, Content-Type",
            },
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == origin
        assert "GET" in response.headers.get("access-control-allow-methods", "")
        # Credentials must NOT be allowed
        assert response.headers.get("access-control-allow-credentials") is None

        # Also test DELETE preflight
        delete_response = client.options(
            "/api/v1/runs",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "DELETE",
                "Access-Control-Request-Headers": "X-Request-ID",
            },
        )
        assert delete_response.status_code == 200
        assert delete_response.headers.get("access-control-allow-origin") == origin
        assert "DELETE" in delete_response.headers.get("access-control-allow-methods", "")


def test_cors_simple_request_allowed_origins(client: TestClient) -> None:
    """Simple GET requests with Origin header from allowed local origins must return Access-Control-Allow-Origin."""
    for origin in ["http://localhost:5173", "http://127.0.0.1:5173"]:
        response = client.get(
            "/health",
            headers={"Origin": origin},
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == origin
        assert response.headers.get("access-control-allow-credentials") is None


def test_cors_unrelated_origin_rejected(client: TestClient) -> None:
    """Requests with Origin header from untrusted or unrelated origins must NOT receive Access-Control-Allow-Origin."""
    untrusted_origins = [
        "http://evil.com",
        "http://localhost:3000",
        "http://attacker.example.org",
        "https://malicious-site.io",
    ]
    for origin in untrusted_origins:
        # Test preflight
        preflight_res = client.options(
            "/api/v1/scenarios",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
            },
        )
        assert preflight_res.headers.get("access-control-allow-origin") is None

        # Test simple GET
        get_res = client.get(
            "/health",
            headers={"Origin": origin},
        )
        assert get_res.headers.get("access-control-allow-origin") is None
