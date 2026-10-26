"""Service for evaluating named assertions and verification results."""
from datetime import datetime, timezone
from typing import Optional
from app.adapters.simulation.fixtures.base import ScenarioFixture
from app.domain.errors import AssertionNotAllowedError, InvalidStateTransitionError
from app.schemas.verification import VerificationResult


class VerificationService:
    """Evaluates scenario-specific named assertions deterministically."""

    @staticmethod
    def evaluate_assertion(
        fixture: ScenarioFixture,
        applied_mitigation_id: Optional[str],
        requested_assertion_id: str,
    ) -> VerificationResult:
        """Evaluate a named assertion against the run's mitigation state.

        Raises:
            AssertionNotAllowedError: if the requested assertion is not allowlisted for the scenario.
            InvalidStateTransitionError: if retesting is attempted before applying a mitigation.
        """
        # 1. Assertions must match the fixture's allowlisted assertion ID
        if requested_assertion_id != fixture.assertion.id:
            raise AssertionNotAllowedError(
                f"Assertion '{requested_assertion_id}' is not valid for scenario '{fixture.id}'. "
                f"Expected '{fixture.assertion.id}'."
            )

        # 2. Retest requires a previously applied mitigation
        if applied_mitigation_id is None:
            raise InvalidStateTransitionError(
                "Retest is available only after an approved mitigation has been applied."
            )

        now_iso = datetime.now(timezone.utc).isoformat()

        # 3. Deterministic assertion evaluation
        if applied_mitigation_id in fixture.allowed_mitigations:
            return VerificationResult(
                assertion_id=fixture.assertion.id,
                passed=True,
                summary=fixture.assertion.summary,
                evaluated_at=now_iso,
                limitations=fixture.assertion.limitations,
                details={
                    "evaluated_assertion": fixture.assertion.description,
                    "active_mitigation": applied_mitigation_id,
                },
            )

        # Unapproved or invalid mitigation in place
        return VerificationResult(
            assertion_id=fixture.assertion.id,
            passed=False,
            summary="Verification failed: applied mitigation does not satisfy this assertion.",
            evaluated_at=now_iso,
            limitations=fixture.assertion.limitations,
            details={
                "evaluated_assertion": fixture.assertion.description,
                "reason": "unapproved_mitigation",
            },
        )
