"""Scenario discovery and retrieval service."""
from typing import List
from app.adapters.simulation.fixtures.base import ScenarioFixture
from app.adapters.simulation.fixtures.registry import get_fixture, list_fixtures
from app.schemas.scenarios import ScenarioItem


class ScenarioService:
    """Provides access to allowlisted security scenarios."""

    @staticmethod
    def list_scenarios() -> List[ScenarioItem]:
        """Return all allowlisted scenarios in contract summary format."""
        fixtures = list_fixtures()
        return [
            ScenarioItem(
                id=fixture.id,
                name=fixture.name,
                category=fixture.category,
                severity=fixture.severity,
                summary=fixture.summary,
                mode_support=fixture.mode_support,
                expected_assertion_id=fixture.assertion.id,
            )
            for fixture in fixtures
        ]

    @staticmethod
    def get_scenario(scenario_id: str) -> ScenarioFixture:
        """Fetch the full fixture for a scenario ID or raise ScenarioNotFoundError."""
        return get_fixture(scenario_id)
