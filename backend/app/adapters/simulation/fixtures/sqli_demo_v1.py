"""Scenario A: Unsafe Query Construction (sqli_demo_v1)."""
from app.adapters.simulation.fixtures.base import (
    AssertionData,
    EventTemplateData,
    EvidenceItemData,
    MitigationData,
    ScenarioFixture,
)
from app.domain.enums import EventType, ExecutionMode, Severity, WorkflowStage

SQLI_FIXTURE = ScenarioFixture(
    id="sqli_demo_v1",
    version="1.0.0",
    name="Unsafe Query Construction",
    category="injection",
    severity=Severity.HIGH,
    summary="A synthetic fixture demonstrates unsafe query construction in dynamic SQL.",
    teaching_objective="Demonstrate why query string concatenation is unsafe and why parameterized queries separate code from data.",
    mode_support=[ExecutionMode.SIMULATION],
    finding_title="Unsafe Dynamic Query Construction (SQL Injection)",
    finding_summary="The application dynamically formats SQL queries with string concatenation, allowing input manipulation to alter query logic.",
    evidence_items=[
        EvidenceItemData(
            type="code_snippet",
            label="Vulnerable Repository Query Logic",
            content=(
                "def find_account_by_username(username: str):\n"
                "    query = f\"SELECT id, username, email FROM accounts WHERE username = '{username}'\"\n"
                "    return db.execute(query).fetchall()"
            ),
            details={"file": "services/account_service.py", "line": 11},
        ),
        EvidenceItemData(
            type="http_request",
            label="Injected HTTP Probe Sample",
            content=(
                "GET /api/v1/accounts?username=admin'%20OR%20'1'='1 HTTP/1.1\n"
                "Host: simulated-target.internal\n"
                "User-Agent: AegisLoop-RedAgent/1.0"
            ),
            details={"method": "GET", "parameter": "username"},
        ),
    ],
    event_templates=[
        EventTemplateData(
            stage=WorkflowStage.RED_AGENT,
            event_type=EventType.SCENARIO_STARTED,
            title="Scenario Initialized",
            message="Red Agent loaded scenario fixture sqli_demo_v1 (Unsafe Query Construction).",
        ),
        EventTemplateData(
            stage=WorkflowStage.RED_AGENT,
            event_type=EventType.PAYLOAD_SENT,
            title="Simulated Probe Sent",
            message="Injected simulated boolean-based query probe into username parameter.",
            evidence_json={"parameter": "username", "payload": "admin' OR '1'='1"},
        ),
        EventTemplateData(
            stage=WorkflowStage.ARENA,
            event_type=EventType.RESPONSE_RECEIVED,
            title="Arena Response Inspected",
            message="Simulated endpoint returned entire accounts table instead of single target entity.",
            evidence_json={"status_code": 200, "rows_returned": 14},
        ),
        EventTemplateData(
            stage=WorkflowStage.BLUE_AGENT,
            event_type=EventType.FINDING_DETECTED,
            title="Vulnerability Confirmed",
            message="Unsafe dynamic query construction identified in account search endpoint.",
            evidence_json={"finding_id": "finding_sqli_01", "severity": "high"},
        ),
    ],
    allowed_mitigations={
        "parameterized_query": MitigationData(
            id="parameterized_query",
            label="Use parameterized queries",
            description="Replace string concatenation with bound parameters using query placeholders.",
            rule_summary="Parameterized statements compile query structure ahead of parameter binding, ensuring untrusted input is interpreted strictly as data rather than executable syntax.",
            unified_diff=(
                "--- a/services/account_service.py\n"
                "+++ b/services/account_service.py\n"
                "@@ -10,4 +10,4 @@\n"
                " def find_account_by_username(username: str):\n"
                "-    query = f\"SELECT id, username, email FROM accounts WHERE username = '{username}'\"\n"
                "-    return db.execute(query).fetchall()\n"
                "+    query = \"SELECT id, username, email FROM accounts WHERE username = :username\"\n"
                "+    return db.execute(query, {\"username\": username}).fetchall()"
            ),
            file_path="services/account_service.py",
        ),
    },
    assertion=AssertionData(
        id="sqli_input_is_parameterized",
        description="Asserts that dynamic SQL query construction uses bound query parameters.",
        summary="The named assertion passed for this simulated scenario: input binding is properly enforced.",
        limitations="This result covers only this named assertion and this simulation fixture.",
    ),
)
