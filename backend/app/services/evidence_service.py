"""Service for building structured findings and evidence from fixtures."""
from typing import List
from app.adapters.simulation.fixtures.base import ScenarioFixture
from app.schemas.mitigations import MitigationItem
from app.schemas.runs import Finding, FindingEvidenceItem


class EvidenceService:
    """Extracts typed findings, evidence, and allowable mitigations from fixtures."""

    @staticmethod
    def build_finding(fixture: ScenarioFixture, run_id: str) -> Finding:
        """Construct the Finding object for a scenario run."""
        evidence_items = [
            FindingEvidenceItem(
                type=item.type,
                label=item.label,
                content=item.content,
                details=item.details,
            )
            for item in fixture.evidence_items
        ]

        return Finding(
            id=f"{run_id}_finding",
            title=fixture.finding_title,
            severity=fixture.severity,
            summary=fixture.finding_summary,
            evidence=evidence_items,
        )

    @staticmethod
    def build_available_mitigations(fixture: ScenarioFixture) -> List[MitigationItem]:
        """Return the allowable mitigations for the active scenario finding."""
        return [
            MitigationItem(
                id=mit.id,
                label=mit.label,
                description=mit.description,
            )
            for mit in fixture.allowed_mitigations.values()
        ]
