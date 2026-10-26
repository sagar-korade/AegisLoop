"""Repository for append-only run event log persistence."""
import json
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.db.schema import RunEventModel
from app.schemas.events import RunEvent


class EventRepository:
    """Manages ordered, append-only persistence of RunEvent entities."""

    @staticmethod
    def append_event(session: Session, event: RunEvent) -> RunEventModel:
        """Persist a single event into the append-only log."""
        evidence_str = (
            json.dumps(event.evidence_json) if event.evidence_json is not None else None
        )
        model = RunEventModel(
            id=event.id,
            run_id=event.run_id,
            sequence=event.sequence,
            event_type=event.event_type.value,
            stage=event.stage.value,
            occurred_at=event.occurred_at,
            title=event.title,
            message=event.message,
            evidence_json=evidence_str,
        )
        session.add(model)
        session.flush()
        return model

    @classmethod
    def append_events(
        cls, session: Session, events: List[RunEvent]
    ) -> List[RunEventModel]:
        """Append multiple events in sequence within the active transaction."""
        models: List[RunEventModel] = []
        for event in events:
            models.append(cls.append_event(session, event))
        return models

    @staticmethod
    def get_events_for_run(session: Session, run_id: str) -> List[RunEventModel]:
        """Retrieve all events for a run ordered strictly by monotonic sequence."""
        stmt = (
            select(RunEventModel)
            .where(RunEventModel.run_id == run_id)
            .order_by(RunEventModel.sequence.asc())
        )
        return list(session.scalars(stmt).all())

    @staticmethod
    def get_next_sequence(session: Session, run_id: str) -> int:
        """Compute the next monotonic sequence number for a run."""
        stmt = select(func.coalesce(func.max(RunEventModel.sequence), 0)).where(
            RunEventModel.run_id == run_id
        )
        current_max = session.scalar(stmt) or 0
        return current_max + 1
