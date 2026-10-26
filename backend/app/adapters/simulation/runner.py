"""Deterministic simulation runner generating structured event logs."""
from datetime import datetime, timezone
from typing import List
from app.adapters.simulation.fixtures.base import ScenarioFixture
from app.domain.enums import EventType, WorkflowStage
from app.schemas.events import RunEvent


class SimulationRunner:
    """Executes deterministic simulation fixtures, emitting ordered synthetic events."""

    @staticmethod
    def run_scenario(fixture: ScenarioFixture, run_id: str) -> List[RunEvent]:
        """Generate the ordered initial workflow events from the scenario fixture template."""
        now_iso = datetime.now(timezone.utc).isoformat()
        events: List[RunEvent] = []

        for index, template in enumerate(fixture.event_templates, start=1):
            events.append(
                RunEvent(
                    id=f"{run_id}_evt_{index:03d}",
                    run_id=run_id,
                    sequence=index,
                    event_type=template.event_type,
                    stage=template.stage,
                    occurred_at=now_iso,
                    title=template.title,
                    message=template.message,
                    evidence_json=template.evidence_json,
                )
            )

        return events

    @staticmethod
    def create_mitigation_event(
        run_id: str, sequence: int, mitigation_id: str, label: str
    ) -> RunEvent:
        """Create a structured event recording an applied mitigation."""
        now_iso = datetime.now(timezone.utc).isoformat()
        return RunEvent(
            id=f"{run_id}_evt_{sequence:03d}",
            run_id=run_id,
            sequence=sequence,
            event_type=EventType.MITIGATION_APPLIED,
            stage=WorkflowStage.BLUE_AGENT,
            occurred_at=now_iso,
            title="Mitigation Applied",
            message=f"Applied controlled mitigation: {label} ({mitigation_id}).",
            evidence_json={"mitigation_id": mitigation_id, "label": label},
        )

    @staticmethod
    def create_verification_event(
        run_id: str, sequence: int, assertion_id: str, passed: bool
    ) -> RunEvent:
        """Create a structured event recording a verification assertion outcome."""
        now_iso = datetime.now(timezone.utc).isoformat()
        status_text = "PASSED" if passed else "FAILED"
        return RunEvent(
            id=f"{run_id}_evt_{sequence:03d}",
            run_id=run_id,
            sequence=sequence,
            event_type=EventType.ASSERTION_EVALUATED,
            stage=WorkflowStage.VERIFICATION,
            occurred_at=now_iso,
            title=f"Assertion {status_text}",
            message=f"Retest assertion '{assertion_id}' evaluated: {status_text}.",
            evidence_json={"assertion_id": assertion_id, "passed": passed},
        )
