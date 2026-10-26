# AegisLoop Product Requirements

## Product summary
AegisLoop is a security-learning dashboard that demonstrates a traceable purple-team loop: predefined test → evidence → mitigation → code/rule diff → retest → assertion result.

## Target users
- Students demonstrating defensive security concepts.
- Faculty reviewing reproducibility, safety boundaries, and implementation quality.
- Developers learning how a security finding can be connected to a mitigation and a verification check.

## Primary user journey
1. Open the dashboard and see the current mode.
2. Select one of the predefined scenarios.
3. Start a run.
4. Inspect the generated finding and evidence.
5. Choose an approved mitigation.
6. Review what the mitigation changes.
7. Retest the exact scenario.
8. Read the assertion result and its limitations.
9. Reset and repeat.

## MVP requirements
- R1: Display the current mode prominently (`Simulation Mode` or `Local Isolated Lab`).
- R2: List only backend-approved scenarios.
- R3: Create a run using a scenario ID, not a free-form target.
- R4: Display ordered run events with timestamps and stable event IDs.
- R5: Show finding title, severity, summary, evidence, and a scenario-specific explanation.
- R6: Allow only mitigation IDs returned as available for that finding.
- R7: Display the backend-provided diff or rule explanation.
- R8: Retest only after mitigation has been applied.
- R9: Display the exact verification assertion and its pass/fail result.
- R10: Allow a safe reset.
- R11: Work at desktop and mobile widths without horizontal page scrolling.
- R12: Respect keyboard navigation and reduced-motion settings.
- R13: Include automated tests for state transitions and API validation.
- R14: Include clear setup and troubleshooting instructions.
- R15: Preserve the security boundaries in `SECURITY_BOUNDARIES.md`.

## Non-functional requirements
- Predictable local startup with documented commands.
- No secret required for simulation mode.
- Accessible contrast and visible focus indicators.
- A typical simulation run should feel responsive; animation must not delay backend results.
- No critical result should be communicated by color or animation alone.
- Errors should provide actionable recovery steps without exposing internals.
- Dependency choices should remain lightweight and documented.

## Explicit non-goals
- Scanning public IPs, arbitrary domains, or user-supplied URLs.
- Exploiting real websites.
- Autonomous source-code modification of a real target.
- General-purpose shell execution.
- Claiming an LLM is used when the implementation is deterministic.
- Claiming a passing scenario proves a system is secure.
- Multi-tenant SaaS authentication and billing for the MVP.

## Demo acceptance criteria
The demo is complete when a reviewer can run a predefined scenario, inspect evidence, apply one approved mitigation, view the diff, retest, and see a backend-computed assertion result, with mode and limitations visible throughout.
