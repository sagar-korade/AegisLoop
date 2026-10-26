"""Integration tests for SQLite persistence, transactions, and constraints.

Conforms to Phase 3 acceptance criteria.
"""
from pathlib import Path
import pytest
from sqlalchemy.exc import IntegrityError
from app.adapters.simulation.runner import SimulationRunner
from app.db.repositories.event_repo import EventRepository
from app.db.repositories.run_repo import RunRepository
from app.db.schema import RunEventModel, RunModel, VerificationResultModel
from app.db.session import DatabaseManager
from app.domain.enums import EventType, ExecutionMode, RunStatus, WorkflowStage
from app.schemas.events import RunEvent
from app.schemas.verification import VerificationResult
from app.services.scenario_service import ScenarioService


@pytest.fixture
def temp_db(tmp_path: Path):
    """Provide an isolated, file-based temporary SQLite database for each test."""
    db_file = tmp_path / "aegisloop_test.db"
    db_url = f"sqlite:///{db_file.as_posix()}"
    manager = DatabaseManager(db_url)
    manager.init_db()
    try:
        yield manager
    finally:
        manager.close()


def test_run_creation_and_retrieval(temp_db: DatabaseManager) -> None:
    """Run records must persist and be retrievable by ID with exact attributes."""
    run_id = "run_persist_001"
    with temp_db.session() as session:
        created = RunRepository.create_run(
            session=session,
            run_id=run_id,
            scenario_id="sqli_demo_v1",
            scenario_version="1.0.0",
            mode=ExecutionMode.SIMULATION,
            status=RunStatus.CREATED,
        )
        assert created.id == run_id

    # Retrieve in a new session
    with temp_db.session() as session:
        retrieved = RunRepository.get_run_or_raise(session, run_id)
        assert retrieved.id == run_id
        assert retrieved.scenario_id == "sqli_demo_v1"
        assert retrieved.scenario_version == "1.0.0"
        assert retrieved.mode == "simulation"
        assert retrieved.status == "created"
        assert retrieved.applied_mitigation_id is None
        assert retrieved.verification_passed is None


def test_state_and_mitigation_updates(temp_db: DatabaseManager) -> None:
    """State transitions and mitigation attachments must update timestamps and fields."""
    run_id = "run_persist_002"
    with temp_db.session() as session:
        RunRepository.create_run(
            session=session,
            run_id=run_id,
            scenario_id="sqli_demo_v1",
            scenario_version="1.0.0",
        )

    # 1. Transition CREATED -> TESTING -> EVIDENCE_READY
    with temp_db.session() as session:
        RunRepository.update_status(session, run_id, RunStatus.TESTING)
        RunRepository.update_status(session, run_id, RunStatus.EVIDENCE_READY)

    # 2. Apply mitigation
    with temp_db.session() as session:
        updated = RunRepository.apply_mitigation(session, run_id, "parameterized_query")
        assert updated.status == "mitigation_applied"
        assert updated.applied_mitigation_id == "parameterized_query"

    # 3. Transition to RETESTING and record verification
    ver_result = VerificationResult(
        assertion_id="sqli_input_is_parameterized",
        passed=True,
        summary="Input binding verified.",
        evaluated_at="2026-10-25T09:00:00Z",
        limitations="Simulation only.",
    )
    with temp_db.session() as session:
        RunRepository.update_status(session, run_id, RunStatus.RETESTING)
        run, ver_model = RunRepository.record_verification(
            session=session,
            run_id=run_id,
            verification=ver_result,
            new_status=RunStatus.VERIFIED,
        )
        assert run.status == "verified"
        assert run.verification_passed is True
        assert ver_model.assertion_id == "sqli_input_is_parameterized"


def test_event_persistence_and_ordering(temp_db: DatabaseManager) -> None:
    """Events must persist and be returned strictly in monotonic sequence order."""
    run_id = "run_persist_003"
    with temp_db.session() as session:
        RunRepository.create_run(
            session=session,
            run_id=run_id,
            scenario_id="bola_demo_v1",
            scenario_version="1.0.0",
        )

    fixture = ScenarioService.get_scenario("bola_demo_v1")
    generated_events = SimulationRunner.run_scenario(fixture, run_id=run_id)

    # Persist batch events
    with temp_db.session() as session:
        EventRepository.append_events(session, generated_events)

    # Retrieve and check strict sequence ordering
    with temp_db.session() as session:
        events = EventRepository.get_events_for_run(session, run_id)
        assert len(events) == len(generated_events)
        for i, evt in enumerate(events, start=1):
            assert evt.sequence == i
            assert evt.run_id == run_id

        # Compute next sequence
        next_seq = EventRepository.get_next_sequence(session, run_id)
        assert next_seq == len(generated_events) + 1


