# Local Development Guide

## Prerequisites
- Git.
- Python version pinned by the repository.
- Node.js LTS compatible with the selected Vite version.
- Docker Desktop only if implementing the optional local lab.
- Antigravity or another editor.

## Suggested development sequence
1. Create the repository and root `AGENTS.md`.
2. Implement the FastAPI health endpoint and tests.
3. Implement scenarios and deterministic run service.
4. Add SQLite persistence and migration/schema initialization.
5. Implement mitigation and verification endpoints.
6. Create the typed frontend API client.
7. Build the dashboard and workflow states.
8. Add motion after the state flow works without animation.
9. Add the optional Docker lab only after the simulation acceptance tests pass.
10. Run full QA and follow `RELEASE_CHECKLIST.md`.

## Commands
Exact commands must match the generated package files. Document commands in root README after the repository's dependency manager is chosen. Do not leave guessed or untested commands in the final setup guide.

## Troubleshooting expectations
Document common issues: port already in use, wrong Python/Node version, frontend API base URL mismatch, database permission failure, CORS origin mismatch, Docker unavailable, and lab service not healthy.
