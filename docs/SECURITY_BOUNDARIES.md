# Security Boundaries and Lab Isolation

## Default behavior
The hosted dashboard is a deterministic simulation. It must not make outbound requests to user-supplied targets or run arbitrary attack tools.

## Local lab requirements
- Use only a deliberately vulnerable toy app with synthetic data and fake flags.
- Keep Docker services on a private Compose network.
- Bind any host-published port explicitly to `127.0.0.1`, for example `127.0.0.1:8081:8080`.
- Do not use `network_mode: host`.
- Do not mount the host Docker socket.
- Do not mount broad host directories into the vulnerable container.
- Run containers as non-root where feasible.
- Avoid privileged mode and unnecessary Linux capabilities.
- No public tunnel or cloud deployment for the vulnerable service.
- Do not use real credentials, real user data, or external targets.

## Demonstration safety
- Keep scenarios fixed and harmless.
- The Red Agent only calls the local toy target adapter in `local_lab` mode, never arbitrary URLs.
- Do not include exploit chaining, persistence, stealth, evasion, credential harvesting, or destructive payloads.
- Do not expose real secret values in the UI; use a fake `OWASP_NMIET{demo_only}` flag.
- Document how to stop the lab: `docker compose down`.

## Patch correctness
- A WAF signature is mitigation, not proof of a source-level fix.
- Parameterized SQL and server-side authorization checks should be demonstrated as durable remediation.
- A retest must assert the vulnerable behavior no longer occurs and normal legitimate behavior still works.
- Do not report “zero-day eliminated” or “mathematically proven secure.” Report the exact test assertion and its limits.