def test_persistence_across_separate_connections(tmp_path: Path) -> None:
    """Committed data must survive independent database connections and instances."""
    db_file = tmp_path / "cross_connection_test.db"
    db_url = f"sqlite:///{db_file.as_posix()}"

    run_id = "run_cross_conn"

    # Instance 1: Create and commit
    m1 = DatabaseManager(db_url)
    m1.init_db()
    with m1.session() as session:
        RunRepository.create_run(
            session=session,
            run_id=run_id,
            scenario_id="sqli_demo_v1",
            scenario_version="1.0.0",
        )
    m1.close()

    # Instance 2: Connect independently and verify data exists
    m2 = DatabaseManager(db_url)
    with m2.session() as session:
        run = RunRepository.get_run_or_raise(session, run_id)
        assert run.id == run_id
        assert run.scenario_id == "sqli_demo_v1"
    m2.close()


def test_foreign_key_enforcement(temp_db: DatabaseManager) -> None:
    """SQLite must reject child records referencing non-existent runs."""
    fake_run_id = "non_existent_run_999"

    # 1. Event referencing non-existent run must fail FK check
    orphan_event = RunEvent(
        id="orphan_evt_01",
        run_id=fake_run_id,
        sequence=1,
        event_type=EventType.SCENARIO_STARTED,
        stage=WorkflowStage.RED_AGENT,
        occurred_at="2026-10-25T09:00:00Z",
        title="Orphan Event",
        message="Should fail due to foreign key enforcement.",
    )

    with pytest.raises(IntegrityError):
        with temp_db.session() as session:
            EventRepository.append_event(session, orphan_event)

    # 2. Verification result referencing non-existent run must fail FK check
    orphan_ver = VerificationResultModel(
        id="orphan_ver_01",
        run_id=fake_run_id,
        assertion_id="sqli_input_is_parameterized",
        passed=True,
        summary="Orphan verification.",
        evaluated_at="2026-10-25T09:00:00Z",
        limitations="None",
    )

    with pytest.raises(IntegrityError):
        with temp_db.session() as session:
            session.add(orphan_ver)
            session.flush()


def test_duplicate_run_sequence_rejected(temp_db: DatabaseManager) -> None:
    """The unique constraint on (run_id, sequence) must reject duplicate sequence numbers."""
    run_id = "run_persist_004"
    with temp_db.session() as session:
        RunRepository.create_run(
            session=session,
            run_id=run_id,
            scenario_id="sqli_demo_v1",
            scenario_version="1.0.0",
        )

    evt1 = RunEvent(
        id="evt_01",
        run_id=run_id,
        sequence=1,
        event_type=EventType.SCENARIO_STARTED,
        stage=WorkflowStage.RED_AGENT,
        occurred_at="2026-10-25T09:00:00Z",
        title="Event 1",
        message="First event",
    )
    evt2 = RunEvent(
        id="evt_02",
        run_id=run_id,
        sequence=1,  # Duplicate sequence number for same run_id!
        event_type=EventType.PAYLOAD_SENT,
        stage=WorkflowStage.RED_AGENT,
        occurred_at="2026-10-25T09:00:01Z",
        title="Event 2",
        message="Duplicate sequence",
    )

    with temp_db.session() as session:
        EventRepository.append_event(session, evt1)

    with pytest.raises(IntegrityError):
        with temp_db.session() as session:
            EventRepository.append_event(session, evt2)


def test_transaction_rollback_on_failure(temp_db: DatabaseManager) -> None:
    """An error inside a session must roll back all uncommitted mutations in that block."""
    run_id = "run_rollback_test"

    try:
        with temp_db.session() as session:
            RunRepository.create_run(
                session=session,
                run_id=run_id,
                scenario_id="sqli_demo_v1",
                scenario_version="1.0.0",
            )
            # Intentionally raise an unhandled exception before exiting context
            raise RuntimeError("Simulated mid-transaction failure")
    except RuntimeError:
        pass

    # Verify run was NOT committed
    with temp_db.session() as session:
        run = RunRepository.get_run(session, run_id)
        assert run is None, "Failed transaction must not leave persistent artifacts"


def test_database_initialization_idempotency(temp_db: DatabaseManager) -> None:
    """Repeated calls to init_db() must succeed without error or dropping data."""
    run_id = "run_idempotency_test"
    with temp_db.session() as session:
        RunRepository.create_run(
            session=session,
            run_id=run_id,
            scenario_id="sqli_demo_v1",
            scenario_version="1.0.0",
        )

    # Call init_db multiple times on existing database
    temp_db.init_db()
    temp_db.init_db()

    # Confirm original record is preserved
    with temp_db.session() as session:
        run = RunRepository.get_run_or_raise(session, run_id)
        assert run.id == run_id


