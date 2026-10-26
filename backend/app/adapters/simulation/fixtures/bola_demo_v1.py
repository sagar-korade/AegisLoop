"""Scenario B: Broken Object-Level Authorization (bola_demo_v1)."""
from app.adapters.simulation.fixtures.base import (
    AssertionData,
    EventTemplateData,
    EvidenceItemData,
    MitigationData,
    ScenarioFixture,
)
from app.domain.enums import EventType, ExecutionMode, Severity, WorkflowStage

BOLA_FIXTURE = ScenarioFixture(
    id="bola_demo_v1",
    version="1.0.0",
    name="Broken Object-Level Authorization",
    category="access_control",
    severity=Severity.HIGH,
    summary="A synthetic fixture demonstrates access to another user's record due to missing server-side ownership checks.",
    teaching_objective="Demonstrate server-side object ownership checks to prevent unauthorized cross-tenant data access.",
    mode_support=[ExecutionMode.SIMULATION],
    finding_title="Missing Server-Side Object Ownership Validation (BOLA)",
    finding_summary="The endpoint queries records by ID directly from the URL without verifying that the authenticated user owns or has access to the target resource.",
    evidence_items=[
        EvidenceItemData(
            type="code_snippet",
            label="Vulnerable Endpoint Handler",
            content=(
                "@app.get(\"/api/v1/records/{record_id}\")\n"
                "def get_record(record_id: int):\n"
                "    return db.query(\"SELECT * FROM medical_records WHERE id = :id\", {\"id\": record_id})"
            ),
            details={"file": "controllers/record_controller.py", "line": 8},
        ),
        EvidenceItemData(
            type="http_request",
            label="Cross-Tenant Access Probe",
            content=(
                "GET /api/v1/records/1042 HTTP/1.1\n"
                "Host: simulated-target.internal\n"
                "Authorization: Bearer token_user_alice"
            ),
            details={"caller_id": "usr_alice_01", "target_record_id": 1042},
        ),
        EvidenceItemData(
            type="response_sample",
            label="Unauthorized Data Leakage",
            content=(
                "{\n"
                "  \"id\": 1042,\n"
                "  \"owner_id\": \"usr_bob_88\",\n"
                "  \"confidential_data\": \"Synthetic patient diagnostic note for Bob\"\n"
                "}"
            ),
            details={"leakage_detected": True, "record_owner": "usr_bob_88"},
        ),
    ],
    event_templates=[
        EventTemplateData(
            stage=WorkflowStage.RED_AGENT,
            event_type=EventType.SCENARIO_STARTED,
            title="Scenario Initialized",
            message="Red Agent loaded scenario fixture bola_demo_v1 (Broken Object-Level Authorization).",
        ),
        EventTemplateData(
            stage=WorkflowStage.RED_AGENT,
            event_type=EventType.PAYLOAD_SENT,
            title="IDOR/BOLA Request Dispatched",
            message="User Alice (usr_alice_01) requested record 1042 belonging to Bob (usr_bob_88).",
            evidence_json={"caller": "usr_alice_01", "requested_resource": 1042},
        ),
        EventTemplateData(
            stage=WorkflowStage.ARENA,
            event_type=EventType.RESPONSE_RECEIVED,
            title="Arena Response Inspected",
            message="Simulated endpoint served record 1042 without validating caller identity.",
            evidence_json={"status_code": 200, "resource_owner": "usr_bob_88"},
        ),
        EventTemplateData(
            stage=WorkflowStage.BLUE_AGENT,
            event_type=EventType.FINDING_DETECTED,
            title="Vulnerability Confirmed",
            message="Missing server-side ownership authorization check on /records/{record_id}.",
            evidence_json={"finding_id": "finding_bola_01", "severity": "high"},
        ),
    ],
    allowed_mitigations={
        "enforce_record_ownership": MitigationData(
            id="enforce_record_ownership",
            label="Enforce server-side record ownership check",
            description="Validate authenticated user context against the record's owner_id before returning data.",
            rule_summary="Server-side authorization verifies that the authenticated user possesses rights to the specific object ID before serving content.",
            unified_diff=(
                "--- a/controllers/record_controller.py\n"
                "+++ b/controllers/record_controller.py\n"
                "@@ -8,4 +8,7 @@\n"
                " @app.get(\"/api/v1/records/{record_id}\")\n"
                "-def get_record(record_id: int):\n"
                "-    return db.query(\"SELECT * FROM medical_records WHERE id = :id\", {\"id\": record_id})\n"
                "+def get_record(record_id: int, current_user = Depends(get_current_user)):\n"
                "+    record = db.query(\"SELECT * FROM medical_records WHERE id = :id\", {\"id\": record_id})\n"
                "+    if not record or record.owner_id != current_user.id:\n"
                "+        raise HTTPException(status_code=403, detail=\"Access denied: unauthorized record access\")\n"
                "+    return record"
            ),
            file_path="controllers/record_controller.py",
        ),
    },
    assertion=AssertionData(
        id="record_owner_check_enforced",
        description="Asserts that server-side authorization validates record ownership against authenticated user context.",
        summary="The named authorization assertion passed for this simulated scenario: record ownership is verified.",
        limitations="This result validates only the authorization assertion in this simulation.",
    ),
)
