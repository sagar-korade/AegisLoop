"""Unit tests for scenario fixtures and registry behavior."""
import pytest
from app.domain.enums import ExecutionMode, Severity
from app.domain.errors import ScenarioNotFoundError
from app.services.scenario_service import ScenarioService


def test_registry_contains_both_scenarios() -> None:
    """Registry must expose both sqli_demo_v1 and bola_demo_v1."""
    scenarios = ScenarioService.list_scenarios()
    ids = [s.id for s in scenarios]
    assert "sqli_demo_v1" in ids
    assert "bola_demo_v1" in ids
    assert len(scenarios) == 2


@pytest.mark.parametrize("scenario_id", ["sqli_demo_v1", "bola_demo_v1"])
def test_scenario_fixture_structure(scenario_id: str) -> None:
    """Each fixture must satisfy all required architectural fields."""
    fixture = ScenarioService.get_scenario(scenario_id)

    assert fixture.id == scenario_id
    assert fixture.version == "1.0.0"
    assert len(fixture.name) > 0
    assert len(fixture.category) > 0
    assert fixture.severity == Severity.HIGH
    assert len(fixture.summary) > 0
    assert ExecutionMode.SIMULATION in fixture.mode_support

    # Finding and evidence
    assert len(fixture.finding_title) > 0
    assert len(fixture.finding_summary) > 0
    assert len(fixture.evidence_items) >= 2
    for item in fixture.evidence_items:
        assert item.type in {"code_snippet", "http_request", "response_sample"}
        assert len(item.label) > 0
        assert len(item.content) > 0

    # Events template
    assert len(fixture.event_templates) >= 3
    for tmpl in fixture.event_templates:
        assert tmpl.stage is not None
        assert tmpl.event_type is not None
        assert len(tmpl.title) > 0
        assert len(tmpl.message) > 0

    # Allowed mitigations
    assert len(fixture.allowed_mitigations) >= 1
    for mit_id, mit in fixture.allowed_mitigations.items():
        assert mit.id == mit_id
        assert len(mit.label) > 0
        assert len(mit.description) > 0
        assert len(mit.rule_summary) > 0
        assert "--- " in mit.unified_diff and "+++ " in mit.unified_diff
        assert len(mit.file_path) > 0

    # Assertion
    assert len(fixture.assertion.id) > 0
    assert len(fixture.assertion.description) > 0
    assert len(fixture.assertion.summary) > 0
    assert len(fixture.assertion.limitations) > 0


def test_unknown_scenario_raises_404() -> None:
    """Requesting an unknown scenario ID must raise ScenarioNotFoundError."""
    with pytest.raises(ScenarioNotFoundError) as exc_info:
        ScenarioService.get_scenario("non_existent_scenario_xyz")

    err = exc_info.value
    assert err.status_code == 404
    assert err.code == "SCENARIO_NOT_FOUND"
    assert "non_existent_scenario_xyz" in err.message


def test_fixtures_are_deterministic() -> None:
    """Multiple fetches of the same fixture must yield identical, immutable data."""
    f1 = ScenarioService.get_scenario("sqli_demo_v1")
    f2 = ScenarioService.get_scenario("sqli_demo_v1")

    assert f1.id == f2.id
    assert f1.finding_title == f2.finding_title
    assert f1.assertion.id == f2.assertion.id
    assert f1.allowed_mitigations == f2.allowed_mitigations
    assert f1.evidence_items == f2.evidence_items
