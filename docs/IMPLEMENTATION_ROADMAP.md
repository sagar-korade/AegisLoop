# AegisLoop Implementation Roadmap

## Phase 0 — Repository audit and contract freeze
- Read the architecture, product requirements, API contract, security boundaries, and threat model.
- Inspect existing files before changing structure.
- Confirm exact runtime versions and package managers.
- Resolve ambiguities and write a short implementation plan.
**Gate:** no implementation starts until the file tree and API contracts are understood.

## Phase 1 — Backend skeleton
- FastAPI app factory, health endpoint, typed config, structured error shape.
- Unit/API test harness.
**Gate:** health endpoint and tests pass.

## Phase 2 — Deterministic scenario service
- One scenario fixture.
- Run state machine and event generation.
- Allowlisted mitigation and assertion.
**Gate:** domain tests cover positive and negative transitions.

## Phase 3 — Persistence
- SQLite repository/schema initialization.
- Persist runs, events, mitigation, verification result.
**Gate:** integration tests pass with temporary database.

## Phase 4 — Complete API contract
- Scenario list, create/get/reset run, apply mitigation, retest.
- Typed request/response schemas and contract tests.
**Gate:** API contract examples match real responses.

## Phase 5 — Frontend foundation
- Vite/React/TypeScript setup, design tokens, app shell, typed API client.
- Loading/error/empty states.
**Gate:** UI loads data from backend; no fake values.

## Phase 6 — Main workflow UI
- Scenario selection, agent path stage, event timeline, evidence inspector.
- Mitigation selection and diff viewer.
- Verification summary with assertion and limitations.
**Gate:** full workflow works without motion.

## Phase 7 — Motion and polish
- Add the staged agent path and verification choreography.
- Add reduced-motion fallback and keyboard/screen-reader checks.
**Gate:** animation never changes state or delays results.

## Phase 8 — QA and release
- Run backend tests, frontend lint/typecheck/build, integration smoke test.
- Complete accessibility, responsive, and security reviews.
- Rehearse the demo.
**Gate:** release checklist is completed honestly.

## Phase 9 — Optional isolated Docker lab
Only after Phases 0–8 pass:
- Implement a fixed local-lab adapter.
- Add a toy target with synthetic data.
- Bind host ports only to loopback; private network; no privileged mode or Docker socket.
- Test isolation and failure handling.
**Gate:** isolation is verified; if uncertain, do not start the lab.

## Suggested first milestone
A complete simulation flow for one scenario is more valuable than several unfinished scenarios or an attractive dashboard with nonfunctional controls.
