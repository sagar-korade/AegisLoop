"""Unit tests for named assertion evaluation and verification."""
import pytest
from app.domain.errors import AssertionNotAllowedError, InvalidStateTransitionError
from app.services.scenario_service import ScenarioService
from app.services.verification_service import VerificationService


def test_scenario_a_assertion_evaluation_success() -> None:
    """Scenario A assertion passes when approved parameterized_query is applied."""
    fixture = ScenarioService.get_scenario("sqli_demo_v1")

    result = VerificationService.evaluate_assertion(
        fixture=fixture,
        applied_mitigation_id="parameterized_query",
        requested_assertion_id="sqli_input_is_parameterized",
    )

    assert result.assertion_id == "sqli_input_is_parameterized"
    assert result.passed is True
    assert "passed" in result.summary.lower()
    assert "simulation fixture" in result.limitations
    assert result.evaluated_at is not None
    assert result.details is not None
    assert result.details["active_mitigation"] == "parameterized_query"


def test_scenario_b_assertion_evaluation_success() -> None:
    """Scenario B assertion passes when approved enforce_record_ownership is applied."""
    fixture = ScenarioService.get_scenario("bola_demo_v1")

    result = VerificationService.evaluate_assertion(
        fixture=fixture,
        applied_mitigation_id="enforce_record_ownership",
        requested_assertion_id="record_owner_check_enforced",
    )

    assert result.assertion_id == "record_owner_check_enforced"
    assert result.passed is True
    assert "passed" in result.summary.lower()
    assert "simulation" in result.limitations
    assert result.details is not None
    assert result.details["active_mitigation"] == "enforce_record_ownership"


def test_retest_before_mitigation_raises_409() -> None:
    """Attempting verification before applying a mitigation must raise 409 INVALID_STATE_TRANSITION."""
    fixture = ScenarioService.get_scenario("sqli_demo_v1")

    with pytest.raises(InvalidStateTransitionError) as exc_info:
        VerificationService.evaluate_assertion(
            fixture=fixture,
            applied_mitigation_id=None,
            requested_assertion_id="sqli_input_is_parameterized",
        )

    err = exc_info.value
    assert err.status_code == 409
    assert err.code == "INVALID_STATE_TRANSITION"


def test_wrong_assertion_id_rejected_with_400() -> None:
    """Requesting an assertion not bound to the active scenario must raise 400 ASSERTION_NOT_ALLOWED."""
    fixture = ScenarioService.get_scenario("sqli_demo_v1")

    # 1. Arbitrary non-existent assertion
    with pytest.raises(AssertionNotAllowedError) as exc_info:
        VerificationService.evaluate_assertion(
            fixture=fixture,
            applied_mitigation_id="parameterized_query",
            requested_assertion_id="completely_arbitrary_assertion",
        )
    assert exc_info.value.status_code == 400
    assert exc_info.value.code == "ASSERTION_NOT_ALLOWED"

    # 2. Cross-scenario assertion (Scenario B assertion requested on Scenario A)
    with pytest.raises(AssertionNotAllowedError) as exc_info:
        VerificationService.evaluate_assertion(
            fixture=fixture,
            applied_mitigation_id="parameterized_query",
            requested_assertion_id="record_owner_check_enforced",
        )
    assert exc_info.value.status_code == 400
    assert exc_info.value.code == "ASSERTION_NOT_ALLOWED"


def test_assertion_fails_when_mitigation_does_not_satisfy() -> None:
    """If an unapproved mitigation somehow reached evaluation, assertion must report passed=False."""
    fixture = ScenarioService.get_scenario("sqli_demo_v1")

    result = VerificationService.evaluate_assertion(
        fixture=fixture,
        applied_mitigation_id="ineffective_mitigation_xyz",
        requested_assertion_id="sqli_input_is_parameterized",
    )

    assert result.passed is False
    assert "failed" in result.summary.lower()
    assert result.details["reason"] == "unapproved_mitigation"
