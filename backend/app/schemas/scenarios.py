"""Pydantic schemas for scenarios."""
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.domain.enums import ExecutionMode, Severity


class ScenarioItem(BaseModel):
    """Scenario summary returned in list operations."""

    id: str
    name: str
    category: str
    severity: Severity
    summary: str
    mode_support: List[ExecutionMode]
    expected_assertion_id: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class ScenarioListResponse(BaseModel):
    """List of server-supported scenarios."""

    items: List[ScenarioItem]

    model_config = ConfigDict(extra="forbid")
