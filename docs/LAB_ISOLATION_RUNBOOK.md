# Optional Local Docker Lab Isolation Runbook

**Do not implement this phase until simulation mode and its tests are complete.**

## Required controls
- Bind any host port only to `127.0.0.1`.
- Use a private Compose network.
- No `privileged: true`.
- No `/var/run/docker.sock` mount.
- No host network mode.
- No mounted home directory or sensitive host path.
- Use a non-root user in the target container where practical.
- Use synthetic data and disposable state.
- No public ingress, tunnelling, or router port forwarding.
- Backend can call only predefined lab operations and fixed service names.
- Lab is disabled by default and labelled `Local Isolated Lab`.

## Verification before use
- Inspect the resolved Compose configuration.
- Confirm port mappings are loopback-only.
- Confirm the target service is not reachable from another device on the LAN.
- Confirm no Docker socket or privileged settings.
- Confirm the app refuses arbitrary host/URL/command inputs.
- Stop the lab after the demo and remove disposable containers/volumes according to the documented cleanup procedure.

## Stop conditions
Do not start the lab if isolation cannot be confirmed. Fall back to simulation only if the user explicitly selects simulation mode; never silently change execution mode.
