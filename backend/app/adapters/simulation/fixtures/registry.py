"""Allowlist registry for deterministic scenario fixtures."""
from typing import Dict, List
from app.adapters.simulation.fixtures.base import ScenarioFixture
from app.adapters.simulation.fixtures.bola_demo_v1 import BOLA_FIXTURE
from app.adapters.simulation.fixtures.sqli_demo_v1 import SQLI_FIXTURE
from app.domain.errors import ScenarioNotFoundError

_FIXTURE_REGISTRY: Dict[str, ScenarioFixture] = {
    SQLI_FIXTURE.id: SQLI_FIXTURE,
    BOLA_FIXTURE.id: BOLA_FIXTURE,
}


def get_fixture(scenario_id: str) -> ScenarioFixture:
    """Retrieve an allowlisted scenario fixture or raise ScenarioNotFoundError."""
    if scenario_id not in _FIXTURE_REGISTRY:
        raise ScenarioNotFoundError(scenario_id)
    return _FIXTURE_REGISTRY[scenario_id]


def list_fixtures() -> List[ScenarioFixture]:
    """Return all allowlisted scenario fixtures."""
    return list(_FIXTURE_REGISTRY.values())
