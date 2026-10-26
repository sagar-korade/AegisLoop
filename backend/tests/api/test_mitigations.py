"""API contract tests for POST /api/v1/runs/{id}/mitigations."""
from fastapi.testclient import TestClient


def test_apply_mitigation_sqli_success(client: TestClient) -> None:
    """POST /api/v1/runs/{id}/mitigations applies approved parameterized_query to SQLi run."""
    # 1. Create SQLi run
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    assert create_res.status_code == 201
    run_id = create_res.json()["id"]

    # 2. Apply approved mitigation
    payload = {"mitigation_id": "parameterized_query"}
    response = client.post(f"/api/v1/runs/{run_id}/mitigations", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["run_id"] == run_id
    assert data["status"] == "mitigation_applied"

    mitigation = data["mitigation"]
    assert mitigation["id"] == "parameterized_query"
    assert "parameter" in mitigation["label"].lower()
    assert isinstance(mitigation["rule_summary"], str)
    assert isinstance(mitigation["unified_diff"], str)
    assert "---" in mitigation["unified_diff"]
    assert "+++" in mitigation["unified_diff"]
    assert isinstance(mitigation["file_path"], str)

    # 3. Verify persisted state via GET
    get_res = client.get(f"/api/v1/runs/{run_id}")
    assert get_res.status_code == 200
    run_data = get_res.json()
    assert run_data["status"] == "mitigation_applied"
    assert run_data["applied_mitigation"]["id"] == "parameterized_query"

    # Verify mitigation event was appended
    last_event = run_data["events"][-1]
    assert last_event["event_type"] == "mitigation_applied"
    assert last_event["sequence"] == len(run_data["events"])


def test_apply_mitigation_bola_success(client: TestClient) -> None:
    """POST /api/v1/runs/{id}/mitigations applies approved enforce_ownership_check to BOLA run."""
    create_res = client.post("/api/v1/runs", json={"scenario_id": "bola_demo_v1"})
    run_id = create_res.json()["id"]

    payload = {"mitigation_id": "enforce_record_ownership"}
    response = client.post(f"/api/v1/runs/{run_id}/mitigations", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "mitigation_applied"
    assert data["mitigation"]["id"] == "enforce_record_ownership"
    assert "ownership" in data["mitigation"]["label"].lower()


def test_cross_scenario_mitigation_rejected_with_400(client: TestClient) -> None:
    """Applying a mitigation from a different scenario must be rejected with 400 MITIGATION_NOT_ALLOWED."""
    # Create SQLi run
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    run_id = create_res.json()["id"]

    # Attempt to apply BOLA mitigation to SQLi run
    payload = {"mitigation_id": "enforce_record_ownership"}
    response = client.post(f"/api/v1/runs/{run_id}/mitigations", json=payload)
    assert response.status_code == 400

    data = response.json()
    assert data["error"]["code"] == "MITIGATION_NOT_ALLOWED"
    assert "enforce_record_ownership" in data["error"]["message"]
    assert data["error"]["request_id"] is not None


def test_unknown_mitigation_rejected_with_400(client: TestClient) -> None:
    """Applying an unallowlisted mitigation must return 400 MITIGATION_NOT_ALLOWED."""
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    run_id = create_res.json()["id"]

    payload = {"mitigation_id": "arbitrary_custom_mitigation"}
    response = client.post(f"/api/v1/runs/{run_id}/mitigations", json=payload)
    assert response.status_code == 400

    data = response.json()
    assert data["error"]["code"] == "MITIGATION_NOT_ALLOWED"


def test_apply_mitigation_unknown_run_returns_404(client: TestClient) -> None:
    """Applying mitigation to a non-existent run must return 404 RUN_NOT_FOUND."""
    payload = {"mitigation_id": "parameterized_query"}
    response = client.post("/api/v1/runs/run_ghost/mitigations", json=payload)
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "RUN_NOT_FOUND"


def test_reapplying_mitigation_rejected_with_409(client: TestClient) -> None:
    """Applying a mitigation when run is already in mitigation_applied must return 409 INVALID_STATE_TRANSITION."""
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    run_id = create_res.json()["id"]

    # First application succeeds
    payload = {"mitigation_id": "parameterized_query"}
    first_res = client.post(f"/api/v1/runs/{run_id}/mitigations", json=payload)
    assert first_res.status_code == 200

    # Second application must fail with 409
    second_res = client.post(f"/api/v1/runs/{run_id}/mitigations", json=payload)
    assert second_res.status_code == 409

    data = second_res.json()
    assert data["error"]["code"] == "INVALID_STATE_TRANSITION"
    assert data["error"]["request_id"] is not None
