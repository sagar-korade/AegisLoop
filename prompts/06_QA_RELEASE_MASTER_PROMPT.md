# Master Prompt 06 — QA, Documentation, and Release

Project identity: **AegisLoop**. Follow the minimal-premium visual system and purposeful staged verification motion when the prompt touches the UI. Preserve `docs/SECURITY_BOUNDARIES.md` as binding: deterministic simulation by default; offensive tests only in the isolated local Docker lab; no arbitrary targets, URLs, shell commands, public scanning, internet-facing vulnerable services, or Docker socket access.

Read `docs/TEST_PLAN.md`, `docs/DEMO_SCRIPT.md`, and all project requirements. Do not add new features unless required to fix a defect.

Run frontend typecheck/lint/build, backend unit/API tests, and local lab checks if the lab exists. Review responsive behavior, keyboard navigation, reduced-motion behavior, error states, API transitions, persistence, and security boundaries.

Verify that:
- simulation mode is clearly labeled;
- no arbitrary target URL or command is accepted;
- retest results are calculated on the backend;
- a failed retest is never presented as success;
- Docker ports bind to localhost only;
- no secrets are committed;
- README instructions are reproducible.

Fix defects, rerun relevant checks, and report exact commands and results. Include known limitations and do not claim production readiness or mathematical proof of security.

Before changing execution or trust boundaries, read `docs/THREAT_MODEL.md` and `docs/SECURITY_BOUNDARIES.md`. Do not broaden the project beyond the documented simulation-first and isolated-lab scope.
