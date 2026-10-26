"""Orchestration service coordinating runs, evidence, mitigations, and persistence."""
from datetime import datetime, timezone
import json
import logging
from typing import Any, Dict, List, Optional
import uuid
from sqlalchemy.orm import Session

from app.adapters.simulation.fixtures.base import ScenarioFixture
from app.adapters.simulation.runner import SimulationRunner
from app.db.repositories.event_repo import EventRepository
from app.db.repositories.run_repo import RunRepository
from app.db.schema import RunModel
from app.domain.enums import EventType, ExecutionMode, RunStatus, WorkflowStage
from app.domain.errors import InvalidStateTransitionError, LocalLabDisabledError
from app.schemas.events import RunEvent
from app.schemas.mitigations import MitigationDetail, MitigationResponse
from app.schemas.runs import (
    ClearHistoryResponse,
    RunListResponse,
    RunResponse,
    RunSummaryItem,
)
from app.schemas.verification import (
    RetestResponse,
    VerificationResult,
    VerificationSummary,
)
from app.services.evidence_service import EvidenceService
from app.services.mitigation_service import MitigationService
from app.services.scenario_service import ScenarioService
from app.services.verification_service import VerificationService

logger = logging.getLogger("aegisloop")


class RunService:
    """Orchestrates security workflow runs, state mutations, and persistence."""

    @classmethod
    def list_runs(cls, session: Session, limit: int = 30) -> RunListResponse:
        """Retrieve persisted workflow runs in newest-first order without N+1 queries."""
        records = RunRepository.list_runs(session, limit=limit)
        items = [
            RunSummaryItem(
                id=run.id,
                scenario_id=run.scenario_id,
                mode=ExecutionMode(run.mode),
                status=RunStatus(run.status),
                created_at=run.created_at,
                updated_at=run.updated_at,
                applied_mitigation_id=run.applied_mitigation_id,
                verification_passed=run.verification_passed,
                reset_of_run_id=run.reset_of_run_id,
                event_count=count,
            )
            for run, count in records
        ]
        return RunListResponse(items=items)

    @classmethod
    def clear_history(cls, session: Session) -> ClearHistoryResponse:
        """Clear all persisted workflow run history and associated records."""
        cleared_count = RunRepository.clear_history(session)
        logger.info("Cleared %d persisted run history records.", cleared_count)
        return ClearHistoryResponse(
            cleared_count=cleared_count,
            message=f"Successfully cleared {cleared_count} run history record(s).",
        )

    @classmethod
    def create_run(
        cls,
        session: Session,
        scenario_id: str,
        mode: ExecutionMode = ExecutionMode.SIMULATION,
        enable_local_lab: bool = False,
    ) -> RunResponse:
        """Initialize a new workflow run, generate simulation events, and advance to evidence_ready."""
        if mode == ExecutionMode.LOCAL_LAB and not enable_local_lab:
            raise LocalLabDisabledError("Local lab execution is disabled by configuration.")

        fixture = ScenarioService.get_scenario(scenario_id)
        run_id = f"run_{uuid.uuid4().hex[:12]}"

        # 1. Create run record in CREATED status
        RunRepository.create_run(
            session=session,
            run_id=run_id,
            scenario_id=scenario_id,
            scenario_version=fixture.version,
            mode=mode,
            status=RunStatus.CREATED,
        )

        # 2. Advance to TESTING
        RunRepository.update_status(session, run_id, RunStatus.TESTING)

        # 3. Generate and persist deterministic scenario events
        events = SimulationRunner.run_scenario(fixture, run_id=run_id)
        EventRepository.append_events(session, events)

        # 4. Advance to EVIDENCE_READY
        run = RunRepository.update_status(session, run_id, RunStatus.EVIDENCE_READY)

        return cls.build_run_response(session, run, fixture)

    @classmethod
    def get_run(cls, session: Session, run_id: str) -> RunResponse:
        """Fetch a persisted run, its ordered events, finding, and active state."""
        run = RunRepository.get_run_or_raise(session, run_id)
        fixture = ScenarioService.get_scenario(run.scenario_id)
        return cls.build_run_response(session, run, fixture)

    @classmethod
    def apply_mitigation(
        cls, session: Session, run_id: str, mitigation_id: str
    ) -> MitigationResponse:
        """Validate and apply an allowlisted mitigation to an active run."""
        run = RunRepository.get_run_or_raise(session, run_id)
        fixture = ScenarioService.get_scenario(run.scenario_id)

        # Validate mitigation is allowlisted for this specific scenario
        detail = MitigationService.apply_mitigation(fixture, mitigation_id)

        # Transition run state (enforces that run is in evidence_ready)
        updated_run = RunRepository.apply_mitigation(session, run_id, mitigation_id)

        # Append structured mitigation event to timeline
        next_seq = EventRepository.get_next_sequence(session, run_id)
        mit_event = SimulationRunner.create_mitigation_event(
            run_id=run_id,
            sequence=next_seq,
            mitigation_id=mitigation_id,
            label=detail.label,
        )
        EventRepository.append_event(session, mit_event)

        return MitigationResponse(
            run_id=run_id,
            status=RunStatus(updated_run.status),
            mitigation=detail,
        )

    @classmethod
    def retest_run(
        cls, session: Session, run_id: str, assertion_id: str
    ) -> RetestResponse:
        """Evaluate a named assertion against an active mitigation and record outcome."""
        run = RunRepository.get_run_or_raise(session, run_id)
        fixture = ScenarioService.get_scenario(run.scenario_id)

        current_status = RunStatus(run.status)
        if current_status not in {RunStatus.MITIGATION_APPLIED, RunStatus.VERIFICATION_FAILED}:
            raise InvalidStateTransitionError(
                f"Retest is available only after an approved mitigation has been applied. "
                f"Current status: '{current_status.value}'."
            )

        # Evaluate assertion deterministically against active mitigation
        result = VerificationService.evaluate_assertion(
            fixture=fixture,
            applied_mitigation_id=run.applied_mitigation_id,
            requested_assertion_id=assertion_id,
        )

        target_status = RunStatus.VERIFIED if result.passed else RunStatus.VERIFICATION_FAILED

        # Transition to RETESTING then target status
        RunRepository.update_status(session, run_id, RunStatus.RETESTING)

        next_seq = EventRepository.get_next_sequence(session, run_id)
        ver_event = SimulationRunner.create_verification_event(
            run_id=run_id,
            sequence=next_seq,
            assertion_id=assertion_id,
            passed=result.passed,
        )
        EventRepository.append_event(session, ver_event)

        updated_run, _ = RunRepository.record_verification(
            session=session,
            run_id=run_id,
            verification=result,
            new_status=target_status,
        )

        return RetestResponse(
            status=RunStatus(updated_run.status),
            verification=VerificationSummary(
                assertion_id=result.assertion_id,
                passed=result.passed,
                summary=result.summary,
                limitations=result.limitations,
            ),
        )

    @classmethod
    def reset_run(cls, session: Session, run_id: str) -> RunResponse:
        """Safely reset an active run by creating a linked successor run."""
        original_run = RunRepository.get_run_or_raise(session, run_id)
        fixture = ScenarioService.get_scenario(original_run.scenario_id)

        # Append audit event to original run
        now_iso = datetime.now(timezone.utc).isoformat()
        next_seq = EventRepository.get_next_sequence(session, run_id)
        reset_event = RunEvent(
            id=f"{run_id}_evt_{next_seq:03d}",
            run_id=run_id,
            sequence=next_seq,
            event_type=EventType.RUN_RESET,
            stage=WorkflowStage.BLUE_AGENT,
            occurred_at=now_iso,
            title="Run Reset",
            message=f"Run reset requested. Original run marked as reset.",
        )
        EventRepository.append_event(session, reset_event)

        # Reset original and create linked replacement run
        new_run_id = f"run_{uuid.uuid4().hex[:12]}"
        _, new_run = RunRepository.reset_run(session, run_id, new_run_id)

        # Advance new run to evidence_ready
        RunRepository.update_status(session, new_run_id, RunStatus.TESTING)
        new_events = SimulationRunner.run_scenario(fixture, run_id=new_run_id)
        EventRepository.append_events(session, new_events)
        active_new_run = RunRepository.update_status(
            session, new_run_id, RunStatus.EVIDENCE_READY
        )

        return cls.build_run_response(session, active_new_run, fixture)

    @classmethod
    def build_run_response(
        cls, session: Session, run: RunModel, fixture: ScenarioFixture
    ) -> RunResponse:
        """Transform a persisted RunModel and its related entities into a contract RunResponse."""
        event_models = EventRepository.get_events_for_run(session, run.id)
        events: List[RunEvent] = []
        for e in event_models:
            evidence_data: Optional[Dict[str, Any]] = None
            if e.evidence_json:
                try:
                    parsed_ev = json.loads(e.evidence_json)
                    if isinstance(parsed_ev, dict):
                        evidence_data = parsed_ev
                except Exception as exc:
                    logger.warning(
                        "Failed to deserialize event evidence_json for event '%s': %s",
                        e.id,
                        exc,
                    )
            events.append(
                RunEvent(
                    id=e.id,
                    run_id=e.run_id,
                    sequence=e.sequence,
                    event_type=EventType(e.event_type),
                    stage=WorkflowStage(e.stage),
                    occurred_at=e.occurred_at,
                    title=e.title,
                    message=e.message,
                    evidence_json=evidence_data,
                )
            )

        finding = EvidenceService.build_finding(fixture, run.id)
        available_mitigations = EvidenceService.build_available_mitigations(fixture)

        applied_mitigation: Optional[MitigationDetail] = None
        if run.applied_mitigation_id:
            try:
                applied_mitigation = MitigationService.apply_mitigation(
                    fixture, run.applied_mitigation_id
                )
            except Exception:
                pass

        verification: Optional[VerificationResult] = None
        ver_model = RunRepository.get_latest_verification(session, run.id)
        if ver_model is not None:
            details: Optional[Dict[str, Any]] = None
            if ver_model.details_json:
                try:
                    parsed_details = json.loads(ver_model.details_json)
                    if isinstance(parsed_details, dict):
                        details = parsed_details
                    else:
                        logger.warning(
                            "Verification details_json for run '%s' is not a dictionary; ignoring.",
                            run.id,
                        )
                except Exception as exc:
                    logger.warning(
                        "Failed to deserialize verification details_json for run '%s': %s",
                        run.id,
                        exc,
                    )
            verification = VerificationResult(
                assertion_id=ver_model.assertion_id,
                passed=ver_model.passed,
                summary=ver_model.summary,
                evaluated_at=ver_model.evaluated_at,
                limitations=ver_model.limitations,
                details=details,
            )
        elif run.verification_passed is not None:
            logger.warning(
                "Run '%s' has verification_passed=%s but no persisted verification result record was found.",
                run.id,
                run.verification_passed,
            )

        return RunResponse(
            id=run.id,
            scenario_id=run.scenario_id,
            mode=ExecutionMode(run.mode),
            status=RunStatus(run.status),
            events=events,
            finding=finding,
            available_mitigations=available_mitigations,
            applied_mitigation=applied_mitigation,
            verification=verification,
            expected_assertion_id=fixture.assertion.id,
            created_at=run.created_at,
            updated_at=run.updated_at,
            reset_of_run_id=run.reset_of_run_id,
        )

