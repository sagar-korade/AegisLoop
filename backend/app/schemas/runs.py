"""Pydantic schemas for findings and run structures."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict
from app.domain.enums import ExecutionMode, RunStatus, Severity
from app.schemas.events import RunEvent
from app.schemas.mitigations import MitigationDetail, MitigationItem
from app.schemas.verification import VerificationResult


class FindingEvidenceItem(BaseModel):
    """An individual piece of synthetic evidence (e.g. snippet, request sample)."""

    type: str
    label: str
    content: str
    details: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(extra="forbid")


class Finding(BaseModel):
    """Synthetic security finding generated for a scenario."""

    id: str
    title: str
    severity: Severity
    summary: str
    evidence: List[FindingEvidenceItem]

    model_config = ConfigDict(extra="forbid")


class CreateRunRequest(BaseModel):
    """Request payload to initiate a workflow run."""

    scenario_id: str
    mode: ExecutionMode = ExecutionMode.SIMULATION

    model_config = ConfigDict(extra="forbid")


class RunResponse(BaseModel):
    """Complete run response model matching docs/API_CONTRACT.md."""

    id: str
    scenario_id: str
    mode: ExecutionMode
    status: RunStatus
    events: List[RunEvent]
    finding: Finding
    available_mitigations: List[MitigationItem]
    applied_mitigation: Optional[MitigationDetail] = None
    verification: Optional[VerificationResult] = None
    expected_assertion_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    reset_of_run_id: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class RunSummaryItem(BaseModel):
    """Summary representation of a persisted workflow run for list responses."""

    id: str
    scenario_id: str
    mode: ExecutionMode
    status: RunStatus
    created_at: str
    updated_at: str
    applied_mitigation_id: Optional[str] = None
    verification_passed: Optional[bool] = None
    reset_of_run_id: Optional[str] = None
    event_count: int = 0

    model_config = ConfigDict(extra="forbid")


class RunListResponse(BaseModel):
    """List response model for persisted workflow runs."""

    items: List[RunSummaryItem]

    model_config = ConfigDict(extra="forbid")


class ClearHistoryResponse(BaseModel):
    """Response payload returned when persisted run history is cleared."""

    cleared_count: int
    message: str

    model_config = ConfigDict(extra="forbid")


