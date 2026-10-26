# Master Prompt 01 — Frontend Design and Build

Preserve `docs/SECURITY_BOUNDARIES.md` as binding: deterministic simulation by default; offensive tests only in the isolated local Docker lab; no arbitrary targets, URLs, shell commands, public scanning, internet-facing vulnerable services, or Docker socket access.

Read `AGENTS.md`, `docs/PRODUCT_REQUIREMENTS.md`, `docs/FRONTEND_DESIGN_SYSTEM.md`, and `docs/MOTION_GRAPHICS_SPEC.md`.

Build the AegisLoop frontend using React, Vite, TypeScript, and Tailwind CSS. Create a minimal premium security operations console informed by Linear/Vercel design principles: precise hierarchy, fine borders, restrained surfaces, generous spacing, and evidence-first content. Do not copy their branded UI. It must be responsive, accessible, and honest about simulation state.

## Screens and components
- Top bar with AegisLoop brand, lab mode label, run state, and reset control.
- Persistent safety banner: “Isolated Educational Lab — Simulation Mode”.
- KPI cards for scenarios run, mitigations applied, retests passed, and retests failed.
- Three primary panels: Red Agent, Arena/WAF, Blue Agent.
- Event timeline and telemetry detail inspector.
- WAF mitigation rule card.
- Readable before/after code diff.
- Verification summary with exact assertion and limitations.
- Empty, loading, error, success, and disabled states.

## Visual rules
Use the tokens from `docs/FRONTEND_DESIGN_SYSTEM.md`. Keep typography legible, logs in monospace, spacing consistent, and status colors semantic. Use one restrained primary accent, fine borders, and subtle surfaces. Avoid cyberpunk clichés, excessive glow, gradients, and neon. Design references: https://linear.app/, https://vercel.com/, https://herogrids.com/industry/developer-tools/. Adapt principles; do not copy.

## Motion
Implement the staged, cinematic-but-purposeful verification sequence described in `docs/MOTION_GRAPHICS_SPEC.md`. Use Motion for React where orchestration helps (https://motion.dev/docs/react); use CSS for simple transitions. Motion Primitives (https://motion-primitives.com/docs) may be consulted for patterns, but adapt rather than copy. Honor `prefers-reduced-motion`. Animations must reflect actual UI state and must never imply real packets in simulation mode or delay API results.

## Build method
1. Inspect existing code.
2. Plan components and file changes.
3. Implement the UI with typed fixture data first.
4. Add responsive behavior and accessibility.
5. Run typecheck/lint/build and report real results.
6. Do not implement backend integration yet.

Before changing execution or trust boundaries, read `docs/THREAT_MODEL.md` and `docs/SECURITY_BOUNDARIES.md`. Do not broaden the project beyond the documented simulation-first and isolated-lab scope.
