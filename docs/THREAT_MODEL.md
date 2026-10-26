# AegisLoop Threat Model

## Assets
- Integrity of run state and verification results.
- Integrity of scenario and mitigation allowlists.
- Local developer machine and Docker daemon.
- User trust in the accuracy of displayed claims.
- Synthetic evidence and application configuration.

## Trust boundaries
1. Browser → API: all client input is untrusted.
2. API → persistence: validate data and use parameterized ORM/repository operations.
3. API → local Docker lab (optional): high-risk boundary; fixed allowlisted services only.
4. Simulation UI → human interpretation: labels must prevent confusion between simulation and real testing.

## Threats and controls
- **Arbitrary-target abuse:** no URL/host field exists in public API schemas.
- **Command injection:** no shell command is accepted from the client; use fixed application operations.
- **Invalid state manipulation:** backend validates transitions, not just disabled UI buttons.
- **False verification claims:** result names the exact assertion and its limitations.
- **Sensitive error leakage:** generic client errors; server logs avoid secrets.
- **Unsafe container exposure:** loopback-only port binding, private network, no privileged mode, no Docker socket mount.
- **Dependency risk:** pin dependencies, review package changes, avoid unneeded packages.
- **Stored evidence injection:** render evidence as text, never inject HTML; escape code/diff content.
- **CSRF/CORS misconfiguration:** restrict CORS to documented local frontend origin; do not use wildcard credentials.
- **Denial of service:** bound request sizes and event counts; avoid unbounded loops or arbitrary payload execution.
- **Confused-deputy behavior:** local-lab adapter accepts scenario IDs, not arbitrary URLs or container names.

## Abuse cases to test
- Unknown scenario ID.
- Unknown mitigation ID.
- Retest before mitigation.
- Apply a mitigation not allowed for the scenario.
- Reapply a mitigation when state does not permit it.
- Access nonexistent run ID.
- Supply unexpected JSON fields.
- Attempt to set mode to an unsupported value.
- Attempt to pass `target_url`, `command`, `host`, or `container_name`.
- Stop or remove the lab service and verify the API fails safely.

## Residual risk
This is a learning prototype, not a hardened production service. Do not expose the API or vulnerable lab to the public internet. Do not put secrets in source control.
