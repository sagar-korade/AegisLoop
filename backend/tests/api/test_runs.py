"""API contract tests for runs endpoints:
- POST /api/v1/runs
- GET /api/v1/runs/{id}
- POST /api/v1/runs/{id}/reset
"""
from fastapi.testclient import TestClient


def test_create_run_sqli_success(client: TestClient) -> None:
    """POST /api/v1/runs with sqli_demo_v1 creates a run and returns 201 with evidence_ready."""
    payload = {"scenario_id": "sqli_demo_v1", "mode": "simulation"}
    response = client.post("/api/v1/runs", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["id"].startswith("run_")
    assert data["scenario_id"] == "sqli_demo_v1"
    assert data["mode"] == "simulation"
    assert data["status"] == "evidence_ready"
    assert data["applied_mitigation"] is None
    assert data["verification"] is None
    assert data["expected_assertion_id"] == "sqli_input_is_parameterized"
    assert data["reset_of_run_id"] is None
    assert isinstance(data["created_at"], str)
    assert isinstance(data["updated_at"], str)

    # Validate ordered events
    events = data["events"]
    assert isinstance(events, list)
    assert len(events) >= 3
    for i, evt in enumerate(events, start=1):
        assert evt["sequence"] == i
        assert evt["run_id"] == data["id"]
        assert "event_type" in evt
        assert "stage" in evt
        assert "occurred_at" in evt
        assert "title" in evt
        assert "message" in evt

    # Validate finding
    finding = data["finding"]
    assert "finding" in finding["id"]
    assert finding["severity"] == "high"
    assert "Unsafe Query" in finding["title"] or "SQL" in finding["title"]
    assert len(finding["evidence"]) > 0
    for ev_item in finding["evidence"]:
        assert "type" in ev_item
        assert "label" in ev_item
        assert "content" in ev_item

    # Validate available mitigations
    mitigations = data["available_mitigations"]
    assert len(mitigations) == 1
    assert mitigations[0]["id"] == "parameterized_query"
    assert "parameter" in mitigations[0]["label"].lower()


def test_create_run_bola_success(client: TestClient) -> None:
    """POST /api/v1/runs with bola_demo_v1 creates a run and returns 201."""
    payload = {"scenario_id": "bola_demo_v1", "mode": "simulation"}
    response = client.post("/api/v1/runs", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["scenario_id"] == "bola_demo_v1"
    assert data["status"] == "evidence_ready"
    assert data["expected_assertion_id"] == "record_owner_check_enforced"
    assert data["finding"]["severity"] == "high"
    assert len(data["available_mitigations"]) == 1
    assert data["available_mitigations"][0]["id"] == "enforce_record_ownership"


def test_create_run_unknown_scenario_returns_404(client: TestClient) -> None:
    """POST /api/v1/runs with an unknown scenario ID must return 404 SCENARIO_NOT_FOUND."""
    payload = {"scenario_id": "non_existent_scenario_999", "mode": "simulation"}
    response = client.post("/api/v1/runs", json=payload)
    assert response.status_code == 404

    data = response.json()
    assert "error" in data
    err = data["error"]
    assert err["code"] == "SCENARIO_NOT_FOUND"
    assert "non_existent_scenario_999" in err["message"]
    assert err["request_id"] is not None


def test_create_run_local_lab_when_disabled_returns_400(client: TestClient) -> None:
    """POST /api/v1/runs requesting local_lab mode when disabled must return 400 LOCAL_LAB_DISABLED."""
    payload = {"scenario_id": "sqli_demo_v1", "mode": "local_lab"}
    response = client.post("/api/v1/runs", json=payload)
    assert response.status_code == 400

    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "LOCAL_LAB_DISABLED"
    assert data["error"]["request_id"] is not None


def test_create_run_extra_fields_rejected_with_422(client: TestClient) -> None:
    """POST /api/v1/runs with extra fields must be rejected with 422 VALIDATION_ERROR."""
    payload = {
        "scenario_id": "sqli_demo_v1",
        "mode": "simulation",
        "arbitrary_field": "disallowed",
    }
    response = client.post("/api/v1/runs", json=payload)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_get_run_success(client: TestClient) -> None:
    """GET /api/v1/runs/{id} must retrieve the persisted run and ordered events."""
    # First create a run
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    assert create_res.status_code == 201
    run_id = create_res.json()["id"]

    # Retrieve the run
    get_res = client.get(f"/api/v1/runs/{run_id}")
    assert get_res.status_code == 200

    data = get_res.json()
    assert data["id"] == run_id
    assert data["scenario_id"] == "sqli_demo_v1"
    assert data["status"] == "evidence_ready"
    assert len(data["events"]) == len(create_res.json()["events"])
    assert data["finding"]["id"] == create_res.json()["finding"]["id"]


def test_get_unknown_run_returns_404(client: TestClient) -> None:
    """GET /api/v1/runs/{unknown_id} must return 404 RUN_NOT_FOUND."""
    response = client.get("/api/v1/runs/run_non_existent_999")
    assert response.status_code == 404

    data = response.json()
    assert data["error"]["code"] == "RUN_NOT_FOUND"
    assert "run_non_existent_999" in data["error"]["message"]
    assert data["error"]["request_id"] is not None


def test_reset_run_lifecycle(client: TestClient) -> None:
    """POST /api/v1/runs/{id}/reset marks original run as reset and spawns active child run."""
    # 1. Create original run
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    orig_id = create_res.json()["id"]

    # 2. Reset the run
    reset_res = client.post(f"/api/v1/runs/{orig_id}/reset")
    assert reset_res.status_code == 200

    new_run = reset_res.json()
    assert new_run["id"] != orig_id
    assert new_run["scenario_id"] == "sqli_demo_v1"
    assert new_run["status"] == "evidence_ready"
    assert new_run["reset_of_run_id"] == orig_id
    assert len(new_run["events"]) > 0

    # 3. Verify original run is now marked as reset
    orig_check_res = client.get(f"/api/v1/runs/{orig_id}")
    assert orig_check_res.status_code == 200
    orig_data = orig_check_res.json()
    assert orig_data["status"] == "reset"

    # 4. Check audit event on original run
    event_types = [e["event_type"] for e in orig_data["events"]]
    assert "run_reset" in event_types


def test_reset_unknown_run_returns_404(client: TestClient) -> None:
    """POST /api/v1/runs/{unknown_id}/reset must return 404 RUN_NOT_FOUND."""
    response = client.post("/api/v1/runs/run_ghost/reset")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "RUN_NOT_FOUND"


# ==============================================================================
# Regression Tests: GET /api/v1/runs and Persisted Verification Restoration
# ==============================================================================


def test_list_runs_empty_returns_empty_items(client: TestClient) -> None:
    """GET /api/v1/runs returns a typed envelope with an empty list when no runs exist."""
    response = client.get("/api/v1/runs")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) == 0


def test_list_runs_multiple_returns_newest_first(client: TestClient) -> None:
    """Creating multiple runs and listing them returns persisted runs in newest-first order."""
    # 1. Create three runs in sequence
    r1 = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"}).json()
    r2 = client.post("/api/v1/runs", json={"scenario_id": "bola_demo_v1"}).json()
    r3 = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"}).json()

    # 2. List runs
    response = client.get("/api/v1/runs")
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) == 3

    # Newest-first ordering (r3 was created last, r1 first)
    assert items[0]["id"] == r3["id"]
    assert items[1]["id"] == r2["id"]
    assert items[2]["id"] == r1["id"]

    # Verify summary fields match persisted entity attributes
    item_0 = items[0]
    assert item_0["scenario_id"] == "sqli_demo_v1"
    assert item_0["mode"] == "simulation"
    assert item_0["status"] == "evidence_ready"
    assert isinstance(item_0["created_at"], str)
    assert isinstance(item_0["updated_at"], str)
    assert item_0["event_count"] >= 3
    assert item_0["applied_mitigation_id"] is None
    assert item_0["verification_passed"] is None