def test_reset_run_creates_linked_child(temp_db: DatabaseManager) -> None:
    """Resetting a run must set original status to 'reset' and create linked new run."""
    orig_id = "run_orig_01"
    new_id = "run_reset_01"

    with temp_db.session() as session:
        RunRepository.create_run(
            session=session,
            run_id=orig_id,
            scenario_id="sqli_demo_v1",
            scenario_version="1.0.0",
            status=RunStatus.EVIDENCE_READY,
        )

    with temp_db.session() as session:
        orig_run, new_run = RunRepository.reset_run(
            session=session, original_run_id=orig_id, new_run_id=new_id
        )
        assert orig_run.status == "reset"
        assert new_run.id == new_id
        assert new_run.status == "created"
        assert new_run.reset_of_run_id == orig_id


def test_malformed_persisted_evidence_handled_gracefully(temp_db: DatabaseManager) -> None:
    """Malformed persisted evidence_json or details_json must not crash the API or service."""
    from app.services.run_service import RunService

    run_id = "run_malformed_evidence_01"

    with temp_db.session() as session:
        # Create run in verified status
        RunRepository.create_run(
            session=session,
            run_id=run_id,
            scenario_id="sqli_demo_v1",
            scenario_version="1.0.0",
            status=RunStatus.VERIFIED,
        )

        # Insert event with corrupted non-JSON evidence_json
        bad_event = RunEventModel(
            id=f"{run_id}_evt_001",
            run_id=run_id,
            sequence=1,
            event_type=EventType.FINDING_DETECTED.value,
            stage=WorkflowStage.RED_AGENT.value,
            occurred_at="2026-10-25T10:00:00Z",
            title="Corrupted Evidence Event",
            message="Event with invalid JSON payload",
            evidence_json="INVALID_RAW_NON_JSON_{{bad_syntax",
        )
        # Insert event with non-dictionary JSON evidence_json (e.g. array)
        array_event = RunEventModel(
            id=f"{run_id}_evt_002",
            run_id=run_id,
            sequence=2,
            event_type=EventType.MITIGATION_APPLIED.value,
            stage=WorkflowStage.BLUE_AGENT.value,
            occurred_at="2026-10-25T10:00:01Z",
            title="Array Evidence Event",
            message="Event with array instead of dict",
            evidence_json="[1, 2, 3]",
        )
        session.add(bad_event)
        session.add(array_event)

        # Insert verification result with corrupted details_json
        bad_ver = VerificationResultModel(
            id=f"{run_id}_ver_001",
            run_id=run_id,
            assertion_id="sqli_input_is_parameterized",
            passed=True,
            summary="Verification with corrupted details",
            evaluated_at="2026-10-25T10:00:02Z",
            limitations="None",
            details_json="CORRUPT_DETAILS_NON_JSON_<<>>",
        )
        session.add(bad_ver)

    # Reopen in new session and fetch run response
    with temp_db.session() as session:
        run_response = RunService.get_run(session, run_id)
        assert run_response.id == run_id
        assert run_response.status == RunStatus.VERIFIED
        assert len(run_response.events) == 2

        # Both events must deserialize safely without unhandled exceptions
        assert run_response.events[0].evidence_json is None
        assert run_response.events[1].evidence_json is None

        # Verification must deserialize safely with details as None
        assert run_response.verification is not None
        assert run_response.verification.passed is True
        assert run_response.verification.details is None


def test_repeated_reset_requests_lifecycle_semantics(temp_db: DatabaseManager) -> None:
    """Repeated reset requests must preserve audit trail and produce consistent linked runs."""
    from app.services.run_service import RunService

    orig_id = "run_orig_repeat_reset"

    with temp_db.session() as session:
        created = RunService.create_run(session, "sqli_demo_v1")
        assert created.status == RunStatus.EVIDENCE_READY
        orig_id = created.id

    # First reset
    with temp_db.session() as session:
        child_1 = RunService.reset_run(session, orig_id)
        assert child_1.status == RunStatus.EVIDENCE_READY
        assert child_1.reset_of_run_id == orig_id

    # Verify original run is in RESET status
    with temp_db.session() as session:
        orig_run = RunRepository.get_run_or_raise(session, orig_id)
        assert orig_run.status == "reset"

    # Second reset on the ALREADY-RESET original run
    with temp_db.session() as session:
        child_2 = RunService.reset_run(session, orig_id)
        assert child_2.status == RunStatus.EVIDENCE_READY
        assert child_2.reset_of_run_id == orig_id
        assert child_2.id != child_1.id

    # Third reset on child_1
    with temp_db.session() as session:
        grandchild = RunService.reset_run(session, child_1.id)
        assert grandchild.status == RunStatus.EVIDENCE_READY
        assert grandchild.reset_of_run_id == child_1.id

    # Verify event sequences remain strictly monotonic across all runs
    with temp_db.session() as session:
        for rid in [orig_id, child_1.id, child_2.id, grandchild.id]:
            events = EventRepository.get_events_for_run(session, rid)
            assert len(events) >= 1
            for idx, evt in enumerate(events, start=1):
                assert evt.sequence == idx


