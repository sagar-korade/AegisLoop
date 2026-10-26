"""Comprehensive end-to-end integration test of the full AegisLoop purple-team workflow.

Tests both allowlisted scenarios across their entire traceable lifecycle:
1. List scenarios (GET /api/v1/scenarios)
2. Initiate run (POST /api/v1/runs) -> evidence_ready
3. Inspect evidence & ordered events (GET /api/v1/runs/{id})
4. Attempt premature retest -> 409
5. Apply approved mitigation (POST /api/v1/runs/{id}/mitigations) -> mitigation_applied
6. Inspect educational diff (GET /api/v1/runs/{id})
7. Retest named assertion (POST /api/v1/runs/{id}/retest) -> verified
8. Verify persistence across distinct database sessions
9. Reset run (POST /api/v1/runs/{id}/reset) -> linked child run in evidence_ready
"""
from fastapi.testclient import TestClient


def test_full_workflow_scenario_a_sqli(client: TestClient) -> None:
    """Traceable end-to-end workflow execution for Scenario A (SQL Injection).

    Covers the complete 9-step workflow:
    1. List scenarios.
    2. Create SQL injection demonstration run.
    3. Retrieve run and its evidence.
    4. Apply approved parameterization mitigation (premature retest rejected with 409).
    5. Retest named assertion.
    6. Verify persisted result and updated run status.
    7. List runs and confirm run appears with accurate summary fields.
    8. Reset run using existing supported API semantics.
    9. Retrieve relevant run records again and verify persistence and lifecycle consistency.
    """
    # Step 1: List scenarios
    scenarios_res = client.get("/api/v1/scenarios")
    assert scenarios_res.status_code == 200
    scenarios = scenarios_res.json()["items"]
    sqli_meta = next(s for s in scenarios if s["id"] == "sqli_demo_v1")
    assert sqli_meta["category"] == "injection"
    assert sqli_meta["expected_assertion_id"] == "sqli_input_is_parameterized"

    # Step 2: Create run
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    assert create_res.status_code == 201
    run = create_res.json()
    run_id = run["id"]
    assert run["status"] == "evidence_ready"
    assert run["mode"] == "simulation"
    assert len(run["events"]) >= 3
    assert run["available_mitigations"][0]["id"] == "parameterized_query"
    assert run["expected_assertion_id"] == "sqli_input_is_parameterized"

    # Step 3: Retrieve run and its evidence
    get_res = client.get(f"/api/v1/runs/{run_id}")
    assert get_res.status_code == 200
    fetched_run = get_res.json()
    assert fetched_run["id"] == run_id
    assert fetched_run["status"] == "evidence_ready"
    assert fetched_run["finding"]["severity"] == "high"
    assert len(fetched_run["finding"]["evidence"]) > 0

    # Negative check: Premature retest before mitigation is rejected
    premature_retest = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )
    assert premature_retest.status_code == 409
    assert premature_retest.json()["error"]["code"] == "INVALID_STATE_TRANSITION"

    # Step 4: Apply approved parameterization mitigation
    mit_res = client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "parameterized_query"},
    )
    assert mit_res.status_code == 200
    mit_data = mit_res.json()
    assert mit_data["status"] == "mitigation_applied"
    assert mit_data["mitigation"]["id"] == "parameterized_query"
    assert "---" in mit_data["mitigation"]["unified_diff"]

    # Step 5: Retest named assertion
    retest_res = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )
    assert retest_res.status_code == 200
    retest_data = retest_res.json()
    assert retest_data["status"] == "verified"
    assert retest_data["verification"]["passed"] is True
    assert retest_data["verification"]["assertion_id"] == "sqli_input_is_parameterized"

    # Step 6: Verify persisted result and updated run status
    verified_res = client.get(f"/api/v1/runs/{run_id}")
    assert verified_res.status_code == 200
    verified_run = verified_res.json()
    assert verified_run["status"] == "verified"
    assert verified_run["applied_mitigation"]["id"] == "parameterized_query"
    assert verified_run["verification"]["passed"] is True
    assert verified_run["verification"]["details"] is not None
    assert (
        verified_run["verification"]["details"]["active_mitigation"]
        == "parameterized_query"
    )

    # Confirm strict sequence monotonicity of all events
    events = verified_run["events"]
    assert len(events) >= 5
    for idx, evt in enumerate(events, start=1):
        assert evt["sequence"] == idx

    # Step 7: List runs and confirm run appears with accurate summary fields
    list_res = client.get("/api/v1/runs?limit=30")
    assert list_res.status_code == 200
    run_summary = next(r for r in list_res.json()["items"] if r["id"] == run_id)
    assert run_summary["status"] == "verified"
    assert run_summary["verification_passed"] is True
    assert run_summary["applied_mitigation_id"] == "parameterized_query"
    assert run_summary["scenario_id"] == "sqli_demo_v1"
    assert run_summary["event_count"] == len(events)

    # Step 8: Reset run using existing supported API semantics
    reset_res = client.post(f"/api/v1/runs/{run_id}/reset")
    assert reset_res.status_code == 200
    child_run = reset_res.json()
    child_run_id = child_run["id"]
    assert child_run_id != run_id
    assert child_run["status"] == "evidence_ready"
    assert child_run["reset_of_run_id"] == run_id
    assert child_run["scenario_id"] == "sqli_demo_v1"

    # Step 9: Retrieve relevant run records again and verify persistence and lifecycle consistency
    orig_check_res = client.get(f"/api/v1/runs/{run_id}")
    assert orig_check_res.status_code == 200
    orig_record = orig_check_res.json()
    assert orig_record["status"] == "reset"
    orig_event_types = [e["event_type"] for e in orig_record["events"]]
    assert "run_reset" in orig_event_types

    child_check_res = client.get(f"/api/v1/runs/{child_run_id}")
    assert child_check_res.status_code == 200
    child_record = child_check_res.json()
    assert child_record["status"] == "evidence_ready"
    assert child_record["reset_of_run_id"] == run_id
    assert len(child_record["events"]) >= 3

    # Confirm list reflects both runs
    list_after_reset = client.get("/api/v1/runs?limit=30")
    assert list_after_reset.status_code == 200
    list_items = list_after_reset.json()["items"]
    child_summary = next(r for r in list_items if r["id"] == child_run_id)
    orig_summary = next(r for r in list_items if r["id"] == run_id)
    assert child_summary["status"] == "evidence_ready"
    assert child_summary["reset_of_run_id"] == run_id
    assert orig_summary["status"] == "reset"


