"""Service for validating and applying allowlisted mitigations."""
from app.adapters.simulation.fixtures.base import MitigationData, ScenarioFixture
from app.domain.errors import MitigationNotAllowedError
from app.schemas.mitigations import MitigationDetail


class MitigationService:
    """Validates and applies allowlisted mitigations for active findings."""

    @staticmethod
    def validate_and_get(fixture: ScenarioFixture, mitigation_id: str) -> MitigationData:
        """Verify that mitigation_id is allowlisted for the scenario, returning its metadata."""
        if mitigation_id not in fixture.allowed_mitigations:
            raise MitigationNotAllowedError(
                f"Mitigation '{mitigation_id}' is not permitted for scenario '{fixture.id}'."
            )
        return fixture.allowed_mitigations[mitigation_id]

    @classmethod
    def apply_mitigation(
        cls, fixture: ScenarioFixture, mitigation_id: str
    ) -> MitigationDetail:
        """Validate and construct the detailed educational mitigation diff and explanation."""
        data = cls.validate_and_get(fixture, mitigation_id)
        return MitigationDetail(
            id=data.id,
            label=data.label,
            rule_summary=data.rule_summary,
            unified_diff=data.unified_diff,
            file_path=data.file_path,
        )
