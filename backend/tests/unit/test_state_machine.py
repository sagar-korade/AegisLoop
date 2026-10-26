"""Unit tests for workflow state machine and transition validation."""
import pytest
from app.domain.enums import RunStatus
from app.domain.errors import InvalidStateTransitionError
from app.domain.state_machine import can_transition, validate_transition


@pytest.mark.parametrize(
    "current_status,target_status",
    [
        (RunStatus.CREATED, RunStatus.TESTING),
        (RunStatus.TESTING, RunStatus.EVIDENCE_READY),
        (RunStatus.EVIDENCE_READY, RunStatus.MITIGATION_APPLIED),
        (RunStatus.MITIGATION_APPLIED, RunStatus.RETESTING),
        (RunStatus.RETESTING, RunStatus.VERIFIED),
        (RunStatus.RETESTING, RunStatus.VERIFICATION_FAILED),
        (RunStatus.VERIFICATION_FAILED, RunStatus.RETESTING),
        (RunStatus.RESET, RunStatus.CREATED),
        (RunStatus.RESET, RunStatus.TESTING),
    ],
)
def test_permitted_transitions_succeed(
    current_status: RunStatus, target_status: RunStatus
) -> None:
    """All documented valid state machine transitions must be allowed."""
    assert can_transition(current_status, target_status) is True
    # Must not raise an exception
    validate_transition(current_status, target_status)


@pytest.mark.parametrize("status", list(RunStatus))
def test_transition_to_reset_always_allowed(status: RunStatus) -> None:
    """Safe reset is permitted from any state in the lifecycle."""
    assert can_transition(status, RunStatus.RESET) is True
    validate_transition(status, RunStatus.RESET)


@pytest.mark.parametrize(
    "current_status,target_status",
    [
        (RunStatus.CREATED, RunStatus.VERIFIED),
        (RunStatus.CREATED, RunStatus.EVIDENCE_READY),
        (RunStatus.CREATED, RunStatus.MITIGATION_APPLIED),
        (RunStatus.CREATED, RunStatus.RETESTING),
        (RunStatus.TESTING, RunStatus.VERIFIED),
        (RunStatus.TESTING, RunStatus.MITIGATION_APPLIED),
        (RunStatus.EVIDENCE_READY, RunStatus.VERIFIED),
        (RunStatus.EVIDENCE_READY, RunStatus.RETESTING),
        (RunStatus.EVIDENCE_READY, RunStatus.TESTING),
        (RunStatus.MITIGATION_APPLIED, RunStatus.VERIFIED),
        (RunStatus.MITIGATION_APPLIED, RunStatus.EVIDENCE_READY),
        (RunStatus.MITIGATION_APPLIED, RunStatus.TESTING),
        (RunStatus.VERIFIED, RunStatus.TESTING),
        (RunStatus.VERIFIED, RunStatus.EVIDENCE_READY),
        (RunStatus.VERIFIED, RunStatus.MITIGATION_APPLIED),
        (RunStatus.VERIFICATION_FAILED, RunStatus.VERIFIED),
        (RunStatus.VERIFICATION_FAILED, RunStatus.EVIDENCE_READY),
    ],
)
def test_prohibited_transitions_raise_409(
    current_status: RunStatus, target_status: RunStatus
) -> None:
    """Illegal state transitions must be rejected with 409 INVALID_STATE_TRANSITION."""
    assert can_transition(current_status, target_status) is False

    with pytest.raises(InvalidStateTransitionError) as exc_info:
        validate_transition(current_status, target_status)

    err = exc_info.value
    assert err.status_code == 409
    assert err.code == "INVALID_STATE_TRANSITION"
    assert current_status.value in err.message
    assert target_status.value in err.message
