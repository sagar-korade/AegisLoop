# Master Prompt 03 — Frontend/Backend Integration

Project identity: **AegisLoop**. Follow the minimal-premium visual system and purposeful staged verification motion when the prompt touches the UI. Preserve `docs/SECURITY_BOUNDARIES.md` as binding: deterministic simulation by default; offensive tests only in the isolated local Docker lab; no arbitrary targets, URLs, shell commands, public scanning, internet-facing vulnerable services, or Docker socket access.

Read `docs/API_CONTRACT.md` and `docs/TEST_PLAN.md`. Inspect both frontend and backend before editing.

Connect the React UI to the FastAPI backend with a typed API client. Replace fixture data only where the API is ready. Add loading, error, empty, disabled, and success states.

## Required flow
1. Fetch scenarios and health/mode.
2. Create a run for an allowlisted scenario.
3. Execute the scenario.
4. Render returned events and evidence.
5. Apply the scenario's allowed mitigation.
6. Retest the same scenario.
7. Display the server-calculated assertion.
8. Fetch/export the report.

Disable actions when state makes them invalid. Do not infer backend success from button clicks; wait for the API response. Do not show “passed” until the server returns a passing verification result.

Use local development origins only and configure narrow CORS. Run frontend build, typecheck, backend tests, and manual end-to-end verification. Report results truthfully.

Before changing execution or trust boundaries, read `docs/THREAT_MODEL.md` and `docs/SECURITY_BOUNDARIES.md`. Do not broaden the project beyond the documented simulation-first and isolated-lab scope.
