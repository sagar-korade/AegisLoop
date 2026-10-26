"""Pydantic schemas for mitigations."""
from pydantic import BaseModel, ConfigDict
from app.domain.enums import RunStatus


class MitigationItem(BaseModel):
    """Mitigation option available for an active finding."""

    id: str
    label: str
    description: str

    model_config = ConfigDict(extra="forbid")


class MitigationDetail(BaseModel):
    """Educational unified diff and explanation for an applied mitigation."""

    id: str
    label: str
    rule_summary: str
    unified_diff: str
    file_path: str

    model_config = ConfigDict(extra="forbid")


class ApplyMitigationRequest(BaseModel):
    """Request payload to apply an approved mitigation."""

    mitigation_id: str

    model_config = ConfigDict(extra="forbid")


class MitigationResponse(BaseModel):
    """Response returned upon successfully applying a mitigation."""

    run_id: str
    status: RunStatus
    mitigation: MitigationDetail

    model_config = ConfigDict(extra="forbid")
