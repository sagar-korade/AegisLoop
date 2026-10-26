"""Base dataclasses for deterministic scenario fixtures."""
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from app.domain.enums import EventType, ExecutionMode, Severity, WorkflowStage


@dataclass(frozen=True)
class MitigationData:
    """Allowlisted mitigation definition with unified diff and explanation."""

    id: str
    label: str
    description: str
    rule_summary: str
    unified_diff: str
    file_path: str


@dataclass(frozen=True)
class AssertionData:
    """Named verification assertion and educational limitations."""

    id: str
    description: str
    summary: str
    limitations: str


@dataclass(frozen=True)
class EvidenceItemData:
    """Synthetic evidence snippet or HTTP sample."""

    type: str
    label: str
    content: str
    details: Optional[Dict[str, Any]] = None


@dataclass(frozen=True)
class EventTemplateData:
    """Ordered event template for timeline playback."""

    stage: WorkflowStage
    event_type: EventType
    title: str
    message: str
    evidence_json: Optional[Dict[str, Any]] = None


@dataclass(frozen=True)
class ScenarioFixture:
    """Self-contained, deterministic scenario fixture."""

    id: str
    version: str
    name: str
    category: str
    severity: Severity
    summary: str
    teaching_objective: str
    mode_support: List[ExecutionMode]
    finding_title: str
    finding_summary: str
    evidence_items: List[EvidenceItemData]
    event_templates: List[EventTemplateData]
    allowed_mitigations: Dict[str, MitigationData]
    assertion: AssertionData
