# Prompt 11 — Security Boundary Review

Review AegisLoop as a defensive-learning prototype. Treat `docs/SECURITY_BOUNDARIES.md`, `docs/THREAT_MODEL.md`, and `docs/LAB_ISOLATION_RUNBOOK.md` as binding.

Audit:
- request schemas for arbitrary targets, hosts, URLs, shell commands, paths, or container names;
- backend state validation and allowlists;
- error leakage, logs, CORS, and secrets;
- rendering of evidence and diffs;
- Docker Compose port bindings, network mode, privileges, mounts, and user;
- simulation/local-lab mode labeling;
- unsupported claims of AI autonomy, live scanning, or universal security.

Do not conduct tests against public or third-party targets. Do not add offensive capability outside the isolated local lab. Provide findings by severity, evidence path/line, impact, and safe remediation. Make only low-risk fixes that do not broaden capabilities; propose larger changes before applying them.