def test_list_runs_limit_respected_and_invalid_rejected(client: TestClient) -> None:
    """The list limit parameter is respected and out-of-bound/malformed limits are rejected."""
    # Create 4 runs
    created_ids = []
    for _ in range(4):
        res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
        created_ids.append(res.json()["id"])

    # Limit = 2 returns exactly the 2 newest runs
    res_limited = client.get("/api/v1/runs?limit=2")
    assert res_limited.status_code == 200
    items = res_limited.json()["items"]
    assert len(items) == 2
    assert items[0]["id"] == created_ids[3]
    assert items[1]["id"] == created_ids[2]

    # Rejection of invalid limits with 422 VALIDATION_ERROR
    # Limit 0 (below minimum 1)
    res_zero = client.get("/api/v1/runs?limit=0")
    assert res_zero.status_code == 422
    assert res_zero.json()["error"]["code"] == "VALIDATION_ERROR"

    # Limit 101 (above maximum 100)
    res_over = client.get("/api/v1/runs?limit=101")
    assert res_over.status_code == 422
    assert res_over.json()["error"]["code"] == "VALIDATION_ERROR"

    # Negative limit
    res_neg = client.get("/api/v1/runs?limit=-5")
    assert res_neg.status_code == 422
    assert res_neg.json()["error"]["code"] == "VALIDATION_ERROR"

    # Non-integer limit
    res_str = client.get("/api/v1/runs?limit=not_a_number")
    assert res_str.status_code == 422
    assert res_str.json()["error"]["code"] == "VALIDATION_ERROR"


