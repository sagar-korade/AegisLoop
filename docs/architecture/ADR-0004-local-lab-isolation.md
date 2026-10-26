# ADR-0004: Isolated Local Docker Lab

- Status: Accepted
- Date: 2026-10-25

## Context
An intentionally vulnerable target can improve educational value, but must not expose other systems or the host.

## Decision
If implemented, the lab uses a private Docker Compose network, binds any host-accessible port to `127.0.0.1`, avoids privileged containers, mounts no Docker socket, and contains only synthetic data. The backend uses a fixed adapter and predefined scenario operations.

## Consequences
- The lab is for local learning only.
- No public scanning or arbitrary host/URL input is supported.
- Docker execution is not required for the MVP simulation.
