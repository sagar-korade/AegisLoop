# Frontend Application Specification

## Recommended feature layout
- `features/dashboard`: summary metrics and current mode.
- `features/scenarios`: scenario catalogue and selector.
- `features/runs`: run lifecycle and reset controls.
- `features/evidence`: finding details, event timeline, evidence inspector.
- `features/mitigations`: allowlisted mitigation picker and diff view.
- `features/verification`: assertion result and limitations.
- `components/ui`: small reusable UI primitives.
- `lib/api-client.ts`: typed fetch wrapper and error normalization.
- `types/api.ts`: TypeScript types matching `API_CONTRACT.md`.
- `app/`: app shell, router, global providers.

## Page hierarchy
1. Top bar: AegisLoop wordmark, mode badge, connection status, reset action.
2. Page heading: “Security workflow” plus concise description and primary run control.
3. Metrics: runs, findings, mitigations, assertions passed (computed from real app state; no invented values).
4. Scenario and agent path stage.
5. Evidence timeline and finding details.
6. Mitigation selection and code/rule diff.
7. Verification summary and limitations.

## Component contracts
- `SafetyModeBanner`: receives mode; always visible on the main workflow.
- `ScenarioSelector`: receives scenarios and selected ID; emits only known IDs.
- `RunControls`: receives state and valid actions; disables invalid actions for UX, while backend still validates.
- `AgentPathStage`: receives actual stage state and mode; animation is a visual representation only.
- `EventTimeline`: renders events in sequence order; content is text-safe.
- `CodeDiffViewer`: renders diff as escaped text with line numbers; never executes or applies arbitrary code.
- `VerificationSummary`: shows assertion ID, pass/fail, summary, evaluation time, limitations.
- `ErrorState`: shows safe message and available recovery action.

## Data fetching
- Use a single typed API client.
- Handle loading, empty, stale, error, and success states.
- Avoid duplicated sources of truth for run status.
- Refetch the run after a mutation if the mutation response is incomplete.
- Cancel obsolete requests where the chosen data-fetching approach supports it.

## Responsive behavior
- Desktop: agent stage and evidence may be two-column.
- Tablet: stack agent stage above evidence.
- Mobile: one column in workflow order; no horizontal page scroll.
- Code/diff panes may have internal horizontal scrolling with visible affordance.

## Quality gates
- No fake metrics or fake “live” telemetry.
- No dead buttons.
- No state change based only on animation completion.
- Keyboard access for all actions.
- Reduced-motion behavior tested.
