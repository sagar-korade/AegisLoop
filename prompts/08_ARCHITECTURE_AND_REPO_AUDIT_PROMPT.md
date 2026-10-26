# Prompt 08 — Architecture and Repository Audit

Act as a senior software architect reviewing AegisLoop before implementation.

Read `AGENTS.md`, `README.md`, all docs under `docs/`, and all existing source files. Do not start a large implementation immediately.

Deliver:
1. A repository inventory and current-state summary.
2. A gap analysis against `PRODUCT_REQUIREMENTS.md`.
3. A proposed file tree that fits the existing repo.
4. A dependency-direction check for frontend/backend modules.
5. A list of API/data-model ambiguities that must be resolved.
6. A phase plan with small acceptance criteria.
7. A security-boundary checklist.

Do not invent implemented features. Do not delete existing work without explaining why. Preserve simulation-first behavior and all rules in `SECURITY_BOUNDARIES.md`. Ask a concise clarification only if a genuinely blocking decision cannot be inferred from the docs; otherwise state a conservative assumption and proceed.

Before changing execution or trust boundaries, read `docs/THREAT_MODEL.md` and `docs/SECURITY_BOUNDARIES.md`. Do not broaden the project beyond the documented simulation-first and isolated-lab scope.
