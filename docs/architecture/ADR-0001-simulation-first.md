# ADR-0001: Simulation-First Execution

- Status: Accepted
- Date: 2026-10-25

## Context
A college prototype must be demonstrable without risking external systems or depending on a fragile lab setup.

## Decision
The default execution mode is deterministic simulation. It uses source-controlled fixtures and makes no outbound network requests. A local Docker lab is an optional later phase and must be explicitly enabled.

## Consequences
- The MVP is repeatable and easy to test.
- The UI must label simulation clearly.
- Findings are educational examples, not live discoveries.
- A local lab adapter cannot broaden target selection or accept arbitrary commands.
