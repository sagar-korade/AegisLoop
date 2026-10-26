# Prompt 10 — Frontend Accessibility and Responsive QA

Audit AegisLoop against `FRONTEND_APPLICATION_SPEC.md`, `FRONTEND_ROUTES_AND_STATES.md`, and `ACCESSIBILITY_AND_RESPONSIVE_QA.md`.

Check:
- loading, empty, error, success, invalid-run, and local-lab-unavailable states;
- keyboard reachability and visible focus;
- semantic headings, labels, and status announcements;
- reduced-motion fallback;
- responsive widths and horizontal overflow;
- readable diff/evidence text;
- truthful mode labels and backend-derived status.

Fix issues in small steps. Do not add fake metrics, fake telemetry, decorative features that obscure evidence, or controls without working actions. Run lint, typecheck, and build if available; report actual results.

Before changing execution or trust boundaries, read `docs/THREAT_MODEL.md` and `docs/SECURITY_BOUNDARIES.md`. Do not broaden the project beyond the documented simulation-first and isolated-lab scope.
