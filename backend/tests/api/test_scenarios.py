"""API contract tests for GET /api/v1/scenarios."""
from fastapi.testclient import TestClient


def test_list_scenarios_success(client: TestClient) -> None:
    """GET /api/v1/scenarios must return 200 with both allowlisted scenarios."""
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200

    data = response.json()
    assert "items" in data
    items = data["items"]
    assert isinstance(items, list)
    assert len(items) == 2

    # Verify both scenarios are present
    scenario_ids = [s["id"] for s in items]
    assert "sqli_demo_v1" in scenario_ids
    assert "bola_demo_v1" in scenario_ids

    # Verify exact schema structure for sqli_demo_v1
    sqli = next(s for s in items if s["id"] == "sqli_demo_v1")
    assert sqli["name"] == "Unsafe Query Construction"
    assert sqli["category"] == "injection"
    assert sqli["severity"] == "high"
    assert isinstance(sqli["summary"], str)
    assert sqli["mode_support"] == ["simulation"]
    assert sqli["expected_assertion_id"] == "sqli_input_is_parameterized"

    # Verify exact schema structure for bola_demo_v1
    bola = next(s for s in items if s["id"] == "bola_demo_v1")
    assert bola["name"] == "Broken Object-Level Authorization"
    assert bola["category"] == "access_control"
    assert bola["severity"] == "high"
    assert isinstance(bola["summary"], str)
    assert bola["mode_support"] == ["simulation"]
    assert bola["expected_assertion_id"] == "record_owner_check_enforced"


def test_list_scenarios_propagates_request_id(client: TestClient) -> None:
    """GET /api/v1/scenarios must propagate or generate request ID in response header."""
    custom_id = "req_scenarios_custom_001"
    response = client.get("/api/v1/scenarios", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == custom_id


def test_list_scenarios_rejects_unsupported_methods(client: TestClient) -> None:
    """POST /api/v1/scenarios must be rejected with 405 METHOD_NOT_ALLOWED."""
    response = client.post("/api/v1/scenarios", json={})
    assert response.status_code == 405
    data = response.json()
    assert data["error"]["code"] == "METHOD_NOT_ALLOWED"
    assert data["error"]["request_id"] is not None
