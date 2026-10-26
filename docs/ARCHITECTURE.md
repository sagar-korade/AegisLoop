# AegisLoop System Architecture

## 1. Purpose
AegisLoop is an educational purple-team workflow demonstrator. It presents a predefined test, captures structured evidence, applies an allowlisted simulated mitigation, and replays the same assertion. The first release is deterministic and simulation-first. It is not a production scanner, a general-purpose exploitation framework, or an autonomous AI agent.

## 2. Architecture principles
1. **Simulation by default:** no real network target is needed for the primary demo.
2. **Explicit trust boundaries:** UI inputs are untrusted; backend scenario IDs and mitigation IDs are allowlisted.
3. **Evidence before claims:** every displayed status is derived from a backend result or clearly marked as presentation-only.
4. **Deterministic replay:** the same scenario and state should produce reproducible results.
5. **Narrow interfaces:** frontend calls documented API endpoints; it does not access the database or run commands.
6. **Replaceable adapters:** a local-lab adapter may be added later without changing the simulation contract.
7. **Safe failure:** invalid state transitions fail closed and do not mutate state.
8. **Accessible motion:** animation never carries essential meaning alone and respects reduced-motion settings.

## 3. Logical components
- **Web UI (React/Vite/TypeScript):** dashboard, scenario selection, workflow stage visualization, evidence timeline, mitigation diff, retest summary.
- **API (FastAPI):** validates requests, owns workflow transitions, returns typed response models.
- **Application services:** scenario runner, evidence service, mitigation service, retest verifier, run/session service.
- **Domain models:** Run, Scenario, Event, Mitigation, VerificationResult.
- **Persistence (SQLite for MVP):** stores run metadata and event history. The database is local prototype storage, not a multi-tenant production store.
- **Simulation adapter:** deterministic fixture-based behavior, no outbound connections.
- **Optional local-lab adapter (later phase):** connects only to a named local Docker Compose service over a private network.

## 4. Request flow
1. UI requests available scenarios.
2. User selects an allowlisted scenario and starts a run.
3. API creates a run with mode `simulation`.
4. Scenario service generates deterministic test evidence.
5. UI renders returned events and active stage.
6. User applies a predefined mitigation ID.
7. API validates that the run is at the correct state and the mitigation is allowed for that scenario.
8. UI displays the explanation and unified diff returned by the API.
9. User requests retest.
10. API evaluates a named assertion and stores the result.
11. UI displays the result, assertion name, and limitations.

## 5. State machine
`created → testing → evidence_ready → mitigation_applied → retesting → verified | verification_failed`

- `created`: run exists; no scenario execution has occurred.
- `testing`: backend is executing the deterministic scenario.
- `evidence_ready`: evidence exists; an approved mitigation can be selected.
- `mitigation_applied`: an allowlisted mitigation is attached to the run.
- `retesting`: the named assertion is being evaluated.
- `verified`: the assertion passed for this scenario and current simulated state.
- `verification_failed`: the assertion failed; UI should show the reason and permit a safe retry if supported.
- `reset`: creates a new run or returns a run to a documented initial state; no hidden state should remain.

Reject transitions not explicitly allowed. Never let frontend animation determine domain state.

## 6. Suggested repository layout
```text
aegisloop/
  AGENTS.md
  README.md
  frontend/
    src/
      app/
      components/
      features/
        dashboard/
        scenarios/
        runs/
        evidence/
        mitigations/
        verification/
      lib/
      types/
      styles/
    public/
    package.json
    vite.config.ts
  backend/
    app/
      api/routes/
      core/
      db/
      domain/
      schemas/
      services/
      adapters/simulation/
      adapters/local_lab/
      main.py
    tests/
    pyproject.toml or requirements.txt
  lab/
    compose.yaml
    target/
    README.md
  docs/
  prompts/
```
Antigravity should adapt to an existing repository rather than duplicating a structure blindly.

## 7. Dependency direction
- UI components may depend on feature hooks and API client modules.
- Feature hooks may depend on shared API client and frontend types.
- API routes depend on schemas and application services.
- Application services depend on domain logic and adapter interfaces.
- Simulation/local-lab adapters implement interfaces; domain services should not import Docker SDK directly.
- Database models/repositories must not leak into API response objects.
- No circular imports.

## 8. API and data ownership
FastAPI is authoritative for run state, allowed transitions, mitigation eligibility, and retest outcome. SQLite stores run and event history. Frontend may cache display data but cannot mark a run verified by itself.

## 9. Error handling
Return structured errors with a stable `code`, human-readable `message`, optional `details`, and `request_id`. Do not expose stack traces, environment variables, SQL text, or container internals in API responses. Log internal diagnostics server-side without secrets.

## 10. Operational modes
- `simulation`: default and safe for hosted demo; deterministic fixtures, no outbound network.
- `local_lab`: optional, explicitly enabled by local configuration; only named lab services, loopback-bound host ports, private Compose network.
- No `production_scan` mode exists in the prototype.

## 11. Scalability boundaries
SQLite and a single API process are adequate for a college prototype. Do not introduce Redis, Celery, Kubernetes, or a message broker unless a measured requirement justifies it. Document any later migration separately.

## 12. Architecture decisions
See `docs/architecture/` for individual ADRs and detailed data-flow diagrams.
