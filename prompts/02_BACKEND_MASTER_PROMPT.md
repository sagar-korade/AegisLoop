# Master Prompt 02 — FastAPI Backend

Project identity: **AegisLoop**. Follow the minimal-premium visual system and purposeful staged verification motion when the prompt touches the UI. Preserve `docs/SECURITY_BOUNDARIES.md` as binding: deterministic simulation by default; offensive tests only in the isolated local Docker lab; no arbitrary targets, URLs, shell commands, public scanning, internet-facing vulnerable services, or Docker socket access.

Read `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/BACKEND_SPEC.md`, `docs/API_CONTRACT.md`, `docs/DATA_MODEL.md`, and `docs/SECURITY_BOUNDARIES.md`.

Implement the deterministic FastAPI backend. Inspect the repository first and avoid overwriting frontend work.

## Requirements
- Pydantic schemas for requests and responses.
- Scenario and mitigation allowlists.
- Explicit state machine with validated transitions.
- SQLite persistence for runs, events, mitigation actions, and verification results.
- Endpoints exactly as specified in `docs/API_CONTRACT.md`.
- Server-calculated retest assertions; client must never submit a pass result.
- Consistent JSON errors for invalid state transitions.
- Structured, sanitized audit events.
- Tests for successful and invalid flows.

## Safety
Do not accept arbitrary URLs, shell commands, arbitrary payloads, or arbitrary patch text. The simulation engine should use fixed scenario fixtures and harmless synthetic evidence. The “patch” changes modeled state and supplies an illustrative reviewed diff; it must not write arbitrary source files.

## Completion
Run unit and API tests. Report the exact commands and pass/fail results. Stop before adding Docker lab execution.

Before changing execution or trust boundaries, read `docs/THREAT_MODEL.md` and `docs/SECURITY_BOUNDARIES.md`. Do not broaden the project beyond the documented simulation-first and isolated-lab scope.
