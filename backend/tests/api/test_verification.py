"""API contract tests for POST /api/v1/runs/{id}/retest."""
from fastapi.testclient import TestClient


def test_retest_before_mitigation_rejected_with_409(client: TestClient) -> None:
    """Retesting a run in evidence_ready status (before mitigation) must return 409 INVALID_STATE_TRANSITION."""
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    run_id = create_res.json()["id"]

    response = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )
    assert response.status_code == 409

    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "INVALID_STATE_TRANSITION"
    assert "mitigation" in data["error"]["message"].lower()
    assert data["error"]["request_id"] is not None


def test_retest_sqli_success(client: TestClient) -> None:
    """Retesting SQLi run after approved mitigation evaluates named assertion and returns 200 verified."""
    # 1. Create SQLi run
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    run_id = create_res.json()["id"]

    # 2. Apply approved mitigation
    mit_res = client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "parameterized_query"},
    )
    assert mit_res.status_code == 200

    # 3. Retest named assertion
    response = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "verified"

    ver = data["verification"]
    assert ver["assertion_id"] == "sqli_input_is_parameterized"
    assert ver["passed"] is True
    assert isinstance(ver["summary"], str)
    assert len(ver["summary"]) > 0
    assert isinstance(ver["limitations"], str)
    assert len(ver["limitations"]) > 0

    # 4. Verify persisted state via GET
    get_res = client.get(f"/api/v1/runs/{run_id}")
    assert get_res.status_code == 200
    run_data = get_res.json()
    assert run_data["status"] == "verified"
    assert run_data["verification"]["passed"] is True
    assert run_data["verification"]["assertion_id"] == "sqli_input_is_parameterized"

    # Verify event appended
    last_event = run_data["events"][-1]
    assert last_event["event_type"] == "assertion_evaluated"


def test_retest_bola_success(client: TestClient) -> None:
    """Retesting BOLA run after approved mitigation evaluates named assertion and returns 200 verified."""
    create_res = client.post("/api/v1/runs", json={"scenario_id": "bola_demo_v1"})
    run_id = create_res.json()["id"]

    mit_res = client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "enforce_record_ownership"},
    )
    assert mit_res.status_code == 200

    response = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "record_owner_check_enforced"},
    )
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "verified"
    assert data["verification"]["assertion_id"] == "record_owner_check_enforced"
    assert data["verification"]["passed"] is True


def test_retest_wrong_assertion_id_rejected_with_400(client: TestClient) -> None:
    """Requesting an assertion ID not defined for the scenario must return 400 ASSERTION_NOT_ALLOWED."""
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    run_id = create_res.json()["id"]

    client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "parameterized_query"},
    )

    # Cross-scenario assertion
    response = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "record_owner_check_enforced"},
    )
    assert response.status_code == 400

    data = response.json()
    assert data["error"]["code"] == "ASSERTION_NOT_ALLOWED"
    assert "record_owner_check_enforced" in data["error"]["message"]


def test_retest_arbitrary_assertion_rejected_with_400(client: TestClient) -> None:
    """Requesting an arbitrary assertion string must return 400 ASSERTION_NOT_ALLOWED."""
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    run_id = create_res.json()["id"]

    client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "parameterized_query"},
    )

    response = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "arbitrary_custom_check"},
    )
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "ASSERTION_NOT_ALLOWED"


def test_retest_unknown_run_returns_404(client: TestClient) -> None:
    """Retesting a non-existent run must return 404 RUN_NOT_FOUND."""
    response = client.post(
        "/api/v1/runs/run_phantom/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "RUN_NOT_FOUND"


def test_retest_after_verified_rejected_with_409(client: TestClient) -> None:
    """Retesting after a run is already verified must return 409 INVALID_STATE_TRANSITION."""
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    run_id = create_res.json()["id"]

    client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "parameterized_query"},
    )

    first_retest = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )
    assert first_retest.status_code == 200

    # Second retest on already verified run
    second_retest = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )
    assert second_retest.status_code == 409
    assert second_retest.json()["error"]["code"] == "INVALID_STATE_TRANSITION"


def test_retest_unsuccessful_verification_and_recovery(app, client: TestClient) -> None:
    """Retesting evaluates to verification_failed when mitigation does not satisfy assertion."""
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    run_id = create_res.json()["id"]

    # Directly set an ineffective mitigation in DB to simulate a non-satisfying mitigation
    from app.db.schema import RunModel
    with app.state.db_manager.session() as session:
        run = session.get(RunModel, run_id)
        run.status = "mitigation_applied"
        run.applied_mitigation_id = "ineffective_workaround"

    # Retest evaluates assertion -> fails
    response = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "verification_failed"
    assert data["verification"]["passed"] is False
    assert "failed" in data["verification"]["summary"].lower()

    # Verify persisted state via GET
    get_res = client.get(f"/api/v1/runs/{run_id}")
    assert get_res.json()["status"] == "verification_failed"

    # Now recover by updating mitigation to approved parameterized_query
    with app.state.db_manager.session() as session:
        run = session.get(RunModel, run_id)
        run.applied_mitigation_id = "parameterized_query"

    # Retest again from verification_failed -> must succeed!
    recovery_res = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )
    assert recovery_res.status_code == 200
    assert recovery_res.json()["status"] == "verified"
    assert recovery_res.json()["verification"]["passed"] is True
