"""Pydantic schemas for run events."""
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict
from app.domain.enums import EventType, WorkflowStage


class RunEvent(BaseModel):
    """An ordered, append-only security workflow event."""

    id: str
    run_id: str
    sequence: int
    event_type: EventType
    stage: WorkflowStage
    occurred_at: str
    title: str
    message: str
    evidence_json: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(extra="forbid")
