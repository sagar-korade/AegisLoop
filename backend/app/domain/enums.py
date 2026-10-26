"""Domain enumerations for AegisLoop."""
from enum import Enum


class RunStatus(str, Enum):
    """Authoritative lifecycle status of a security workflow run."""

    CREATED = "created"
    TESTING = "testing"
    EVIDENCE_READY = "evidence_ready"
    MITIGATION_APPLIED = "mitigation_applied"
    RETESTING = "retesting"
    VERIFIED = "verified"
    VERIFICATION_FAILED = "verification_failed"
    RESET = "reset"


class ExecutionMode(str, Enum):
    """Execution mode of the run: deterministic simulation or isolated local lab."""

    SIMULATION = "simulation"
    LOCAL_LAB = "local_lab"


class Severity(str, Enum):
    """Finding severity levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class WorkflowStage(str, Enum):
    """Logical workflow stage for UI visualization and timeline grouping."""

    RED_AGENT = "red_agent"
    ARENA = "arena"
    BLUE_AGENT = "blue_agent"
    VERIFICATION = "verification"


class EventType(str, Enum):
    """Allowlisted event types for the append-only run log."""

    SCENARIO_STARTED = "scenario_started"
    PAYLOAD_SENT = "payload_sent"
    RESPONSE_RECEIVED = "response_received"
    FINDING_DETECTED = "finding_detected"
    MITIGATION_PROPOSED = "mitigation_proposed"
    MITIGATION_APPLIED = "mitigation_applied"
    RETEST_STARTED = "retest_started"
    ASSERTION_EVALUATED = "assertion_evaluated"
    RUN_RESET = "run_reset"
