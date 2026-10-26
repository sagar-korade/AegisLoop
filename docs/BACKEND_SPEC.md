# AegisLoop Backend Specification

## Stack
- Python 3.11+ (choose and pin one version supported by dependencies).
- FastAPI and Pydantic.
- SQLite via SQLAlchemy or a small repository layer; choose one approach and use it consistently.
- Pytest and FastAPI TestClient for automated tests.
- Uvicorn for local development.

## Responsibilities
The backend owns scenario allowlists, run state, state transitions, mitigation eligibility, event persistence, and verification outcomes. The frontend is a presentation client.

## Recommended modules
- `api/routes/health.py`: liveness/readiness endpoints.
- `api/routes/scenarios.py`: list scenario metadata.
- `api/routes/runs.py`: create, retrieve, reset runs.
- `api/routes/mitigations.py`: apply approved mitigation.
- `api/routes/verification.py`: retest a run.
- `schemas/`: request and response models.
- `domain/`: enums, transition rules, domain errors.
- `services/`: orchestration and use cases.
- `adapters/simulation/`: deterministic scenario fixtures.
- `db/`: session, repository, schema initialization.
- `core/config.py`: typed configuration.
- `main.py`: app factory, middleware, router registration.

## Validation rules
- Use Pydantic request models with strict enums/IDs where possible.
- Reject unknown scenario IDs and mitigation IDs.
- Never accept a target URL, arbitrary command, file path, or Docker command from a request.
- Validate that mitigation is permitted for the active finding.
- Validate run state before each mutation.
- Make reset behavior explicit and idempotent where feasible.
- Limit request body sizes and return structured errors.

## Persistence
Store run ID, scenario ID, mode, status, created/updated timestamps, event records, mitigation ID, and verification result. Store only synthetic evidence; do not persist secrets or user-supplied target data. Use transactions around state changes.

## Determinism
A scenario fixture defines:
- scenario ID and version
- finding metadata
- synthetic request/evidence sample
- expected pre-mitigation assertion
- allowlisted mitigation IDs
- expected post-mitigation assertion
- educational explanation and limitations

No randomness is required for the core result. If IDs or timestamps are generated dynamically, the logical outcome must remain deterministic.

## Response and error conventions
Use the schemas in `docs/API_CONTRACT.md`. Return `request_id` on errors. Use 400 for invalid transition, 404 for unknown run/scenario, 409 for state conflict, and 422 for invalid request payload. Do not leak stack traces.

## Testing
Test each service independently, then route behavior with a temporary test database. Include negative tests for unknown IDs, invalid transitions, repeated mitigation, retest-before-mitigation, and reset behavior.

## Local lab adapter
Implement only after simulation works. The adapter must call a fixed service name/configuration and predefined lab routes. It must not accept user-controlled hosts, ports, URLs, shell commands, container names, or compose arguments. If the local lab is unavailable, return a safe actionable error rather than falling back silently.