def test_list_runs_independent_of_browser_storage(client: TestClient) -> None:
    """Listing runs discovers persisted SQLite state directly without relying on browser IDs."""
    # Create run A and run B
    res_a = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    res_b = client.post("/api/v1/runs", json={"scenario_id": "bola_demo_v1"})
    id_a = res_a.json()["id"]
    id_b = res_b.json()["id"]

    # Client query passes zero IDs or storage tokens
    list_res = client.get("/api/v1/runs")
    assert list_res.status_code == 200
    listed_ids = [item["id"] for item in list_res.json()["items"]]

    assert id_a in listed_ids
    assert id_b in listed_ids


def test_run_without_verification_represented_correctly(client: TestClient) -> None:
    """A run that has never been retested has verification=null and does not invent results."""
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    run_id = create_res.json()["id"]

    # Inspect single run
    get_res = client.get(f"/api/v1/runs/{run_id}")
    assert get_res.status_code == 200
    run_data = get_res.json()
    assert run_data["verification"] is None
    assert run_data["status"] == "evidence_ready"

    # Inspect list summary
    list_res = client.get("/api/v1/runs")
    item = next(it for it in list_res.json()["items"] if it["id"] == run_id)
    assert item["verification_passed"] is None
    assert item["applied_mitigation_id"] is None


def test_persisted_verification_restores_evaluation_timestamp_and_details(
    client: TestClient,
) -> None:
    """Retrieving a verified run restores the actual persisted evaluated_at and details_json."""
    # 1. Create run
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    run_id = create_res.json()["id"]

    # 2. Apply mitigation
    client.post(
        f"/api/v1/runs/{run_id}/mitigations",
        json={"mitigation_id": "parameterized_query"},
    )

    # 3. Retest named assertion
    retest_res = client.post(
        f"/api/v1/runs/{run_id}/retest",
        json={"assertion_id": "sqli_input_is_parameterized"},
    )
    assert retest_res.status_code == 200

    # 4. Fetch the run via GET /runs/{run_id}
    get_res = client.get(f"/api/v1/runs/{run_id}")
    assert get_res.status_code == 200
    run_data = get_res.json()

    assert run_data["status"] == "verified"
    ver = run_data["verification"]
    assert ver is not None
    assert ver["assertion_id"] == "sqli_input_is_parameterized"
    assert ver["passed"] is True
    assert isinstance(ver["evaluated_at"], str)
    assert len(ver["evaluated_at"]) > 0
    assert "T" in ver["evaluated_at"]  # ISO-8601 UTC timestamp format

    # Details must be deserialized dictionary, not null
    assert ver["details"] is not None
    assert isinstance(ver["details"], dict)
    assert ver["details"]["active_mitigation"] == "parameterized_query"
    assert "evaluated_assertion" in ver["details"]

    # Scope limitations must be retained
    assert "limitations" in ver
    assert len(ver["limitations"]) > 0

    # 5. Verify that list endpoint summary reflects verified state
    list_res = client.get("/api/v1/runs")
    assert list_res.status_code == 200
    summary_item = next(it for it in list_res.json()["items"] if it["id"] == run_id)
    assert summary_item["status"] == "verified"
    assert summary_item["verification_passed"] is True
    assert summary_item["applied_mitigation_id"] == "parameterized_query"
    assert summary_item["event_count"] >= 5


def test_delete_runs_clears_persisted_history_and_events(client: TestClient) -> None:
    """DELETE /api/v1/runs clears all runs and events, and GET /api/v1/runs returns empty list."""
    # 1. Ensure at least one run exists
    create_res = client.post("/api/v1/runs", json={"scenario_id": "sqli_demo_v1"})
    assert create_res.status_code == 201
    run_id = create_res.json()["id"]

    # Verify run exists in list and by ID
    list_before = client.get("/api/v1/runs")
    assert list_before.status_code == 200
    assert any(it["id"] == run_id for it in list_before.json()["items"])

    get_before = client.get(f"/api/v1/runs/{run_id}")
    assert get_before.status_code == 200

    # 2. DELETE /api/v1/runs
    del_res = client.delete("/api/v1/runs")
    assert del_res.status_code == 200
    del_data = del_res.json()
    assert del_data["cleared_count"] >= 1
    assert "cleared" in del_data["message"].lower()

    # 3. Verify runs are gone
    list_after = client.get("/api/v1/runs")
    assert list_after.status_code == 200
    assert list_after.json()["items"] == []

    get_after = client.get(f"/api/v1/runs/{run_id}")
    assert get_after.status_code == 404
    assert get_after.json()["error"]["code"] == "RUN_NOT_FOUND"


def test_delete_runs_when_empty_returns_200(client: TestClient) -> None:
    """DELETE /api/v1/runs when database has no runs returns 200 with cleared_count 0."""
    # Clear any leftover runs
    client.delete("/api/v1/runs")

    # Second call on empty DB
    del_res = client.delete("/api/v1/runs")
    assert del_res.status_code == 200
    del_data = del_res.json()
    assert del_data["cleared_count"] == 0
    assert "0" in del_data["message"]


