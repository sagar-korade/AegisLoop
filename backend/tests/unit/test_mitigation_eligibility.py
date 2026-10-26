"""Unit tests for mitigation eligibility and application."""
import pytest
from app.domain.errors import MitigationNotAllowedError
from app.services.evidence_service import EvidenceService
from app.services.mitigation_service import MitigationService
from app.services.scenario_service import ScenarioService


def test_scenario_a_mitigation_eligibility() -> None:
    """Scenario A accepts parameterized_query and rejects cross-mitigations."""
    fixture = ScenarioService.get_scenario("sqli_demo_v1")

    # 1. Allowed mitigation builds correctly
    available = EvidenceService.build_available_mitigations(fixture)
    assert len(available) == 1
    assert available[0].id == "parameterized_query"
    assert "parameterized" in available[0].label.lower()

    # 2. Applying approved mitigation succeeds and produces diff
    detail = MitigationService.apply_mitigation(fixture, "parameterized_query")
    assert detail.id == "parameterized_query"
    assert "services/account_service.py" in detail.file_path
    assert "SELECT" in detail.unified_diff
    assert ":username" in detail.unified_diff
    assert len(detail.rule_summary) > 0

    # 3. Cross-mitigation from Scenario B is rejected with 400
    with pytest.raises(MitigationNotAllowedError) as exc_info:
        MitigationService.apply_mitigation(fixture, "enforce_record_ownership")
    assert exc_info.value.status_code == 400
    assert exc_info.value.code == "MITIGATION_NOT_ALLOWED"


def test_scenario_b_mitigation_eligibility() -> None:
    """Scenario B accepts enforce_record_ownership and rejects cross-mitigations."""
    fixture = ScenarioService.get_scenario("bola_demo_v1")

    # 1. Allowed mitigation builds correctly
    available = EvidenceService.build_available_mitigations(fixture)
    assert len(available) == 1
    assert available[0].id == "enforce_record_ownership"
    assert "ownership" in available[0].label.lower()

    # 2. Applying approved mitigation succeeds
    detail = MitigationService.apply_mitigation(fixture, "enforce_record_ownership")
    assert detail.id == "enforce_record_ownership"
    assert "record_controller.py" in detail.file_path
    assert "owner_id" in detail.unified_diff
    assert "403" in detail.unified_diff

    # 3. Cross-mitigation from Scenario A is rejected
    with pytest.raises(MitigationNotAllowedError) as exc_info:
        MitigationService.apply_mitigation(fixture, "parameterized_query")
    assert exc_info.value.status_code == 400
    assert exc_info.value.code == "MITIGATION_NOT_ALLOWED"


def test_unknown_mitigation_rejected_on_both_scenarios() -> None:
    """Non-allowlisted mitigation IDs must be rejected on every scenario."""
    for scenario_id in ["sqli_demo_v1", "bola_demo_v1"]:
        fixture = ScenarioService.get_scenario(scenario_id)
        with pytest.raises(MitigationNotAllowedError) as exc_info:
            MitigationService.apply_mitigation(fixture, "unknown_custom_patch_99")
        assert exc_info.value.status_code == 400
        assert exc_info.value.code == "MITIGATION_NOT_ALLOWED"
