"""AegisLoop workflow state machine and transition validation."""
from app.domain.enums import RunStatus
from app.domain.errors import InvalidStateTransitionError

# Permitted state transitions dictionary
ALLOWED_TRANSITIONS: dict[RunStatus, set[RunStatus]] = {
    RunStatus.CREATED: {RunStatus.TESTING},
    RunStatus.TESTING: {RunStatus.EVIDENCE_READY},
    RunStatus.EVIDENCE_READY: {RunStatus.MITIGATION_APPLIED},
    RunStatus.MITIGATION_APPLIED: {RunStatus.RETESTING},
    RunStatus.RETESTING: {RunStatus.VERIFIED, RunStatus.VERIFICATION_FAILED},
    RunStatus.VERIFICATION_FAILED: {RunStatus.RETESTING},
    RunStatus.VERIFIED: set(),  # Terminal verification state; safe reset allowed
    RunStatus.RESET: {RunStatus.CREATED, RunStatus.TESTING},
}


def can_transition(current_status: RunStatus, target_status: RunStatus) -> bool:
    """Return True if the transition from current_status to target_status is valid."""
    # Reset is safe and always permitted from any state
    if target_status == RunStatus.RESET:
        return True

    allowed_targets = ALLOWED_TRANSITIONS.get(current_status, set())
    return target_status in allowed_targets


def validate_transition(current_status: RunStatus, target_status: RunStatus) -> None:
    """Validate transition or raise 409 INVALID_STATE_TRANSITION error."""
    if not can_transition(current_status, target_status):
        raise InvalidStateTransitionError(
            f"Invalid state transition: cannot transition run from '{current_status.value}' "
            f"to '{target_status.value}'."
        )
