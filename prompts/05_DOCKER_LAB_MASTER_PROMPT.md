# Master Prompt 05 — Optional Isolated Docker Lab

Project identity: **AegisLoop**. Follow the minimal-premium visual system and purposeful staged verification motion when the prompt touches the UI. Preserve `docs/SECURITY_BOUNDARIES.md` as binding: deterministic simulation by default; offensive tests only in the isolated local Docker lab; no arbitrary targets, URLs, shell commands, public scanning, internet-facing vulnerable services, or Docker socket access.

Read `docs/SECURITY_BOUNDARIES.md`, `docs/BACKEND_SPEC.md`, and `docs/TEST_PLAN.md`. Implement this phase only after the deterministic simulation and API tests pass.

Create a local-only Docker Compose educational lab with a toy vulnerable web app, synthetic data, fake flag, and fixed scenario IDs. Publish ports only on `127.0.0.1`; use a private Compose network; do not use host networking, privileged containers, Docker socket mounts, or broad host mounts. Do not provide public tunnels or deployment instructions for the vulnerable target.

Keep the Red Agent adapter restricted to the named local service and fixed test cases. Do not accept arbitrary URLs or commands. Include a fixed vulnerable example and a fixed secure version demonstrating parameterized SQL and server-side authorization. Add tests showing the same predefined test fails to exploit the fixed version while a legitimate control test still works.

Document startup, validation, and `docker compose down`. Inspect the final Compose file for isolation before reporting completion.

Before changing execution or trust boundaries, read `docs/THREAT_MODEL.md` and `docs/SECURITY_BOUNDARIES.md`. Do not broaden the project beyond the documented simulation-first and isolated-lab scope.