def test_concurrent_mutations_preserve_consistency(temp_db: DatabaseManager) -> None:
    """Concurrent mutations must not corrupt event sequences or produce unhandled errors."""
    import concurrent.futures
    from app.services.run_service import RunService

    # 1. Create a run to mutate
    with temp_db.session() as session:
        run = RunService.create_run(session, "sqli_demo_v1")
        run_id = run.id

    # 2. Concurrently attempt to apply mitigations on the same run
    def try_apply_mitigation(mit_id: str) -> dict:
        try:
            with temp_db.session() as session:
                resp = RunService.apply_mitigation(session, run_id, mit_id)
                return {"success": True, "status": resp.status.value}
        except Exception as exc:
            return {"success": False, "error_type": type(exc).__name__, "msg": str(exc)}

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = [
            executor.submit(try_apply_mitigation, "parameterized_query")
            for _ in range(4)
        ]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    # Exactly one mutation must succeed; others must fail with expected InvalidStateTransitionError
    successes = [r for r in results if r["success"]]
    failures = [r for r in results if not r["success"]]

    assert len(successes) == 1
    assert len(failures) == 3
    for fail in failures:
        assert fail["error_type"] == "InvalidStateTransitionError"

    # Verify final event sequence integrity
    with temp_db.session() as session:
        events = EventRepository.get_events_for_run(session, run_id)
        assert len(events) >= 4
        for idx, evt in enumerate(events, start=1):
            assert evt.sequence == idx


def test_clear_history_clears_all_records_safely(temp_db: DatabaseManager) -> None:
    """Clearing history safely removes runs, events, and verification results across FK links."""
    # 1. Create original run with events and verification
    with temp_db.session() as session:
        run1 = RunRepository.create_run(
            session=session,
            run_id="run_clear_001",
            scenario_id="sqli_demo_v1",
            scenario_version="1.0.0",
        )
        evt1 = RunEvent(
            id="evt_c1",
            run_id="run_clear_001",
            sequence=1,
            event_type=EventType.SCENARIO_STARTED,
            stage=WorkflowStage.RED_AGENT,
            occurred_at="2026-10-26T10:00:00Z",
            title="Probe Sent",
            message="Initial probe dispatched.",
        )
        EventRepository.append_event(session, evt1)

        # Create child reset run with self-referential foreign key
        run2 = RunRepository.create_run(
            session=session,
            run_id="run_clear_002",
            scenario_id="sqli_demo_v1",
            scenario_version="1.0.0",
            status=RunStatus.RETESTING,
            reset_of_run_id="run_clear_001",
        )
        ver = VerificationResult(
            assertion_id="sqli_input_is_parameterized",
            passed=True,
            summary="Verified safely.",
            evaluated_at="2026-10-26T10:00:05Z",
            limitations="Local simulation only.",
        )
        RunRepository.record_verification(session, "run_clear_002", ver, RunStatus.VERIFIED)

    # Verify counts before clear
    with temp_db.session() as session:
        from sqlalchemy import func, select
        run_count = session.scalar(select(func.count(RunModel.id)))
        event_count = session.scalar(select(func.count(RunEventModel.id)))
        ver_count = session.scalar(select(func.count(VerificationResultModel.id)))
        assert run_count == 2
        assert event_count >= 1
        assert ver_count >= 1

    # 2. Execute clear_history
    with temp_db.session() as session:
        deleted = RunRepository.clear_history(session)
        assert deleted == 2

    # 3. Verify all tables are completely empty
    with temp_db.session() as session:
        from sqlalchemy import func, select
        assert session.scalar(select(func.count(RunModel.id))) == 0
        assert session.scalar(select(func.count(RunEventModel.id))) == 0
        assert session.scalar(select(func.count(VerificationResultModel.id))) == 0

    # 4. Verify database schema remains intact by inserting a new run afterwards
    with temp_db.session() as session:
        new_run = RunRepository.create_run(
            session=session,
            run_id="run_after_clear",
            scenario_id="sqli_demo_v1",
            scenario_version="1.0.0",
        )
        assert new_run.id == "run_after_clear"


def test_clear_history_empty_db_returns_zero(temp_db: DatabaseManager) -> None:
    """Calling clear_history on an empty database returns 0 without errors."""
    with temp_db.session() as session:
        deleted = RunRepository.clear_history(session)
        assert deleted == 0