def test_full_workflow_scenario_b_bola(client: TestClient) -> None:
    """Traceable end-to-end workflow execution for Scenario B (BOLA).

    Covers the complete 9-step workflow:
    1. List scenarios and verify BOLA metadata.
    2. Create BOLA demonstration run.
    3. Retrieve run and its evidence.
    4. Apply approved record ownership mitigation (premature retest rejected with 409).
    5. Retest named record-ownership assertion.
    6. Verify persisted result and updated run status.
    7. List runs and confirm run appears with accurate summary fields.
    8. Reset run using existing supported API semantics.
    9. Retrieve relevant run records again and verify persistence and lifecycle consistency.
    """
    # Step 1: List scenarios
    scenarios_res = client.get("/api/v1/scenarios")
    assert scenarios_res.status_code == 200
    scenarios = scenarios_res.json()["items"]
    bola_meta = next(s for s in scenarios if s["id"] == "bola_demo_v1")
    assert bola_meta["category"] == "access_control"
    assert bola_meta["expected_assertion_id"] == "record_owner_check_enforced"

    # Step 2: Create BOLA run
    create_res = client.post("/api/v1/runs", json={"scenario_id": "bola_demo_v1"})
    assert create_res.status_code == 201
    run = create_res.json()
    run_id = run["id"]
    assert run["status"] == "evidence_ready"
    assert run["mode"] == "simulation"
    assert run["expected_assertion_id"] == "record_owner_check_enforced"
    assert len(run["available_mitigations"]) == 1
    assert run["available_mitigations"][0]["id"] == "enforce_record_ownership"

    # Step 3: Retrieve run and its evidence
    get_res = client.get(f"/api/v1/runs/{run_id}")
    assert get_res.status_code == 200
    fetched_run = get_res.json()
    assert fetched_run["id"] == run_id
    assert fetched_run["status"] == "evidence_ready"
    assert fetched_run["finding"]["severity"] == "high"
    assert len(fetched_run["finding"]["evidence"]) > 0

    # Negative check: Premature retest before mitigation is rejected
    premature_retest = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "record_owner_check_enforced"},
    )
    assert premature_retest.status_code == 409
    assert premature_retest.json()["error"]["code"] == "INVALID_STATE_TRANSITION"

    # Step 4: Apply approved record ownership mitigation
    mit_res = client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "enforce_record_ownership"},
    )
    assert mit_res.status_code == 200
    mit_data = mit_res.json()
    assert mit_data["status"] == "mitigation_applied"
    assert mit_data["mitigation"]["id"] == "enforce_record_ownership"
    assert "---" in mit_data["mitigation"]["unified_diff"]

    # Step 5: Retest named assertion (record-ownership assertion)
    retest_res = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "record_owner_check_enforced"},
    )
    assert retest_res.status_code == 200
    retest_data = retest_res.json()
    assert retest_data["status"] == "verified"
    assert retest_data["verification"]["passed"] is True
    assert retest_data["verification"]["assertion_id"] == "record_owner_check_enforced"

    # Step 6: Verify persisted result and updated run status
    verified_res = client.get(f"/api/v1/runs/{run_id}")
    assert verified_res.status_code == 200
    verified_run = verified_res.json()
    assert verified_run["status"] == "verified"
    assert verified_run["applied_mitigation"]["id"] == "enforce_record_ownership"
    assert verified_run["verification"]["passed"] is True
    assert verified_run["verification"]["details"] is not None
    assert (
        verified_run["verification"]["details"]["active_mitigation"]
        == "enforce_record_ownership"
    )

    # Confirm strict sequence monotonicity
    events = verified_run["events"]
    assert len(events) >= 5
    for idx, evt in enumerate(events, start=1):
        assert evt["sequence"] == idx

    # Step 7: List runs and confirm BOLA run appears with accurate summary fields
    list_res = client.get("/api/v1/runs?limit=30")
    assert list_res.status_code == 200
    run_summary = next(r for r in list_res.json()["items"] if r["id"] == run_id)
    assert run_summary["status"] == "verified"
    assert run_summary["verification_passed"] is True
    assert run_summary["applied_mitigation_id"] == "enforce_record_ownership"
    assert run_summary["scenario_id"] == "bola_demo_v1"
    assert run_summary["event_count"] == len(events)

    # Step 8: Reset run using existing supported API semantics
    reset_res = client.post(f"/api/v1/runs/{run_id}/reset")
    assert reset_res.status_code == 200
    child_run = reset_res.json()
    child_run_id = child_run["id"]
    assert child_run_id != run_id
    assert child_run["status"] == "evidence_ready"
    assert child_run["reset_of_run_id"] == run_id
    assert child_run["scenario_id"] == "bola_demo_v1"

    # Step 9: Retrieve relevant run records again and verify persistence and lifecycle consistency
    orig_check = client.get(f"/api/v1/runs/{run_id}")
    assert orig_check.status_code == 200
    assert orig_check.json()["status"] == "reset"

    child_check = client.get(f"/api/v1/runs/{child_run_id}")
    assert child_check.status_code == 200
    assert child_check.json()["status"] == "evidence_ready"
    assert child_check.json()["reset_of_run_id"] == run_id

    # List runs reflects both
    list_after_reset = client.get("/api/v1/runs?limit=30")
    assert list_after_reset.status_code == 200
    list_items = list_after_reset.json()["items"]
    assert any(r["id"] == child_run_id and r["status"] == "evidence_ready" for r in list_items)
    assert any(r["id"] == run_id and r["status"] == "reset" for r in list_items)


