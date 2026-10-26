# AegisLoop Release Checklist

## Functionality
- [ ] Scenario catalogue loads from API.
- [ ] Run creation rejects unknown scenario IDs.
- [ ] Event timeline order is stable.
- [ ] Mitigation allowlist is enforced server-side.
- [ ] Retest-before-mitigation is rejected.
- [ ] Verification result includes assertion ID and limitations.
- [ ] Reset behavior matches documented semantics.
- [ ] No dead buttons or fake metrics.

## Security
- [ ] No arbitrary target URL/host/command fields.
- [ ] No secrets committed.
- [ ] CORS is restricted to expected local origin.
- [ ] Errors do not expose stack traces.
- [ ] Evidence is rendered as text, not HTML.
- [ ] Optional lab ports bind to loopback only.
- [ ] No privileged container or Docker socket mount.
- [ ] No public scanning capability.
- [ ] Lab disabled by default.

## UI and accessibility
- [ ] Mode label is visible.
- [ ] Empty/loading/error/success states implemented.
- [ ] Reduced-motion mode tested.
- [ ] Keyboard focus visible.
- [ ] Responsive widths checked.
- [ ] No page-level horizontal overflow.
- [ ] Pass/fail is not color-only.

## Quality
- [ ] Backend tests pass.
- [ ] Frontend lint/typecheck/build pass.
- [ ] Integration smoke test passes.
- [ ] README startup commands tested on a clean checkout.
- [ ] Demo script rehearsed.
- [ ] Claims match actual implementation.
