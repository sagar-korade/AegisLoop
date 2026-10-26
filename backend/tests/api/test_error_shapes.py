"""Tests verifying that error responses strictly match the API contract structure."""
from fastapi import APIRouter
from fastapi.testclient import TestClient
from pydantic import BaseModel, ConfigDict
from app.domain.errors import (
    AssertionNotAllowedError,
    InvalidStateTransitionError,
    LocalLabDisabledError,
    MitigationNotAllowedError,
    RunNotFoundError,
    ScenarioNotFoundError,
)
from app.main import create_app


def test_404_not_found_error_envelope(client: TestClient) -> None:
    """Non-existent endpoints must return contract-compliant 404 envelope."""
    response = client.get("/non-existent-endpoint")
    assert response.status_code == 404

    data = response.json()
    assert "error" in data
    err = data["error"]
    assert err["code"] == "NOT_FOUND"
    assert isinstance(err["message"], str)
    assert err["details"] is None
    assert isinstance(err["request_id"], str)
    assert len(err["request_id"]) > 0


def test_405_method_not_allowed_error_envelope(client: TestClient) -> None:
    """Invoking an invalid HTTP method must return contract-compliant 405 envelope."""
    response = client.post("/health")
    assert response.status_code == 405

    data = response.json()
    assert "error" in data
    err = data["error"]
    assert err["code"] == "METHOD_NOT_ALLOWED"
    assert isinstance(err["message"], str)
    assert err["details"] is None
    assert isinstance(err["request_id"], str)


def test_422_validation_error_envelope(app) -> None:
    """Schema validation failures must return code VALIDATION_ERROR and details list."""
    router = APIRouter()

    class SamplePayload(BaseModel):
        scenario_id: str
        model_config = ConfigDict(extra="forbid")

    @router.post("/test-validation")
    def sample_endpoint(payload: SamplePayload):
        return {"received": payload.scenario_id}

    app.include_router(router)
    client = TestClient(app)

    # Missing required body parameter
    response = client.post("/test-validation", json={"unexpected_field": "val"})
    assert response.status_code == 422

    data = response.json()
    assert "error" in data
    err = data["error"]
    assert err["code"] == "VALIDATION_ERROR"
    assert err["message"] == "Request validation failed."
    assert isinstance(err["details"], list)
    assert len(err["details"]) > 0
    assert isinstance(err["request_id"], str)


def test_domain_exceptions_return_contract_envelopes(app) -> None:
    """Custom domain exceptions must serialize into the exact documented error shapes."""
    router = APIRouter()

    @router.get("/error/scenario-not-found")
    def trigger_scenario_not_found():
        raise ScenarioNotFoundError("unknown_id")

    @router.get("/error/run-not-found")
    def trigger_run_not_found():
        raise RunNotFoundError("run_123")

    @router.get("/error/invalid-transition")
    def trigger_invalid_transition():
        raise InvalidStateTransitionError("Cannot retest before mitigation is applied.")

    @router.get("/error/mitigation-not-allowed")
    def trigger_mitigation_not_allowed():
        raise MitigationNotAllowedError("Mitigation not allowed for this finding.")

    @router.get("/error/assertion-not-allowed")
    def trigger_assertion_not_allowed():
        raise AssertionNotAllowedError("Assertion not allowed for this scenario.")

    @router.get("/error/local-lab-disabled")
    def trigger_local_lab_disabled():
        raise LocalLabDisabledError()

    @router.get("/error/unexpected-internal")
    def trigger_unexpected_internal():
        raise RuntimeError("Simulated crash")

    app.include_router(router)
    client = TestClient(app)

    # 1. SCENARIO_NOT_FOUND (404)
    res = client.get("/error/scenario-not-found")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "SCENARIO_NOT_FOUND"
    assert "unknown_id" in res.json()["error"]["message"]
    assert res.json()["error"]["request_id"] is not None

    # 2. RUN_NOT_FOUND (404)
    res = client.get("/error/run-not-found")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "RUN_NOT_FOUND"

    # 3. INVALID_STATE_TRANSITION (409)
    res = client.get("/error/invalid-transition")
    assert res.status_code == 409
    assert res.json()["error"]["code"] == "INVALID_STATE_TRANSITION"

    # 4. MITIGATION_NOT_ALLOWED (400)
    res = client.get("/error/mitigation-not-allowed")
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "MITIGATION_NOT_ALLOWED"

    # 5. ASSERTION_NOT_ALLOWED (400)
    res = client.get("/error/assertion-not-allowed")
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "ASSERTION_NOT_ALLOWED"

    # 6. LOCAL_LAB_DISABLED (400)
    res = client.get("/error/local-lab-disabled")
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "LOCAL_LAB_DISABLED"


def test_500_internal_error_envelope(app) -> None:
    """Unhandled server errors must return code INTERNAL_ERROR and safe message."""
    router = APIRouter()

    @router.get("/error/unexpected-internal")
    def trigger_unexpected():
        raise RuntimeError("Simulated internal crash")

    app.include_router(router)
    client = TestClient(app, raise_server_exceptions=False)
    res = client.get("/error/unexpected-internal")
    assert res.status_code == 500
    data = response = res.json()
    assert data["error"]["code"] == "INTERNAL_ERROR"
    assert data["error"]["message"] == "An internal server error occurred."
    assert data["error"]["details"] is None
    assert data["error"]["request_id"] is not None