def test_invalid_operations_and_transitions(client: TestClient) -> None:
    """Negative integration tests covering invalid scenario IDs, mitigations, assertions, and transitions."""
    # 1. Invalid scenario ID
    bad_scenario_res = client.post("/api/v1/runs", json={"scenario_id": "malicious_exploit_99"})
    assert bad_scenario_res.status_code == 404
    assert bad_scenario_res.json()["error"]["code"] == "SCENARIO_NOT_FOUND"

    # Create valid run
    run_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    run_id = run_res.json()["id"]

    # 2. Unsupported mitigation for scenario (cross-scenario mitigation)
    bad_mit_res = client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "enforce_record_ownership"},
    )
    assert bad_mit_res.status_code == 400
    assert bad_mit_res.json()["error"]["code"] == "MITIGATION_NOT_ALLOWED"

    # 3. Arbitrary non-allowlisted mitigation
    unknown_mit_res = client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "arbitrary_custom_patch"},
    )
    assert unknown_mit_res.status_code == 400
    assert unknown_mit_res.json()["error"]["code"] == "MITIGATION_NOT_ALLOWED"

    # Apply valid mitigation
    client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "parameterized_query"},
    )

    # 4. Incorrect assertion ID for scenario
    bad_assertion_res = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "record_owner_check_enforced"},
    )
    assert bad_assertion_res.status_code == 400
    assert bad_assertion_res.json()["error"]["code"] == "ASSERTION_NOT_ALLOWED"

    # Verify run
    client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )

    # 5. Invalid transition: cannot apply mitigation to verified run
    mit_after_verified = client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "parameterized_query"},
    )
    assert mit_after_verified.status_code == 409
    assert mit_after_verified.json()["error"]["code"] == "INVALID_STATE_TRANSITION"

    # 6. Invalid transition: cannot retest an already verified run
    retest_after_verified = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )
    assert retest_after_verified.status_code == 409
    assert retest_after_verified.json()["error"]["code"] == "INVALID_STATE_TRANSITION"

    # Reset run
    client.post(f"/api/v1/runs/{run_id}/reset")

    # 7. Invalid transition: cannot apply mitigation to a reset run
    mit_on_reset = client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "parameterized_query"},
    )
    assert mit_on_reset.status_code == 409
    assert mit_on_reset.json()["error"]["code"] == "INVALID_STATE_TRANSITION"

    # 8. Invalid transition: cannot retest a reset run
    retest_on_reset = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )
    assert retest_on_reset.status_code == 409
    assert retest_on_reset.json()["error"]["code"] == "INVALID_STATE_TRANSITION"

