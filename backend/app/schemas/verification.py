"""Pydantic schemas for verification retesting."""
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict
from app.domain.enums import RunStatus


class RetestRequest(BaseModel):
    """Request payload to retest a run against a named assertion."""

    assertion_id: str

    model_config = ConfigDict(extra="forbid")


class VerificationResult(BaseModel):
    """Named assertion verification outcome with scope limitations."""

    assertion_id: str
    passed: bool
    summary: str
    evaluated_at: str
    limitations: str
    details: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(extra="forbid")


class VerificationSummary(BaseModel):
    """Concise assertion outcome matching the API contract response."""

    assertion_id: str
    passed: bool
    summary: str
    limitations: str

    model_config = ConfigDict(extra="forbid")


class RetestResponse(BaseModel):
    """Contract response for POST /runs/{id}/retest."""

    status: RunStatus
    verification: VerificationSummary

    model_config = ConfigDict(extra="forbid")
