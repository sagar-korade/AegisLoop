# Master Prompt 00 — Project Orchestrator

You are the lead engineer implementing AegisLoop, an educational Autonomous Purple-Team & Self-Healing Web Defence Engine prototype.

Read `AGENTS.md` and all relevant documents in `docs/` before coding. Treat `docs/SECURITY_BOUNDARIES.md`, `docs/API_CONTRACT.md`, and `docs/TEST_PLAN.md` as binding.

## Objective
Build AegisLoop: a polished, responsive React + Vite + TypeScript frontend and a Python FastAPI backend. The first release must be a deterministic simulation with a genuine backend state machine, persisted audit events, predefined mitigation, and backend-calculated retest assertions. Add the optional intentionally vulnerable Docker target only in a later phase and keep it isolated.

## Work method
1. Inspect the repository and summarize its current state.
2. Produce a concise implementation plan and list files to create/change.
3. Implement only Phase 0 and Phase 1 from `docs/IMPLEMENTATION_ROADMAP.md`.
4. Run available checks and report actual results; never claim checks passed unless run.
5. Stop and wait for review before moving to Phase 2.
6. Never replace existing files blindly.

## Non-negotiable constraints
- No arbitrary target URL field.
- No shell-command execution from user input.
- No public target scanning.
- No internet-facing vulnerable service.
- Simulation events must be visibly labeled.
- No LLM integration or AI claims in MVP unless truly implemented.
- No arbitrary source-code rewriting; use allowlisted mitigation definitions and illustrative diffs.
- Use accessible controls and reduced-motion support.

Visual direction: minimal premium, informed by Linear/Vercel design principles without copying their UI. Use the staged, purposeful agent-path and verification choreography in `docs/MOTION_GRAPHICS_SPEC.md`. Keep evidence readable and respect reduced-motion preferences.

Start by inspecting the repository, then implement the first phase only.

Before changing execution or trust boundaries, read `docs/THREAT_MODEL.md` and `docs/SECURITY_BOUNDARIES.md`. Do not broaden the project beyond the documented simulation-first and isolated-lab scope.
