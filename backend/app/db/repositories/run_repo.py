"""Repository for run entity persistence and state transitions."""
from datetime import datetime, timezone
import json
from typing import List, Optional, Tuple
import uuid
from sqlalchemy import delete, func, select, update
from sqlalchemy.orm import Session
from app.db.schema import RunEventModel, RunModel, VerificationResultModel
from app.domain.enums import ExecutionMode, RunStatus
from app.domain.errors import InvalidStateTransitionError, RunNotFoundError
from app.domain.state_machine import validate_transition
from app.schemas.verification import VerificationResult


class RunRepository:
    """Manages transactional persistence for RunModel entities."""

    @staticmethod
    def create_run(
        session: Session,
        run_id: str,
        scenario_id: str,
        scenario_version: str,
        mode: ExecutionMode = ExecutionMode.SIMULATION,
        status: RunStatus = RunStatus.CREATED,
        reset_of_run_id: Optional[str] = None,
    ) -> RunModel:
        """Create and persist a new workflow run record."""
        now_iso = datetime.now(timezone.utc).isoformat()
        run = RunModel(
            id=run_id,
            scenario_id=scenario_id,
            scenario_version=scenario_version,
            mode=mode.value,
            status=status.value,
            created_at=now_iso,
            updated_at=now_iso,
            reset_of_run_id=reset_of_run_id,
        )
        session.add(run)
        session.flush()
        return run

    @staticmethod
    def list_runs(
        session: Session, limit: int = 30
    ) -> List[Tuple[RunModel, int]]:
        """Retrieve persisted runs with event counts ordered newest first.

        Uses a single query with LEFT OUTER JOIN and GROUP BY to eliminate N+1 queries.
        """
        stmt = (
            select(
                RunModel,
                func.count(RunEventModel.id).label("event_count"),
            )
            .outerjoin(RunEventModel, RunModel.id == RunEventModel.run_id)
            .group_by(RunModel.id)
            .order_by(RunModel.created_at.desc(), RunModel.id.desc())
            .limit(limit)
        )
        return list(session.execute(stmt).all())

    @staticmethod
    def get_run(session: Session, run_id: str) -> Optional[RunModel]:
        """Retrieve a run record by its ID, or None if not found."""
        return session.get(RunModel, run_id)

    @staticmethod
    def get_latest_verification(
        session: Session, run_id: str
    ) -> Optional[VerificationResultModel]:
        """Retrieve the most recent persisted verification result for a run."""
        stmt = (
            select(VerificationResultModel)
            .where(VerificationResultModel.run_id == run_id)
            .order_by(VerificationResultModel.evaluated_at.desc())
            .limit(1)
        )
        return session.scalars(stmt).first()

    @classmethod
    def get_run_or_raise(cls, session: Session, run_id: str) -> RunModel:
        """Retrieve a run record by ID or raise RunNotFoundError."""
        run = cls.get_run(session, run_id)
        if run is None:
            raise RunNotFoundError(run_id)
        return run

    @classmethod
    def update_status(
        cls, session: Session, run_id: str, new_status: RunStatus
    ) -> RunModel:
        """Validate state transition and update run status."""
        run = cls.get_run_or_raise(session, run_id)
        current_status = RunStatus(run.status)
        validate_transition(current_status, new_status)

        now_iso = datetime.now(timezone.utc).isoformat()
        stmt = (
            update(RunModel)
            .where(RunModel.id == run_id, RunModel.status == current_status.value)
            .values(
                status=new_status.value,
                updated_at=now_iso,
            )
        )
        res = session.execute(stmt)
        if res.rowcount == 0:
            raise InvalidStateTransitionError(
                f"Concurrent state transition detected: run '{run_id}' status has already changed."
            )
        session.flush()
        session.refresh(run)
        return run

    @classmethod
    def apply_mitigation(
        cls, session: Session, run_id: str, mitigation_id: str
    ) -> RunModel:
        """Attach an approved mitigation to the run and transition status."""
        run = cls.get_run_or_raise(session, run_id)
        current_status = RunStatus(run.status)
        validate_transition(current_status, RunStatus.MITIGATION_APPLIED)

        now_iso = datetime.now(timezone.utc).isoformat()
        stmt = (
            update(RunModel)
            .where(RunModel.id == run_id, RunModel.status == current_status.value)
            .values(
                applied_mitigation_id=mitigation_id,
                status=RunStatus.MITIGATION_APPLIED.value,
                updated_at=now_iso,
            )
        )
        res = session.execute(stmt)
        if res.rowcount == 0:
            raise InvalidStateTransitionError(
                f"Concurrent state transition detected: run '{run_id}' status has already changed."
            )
        session.flush()
        session.refresh(run)
        return run

    @classmethod
    def record_verification(
        cls,
        session: Session,
        run_id: str,
        verification: VerificationResult,
        new_status: RunStatus,
    ) -> Tuple[RunModel, VerificationResultModel]:
        """Record verification result and update run status in a single transaction."""
        run = cls.get_run_or_raise(session, run_id)
        current_status = RunStatus(run.status)
        validate_transition(current_status, new_status)

        now_iso = datetime.now(timezone.utc).isoformat()
        stmt = (
            update(RunModel)
            .where(RunModel.id == run_id, RunModel.status == current_status.value)
            .values(
                status=new_status.value,
                verification_passed=verification.passed,
                verification_summary=verification.summary,
                updated_at=now_iso,
            )
        )
        res = session.execute(stmt)
        if res.rowcount == 0:
            raise InvalidStateTransitionError(
                f"Concurrent state transition detected: run '{run_id}' status has already changed."
            )

        ver_model = VerificationResultModel(
            id=f"{run_id}_ver_{uuid.uuid4().hex[:8]}",
            run_id=run_id,
            assertion_id=verification.assertion_id,
            passed=verification.passed,
            summary=verification.summary,
            evaluated_at=verification.evaluated_at,
            limitations=verification.limitations,
            details_json=json.dumps(verification.details) if verification.details else None,
        )
        session.add(ver_model)
        session.flush()
        session.refresh(run)
        return run, ver_model

    @classmethod
    def reset_run(
        cls,
        session: Session,
        original_run_id: str,
        new_run_id: str,
        new_scenario_id: Optional[str] = None,
        new_scenario_version: Optional[str] = None,
    ) -> Tuple[RunModel, RunModel]:
        """Safely reset a run: mark original as reset and create linked new run."""
        original_run = cls.get_run_or_raise(session, original_run_id)
        now_iso = datetime.now(timezone.utc).isoformat()

        # Update original run to RESET status
        original_run.status = RunStatus.RESET.value
        original_run.updated_at = now_iso

        # Create linked new run
        scenario_id = new_scenario_id or original_run.scenario_id
        scenario_version = new_scenario_version or original_run.scenario_version
        new_run = RunModel(
            id=new_run_id,
            scenario_id=scenario_id,
            scenario_version=scenario_version,
            mode=original_run.mode,
            status=RunStatus.CREATED.value,
            created_at=now_iso,
            updated_at=now_iso,
            reset_of_run_id=original_run_id,
        )
        session.add(new_run)
        session.flush()
        return original_run, new_run

    @classmethod
    def clear_history(cls, session: Session) -> int:
        """Clear all persisted runs, events, and verification results safely.

        Follows strict transaction discipline:
        1. Nullifies self-referential foreign keys (`reset_of_run_id`) to prevent cycle constraint errors.
        2. Explicitly deletes child records (`RunEventModel`, `VerificationResultModel`).
        3. Deletes parent run records (`RunModel`).
        Returns the total number of deleted runs.
        """
        # 1. Break self-referential links to satisfy foreign key constraints
        session.execute(update(RunModel).values(reset_of_run_id=None))

        # 2. Delete child records
        session.execute(delete(RunEventModel))
        session.execute(delete(VerificationResultModel))

        # 3. Delete runs
        res = session.execute(delete(RunModel))
        session.flush()
        return res.rowcount if res.rowcount is not None and res.rowcount >= 0 else 0

