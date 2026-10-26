# Frontend Routes and UI States

## Routes
For MVP, a single route is sufficient:
- `/`: workflow dashboard.

Optional later routes only if implemented:
- `/runs/:runId`: run detail/history.
- `/about`: scope, methodology, and limitations.

Do not create navigation items for unimplemented pages.

## Required page states
- Initial loading: shell visible, clear progress indicator.
- API unavailable: mode remains clearly labelled; explain how to start the backend.
- No run: explain how to choose a scenario and start.
- Run in progress: active stage, stop/reset behavior documented.
- Evidence ready: evidence panel and allowed mitigation options visible.
- Mitigation applied: diff and retest action visible.
- Retest in progress: result panel shows pending status.
- Verified: assertion passed and scope limitation visible.
- Verification failed: assertion failed, evidence/reason visible, safe retry path shown if supported.
- Invalid run: recover to dashboard without crashing.
- Local lab unavailable: explicit error; never silently fall back to simulation while lab mode is selected.

## URL/state rule
The URL may identify a run but must not be treated as authorization. Backend validation applies on every request.
