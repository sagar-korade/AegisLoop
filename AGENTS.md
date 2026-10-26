# AegisLoop Agent Instructions

## Project purpose
Build a college-level, reproducible security-learning prototype that demonstrates a traceable workflow from predefined test to evidence, mitigation, and named retest assertion.

## Read first
- `README.md`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY_BOUNDARIES.md`
- `docs/API_CONTRACT.md`
- `docs/IMPLEMENTATION_ROADMAP.md`
- `docs/FRONTEND_DESIGN_SYSTEM.md`
- `docs/MOTION_GRAPHICS_SPEC.md`

## Binding implementation rules
1. Simulation mode is the default and must not make outbound network calls.
2. All scenario, mitigation, and assertion identifiers are allowlisted by the backend.
3. Backend state is authoritative; frontend animation cannot change application state.
4. No arbitrary target URL, host, port, shell command, file path, Docker command, or container name is accepted from a user.
5. Offensive testing, if implemented, is limited to the intentionally vulnerable toy target in the isolated local Docker lab.
6. The lab must be disabled by default, use a private network, bind host ports to loopback, and avoid privileged mode and Docker socket mounts.
7. Do not claim autonomous AI, real-time traffic inspection, source-code repair, or production protection unless implemented and tested.
8. A passing retest proves only the named assertion for the chosen scenario.
9. Do not add fake metrics, fake telemetry, dead buttons, or placeholder success states.
10. Respect accessibility and `prefers-reduced-motion`.
11. Keep dependencies minimal and document meaningful choices.
12. Update tests and documentation whenever behavior or API contracts change.

## Design direction
Minimal premium developer-tool UI: precise hierarchy, fine borders, restrained accent colors, readable evidence, and purposeful staged verification. Linear/Vercel/Motion resources are references for principles and patterns; do not copy branding or layouts.

## Workflow
Inspect before editing. Plan small phases. Make focused changes. Run relevant tests. Report what changed, what was tested, what failed, and what remains.
