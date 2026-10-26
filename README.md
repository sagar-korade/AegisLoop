# AegisLoop — Antigravity Starter Pack

**Project:** AegisLoop — a staged purple-team learning and self-healing web-defence prototype  
**Target:** Working college prototype  
**Primary stack:** React + Vite + TypeScript, Tailwind CSS, FastAPI, SQLite, Docker Compose  
**Design direction:** Minimal premium developer-tool UI with cinematic-but-purposeful workflow motion  
**Security posture:** The hosted interface runs a deterministic simulation. Real offensive tests are restricted to an intentionally vulnerable toy target in an isolated local Docker lab.

## Documentation map

- `docs/ARCHITECTURE.md`: system boundaries, state machine, dependency direction.
- `docs/architecture/`: architecture decision records and sequence diagrams.
- `docs/API_CONTRACT.md`: request/response shapes and error semantics.
- `docs/DATA_MODEL.md`: entities, persistence rules, and constraints.
- `docs/THREAT_MODEL.md` and `docs/SECURITY_BOUNDARIES.md`: threat analysis and binding safety controls.
- `docs/FRONTEND_APPLICATION_SPEC.md`: component ownership and data flow.
- `docs/FRONTEND_ROUTES_AND_STATES.md`: page states and recovery behavior.
- `docs/ACCESSIBILITY_AND_RESPONSIVE_QA.md`: accessibility and layout gates.
- `docs/ENVIRONMENT_AND_CONFIG.md`: safe configuration.
- `docs/LOCAL_DEVELOPMENT.md`: implementation sequence and setup expectations.
- `docs/TEST_PLAN.md` and `docs/RELEASE_CHECKLIST.md`: verification gates.
- `docs/LAB_ISOLATION_RUNBOOK.md`: optional local lab controls.
- `prompts/`: focused prompts for each implementation and review phase.

## How to use this pack

1. Create a new Antigravity workspace/repository named `aegisloop`.
2. Copy this pack's Markdown files into the repository; keep `AGENTS.md` at the root.
3. Give Antigravity `prompts/00_PROJECT_ORCHESTRATOR.md` first.
4. Ask it to inspect the repository and propose a plan before writing code.
5. Implement in the order in `docs/IMPLEMENTATION_ROADMAP.md`, using one phase prompt at a time.
6. After each phase, run the listed checks and inspect the diff before proceeding.
7. Use `docs/FRONTEND_DESIGN_SYSTEM.md` and `docs/MOTION_GRAPHICS_SPEC.md` as the visual source of truth.

## Product promise

AegisLoop demonstrates a traceable security workflow: run a predefined scenario, inspect evidence, apply an allowlisted mitigation, and replay the same assertion. The interface should make every stage legible, explain what changed, and distinguish simulated behavior from local lab execution.

## MVP definition of done

- A user can start/reset a demo and run a predefined scenario.
- The app records a scenario event and displays evidence/telemetry.
- The defense stage applies a deterministic mitigation to the simulated target.
- The exact same test is replayed; a backend assertion confirms the post-mitigation result.
- The dashboard distinguishes **simulated events** from **local lab execution**.
- No feature scans arbitrary hosts, accepts arbitrary target URLs, executes user-provided shell commands, or attacks public systems.
- Automated tests cover the state machine, mitigation, replay, and API validation.
- README documents local setup and lab isolation.
- Motion illustrates the sequence without delaying results, fabricating telemetry, or overriding actual state.

## Visual direction and references

Aim for the restraint and clarity of premium developer tools: clean hierarchy, fine borders, careful spacing, readable evidence, and a restrained accent. Use purposeful choreography for the agent path and staged retest; avoid noisy cyberpunk visuals.

- Linear: https://linear.app/
- Vercel: https://vercel.com/
- HeroGrids developer-tool gallery: https://herogrids.com/industry/developer-tools/
- Motion for React: https://motion.dev/docs/react
- Motion animation controls: https://motion.dev/docs/react-animation
- Motion Primitives: https://motion-primitives.com/docs

These are references for principles and implementation techniques, not assets to copy. Do not copy logos, branded layouts, or proprietary visuals.

## Important claims discipline

Do not label the prototype “autonomous AI” unless an actual model/agent integration exists and is tested. The first version is a deterministic multi-stage security workflow. Label LLM orchestration as a future extension.
