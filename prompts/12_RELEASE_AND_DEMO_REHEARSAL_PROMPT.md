# Prompt 12 — Release and Demo Rehearsal

Prepare AegisLoop for a college demonstration using `RELEASE_CHECKLIST.md` and `DEMO_SCRIPT.md`.

1. Run the available automated checks.
2. Verify setup instructions on a clean checkout if possible.
3. Confirm the main workflow works end-to-end.
4. Confirm the interface always identifies simulation vs local lab.
5. Confirm the retest result states the exact assertion and limitations.
6. Inspect responsive and reduced-motion behavior.
7. Review docs for claims not supported by implementation.
8. Produce a concise release report with PASS / FAIL / NOT RUN and evidence for each item.

Never mark a check PASS unless it was actually executed and observed. Do not hide failures; list the smallest next actions.

Before changing execution or trust boundaries, read `docs/THREAT_MODEL.md` and `docs/SECURITY_BOUNDARIES.md`. Do not broaden the project beyond the documented simulation-first and isolated-lab scope.
