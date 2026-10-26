"""Unit tests for the simulation runner and evidence service."""
from app.adapters.simulation.runner import SimulationRunner
from app.domain.enums import EventType, Severity, WorkflowStage
from app.services.evidence_service import EvidenceService
from app.services.scenario_service import ScenarioService


def test_simulation_runner_emits_ordered_events() -> None:
    """Simulation runner must produce strictly ordered events with monotonic sequence numbers."""
    fixture = ScenarioService.get_scenario("sqli_demo_v1")
    run_id = "run_test_001"

    events = SimulationRunner.run_scenario(fixture, run_id=run_id)

    assert len(events) == len(fixture.event_templates)
    for index, event in enumerate(events, start=1):
        assert event.sequence == index
        assert event.run_id == run_id
        assert event.id == f"{run_id}_evt_{index:03d}"
        assert event.occurred_at is not None
        assert len(event.title) > 0
        assert len(event.message) > 0

    # First event is scenario started; subsequent events include finding detected
    assert events[0].event_type == EventType.SCENARIO_STARTED
    assert events[0].stage == WorkflowStage.RED_AGENT
    assert events[-1].event_type == EventType.FINDING_DETECTED
    assert events[-1].stage == WorkflowStage.BLUE_AGENT


def test_simulation_runner_lifecycle_events() -> None:
    """Simulation runner helper methods create structured mitigation and verification events."""
    run_id = "run_test_002"

    # Mitigation event
    mit_evt = SimulationRunner.create_mitigation_event(
        run_id=run_id,
        sequence=5,
        mitigation_id="parameterized_query",
        label="Use parameterized queries",
    )
    assert mit_evt.sequence == 5
    assert mit_evt.event_type == EventType.MITIGATION_APPLIED
    assert mit_evt.stage == WorkflowStage.BLUE_AGENT
    assert "parameterized_query" in mit_evt.message

    # Verification passed event
    ver_pass = SimulationRunner.create_verification_event(
        run_id=run_id,
        sequence=6,
        assertion_id="sqli_input_is_parameterized",
        passed=True,
    )
    assert ver_pass.sequence == 6
    assert ver_pass.event_type == EventType.ASSERTION_EVALUATED
    assert ver_pass.stage == WorkflowStage.VERIFICATION
    assert "PASSED" in ver_pass.title

    # Verification failed event
    ver_fail = SimulationRunner.create_verification_event(
        run_id=run_id,
        sequence=7,
        assertion_id="sqli_input_is_parameterized",
        passed=False,
    )
    assert "FAILED" in ver_fail.title


def test_evidence_service_builds_finding() -> None:
    """Evidence service must assemble a structured Finding matching the fixture."""
    fixture = ScenarioService.get_scenario("sqli_demo_v1")
    run_id = "run_test_003"

    finding = EvidenceService.build_finding(fixture, run_id=run_id)

    assert finding.id == f"{run_id}_finding"
    assert finding.title == fixture.finding_title
    assert finding.severity == Severity.HIGH
    assert len(finding.evidence) == len(fixture.evidence_items)
    assert finding.evidence[0].type == "code_snippet"
    assert "find_account_by_username" in finding.evidence[0].content
