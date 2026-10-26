# AegisLoop Test Plan

## Test layers
1. **Unit tests:** state transition rules, scenario fixture validation, mitigation eligibility, assertion evaluation.
2. **API tests:** status codes, response schemas, invalid IDs, invalid transitions, structured errors.
3. **Persistence tests:** run/event transaction behavior, ordering, reset semantics, database initialization.
4. **Frontend tests:** component states, API error states, keyboard controls, reduced-motion fallback.
5. **Integration smoke test:** create run → apply mitigation → retest → read result.
6. **Lab isolation checks:** only if local Docker lab is implemented.

## Required positive tests
- Valid scenario creates a run.
- Evidence events appear in stable sequence order.
- Valid mitigation changes the run state.
- Valid retest produces the expected named assertion result.
- Reset returns the user to a documented clean workflow.

## Required negative tests
- Unknown scenario returns 404 or documented validation error.
- Unknown run returns 404.
- Unknown mitigation is rejected.
- Mitigation incompatible with scenario is rejected.
- Retest before mitigation is rejected.
- Invalid mode is rejected.
- Arbitrary URL/host/command fields are rejected or ignored only according to strict schema policy; prefer forbidding extra fields.
- Repeated calls do not create inconsistent state.
- Local-lab request while disabled returns a safe error.

## Determinism
Tests must not rely on network access, wall-clock timing, or real vulnerable services for simulation mode. Use a temporary database. Assert semantics, not exact generated UUID values.

## Quality gates
- Backend tests pass (`pytest -W error`).
- Frontend lint, typecheck, and production build pass.
- API contract examples match implementation.
- Manual responsive and accessibility checks completed.

## Manual Browser Smoke-Test Protocol

Execute against a real running backend (`uvicorn app.main:app --port 8000`) and Vite dev server (`npm run dev` at `http://localhost:5173`):

1. **Service startup & health verification:**
   - Launch backend: `uvicorn app.main:app --port 8000`
   - Launch frontend: `npm run dev`
   - Open browser at `http://localhost:5173`. Confirm the health indicator in the top bar displays connected status and simulation mode.
2. **Scenario discovery:**
   - View scenario selection cards. Verify `sqli_demo_v1` and `bola_demo_v1` render with accurate severity badges and expected assertions.
3. **Execute purple-team simulation:**
   - Click "Launch Simulation" on `sqli_demo_v1`.
   - Verify transition through arena stages to `evidence_ready`.
   - Confirm timeline displays ordered event sequence and finding details with synthetic evidence.
4. **Apply mitigation:**
   - Select approved mitigation `parameterized_query`.
   - Click "Apply Mitigation". Confirm code diff view displays before/after comparison with green/red syntax highlighting.
   - Confirm status advances to `mitigation_applied`.
5. **Retest assertion:**
   - Click "Retest Assertion" for `sqli_input_is_parameterized`.
   - Confirm retest evaluation passes, status advances to `verified`, and verification summary displays educational limitations.
6. **Verify run history drawer:**
   - Open the Run History drawer from the top bar.
   - Confirm the verified run appears at the top of the list with a green verified badge and summary metadata.
7. **Reset run lifecycle:**
   - Click "Reset Run" in the top bar.
   - Confirm original run is marked as `reset` in history, and an active child run in `evidence_ready` is initialized.
8. **Repeat for BOLA scenario:**
   - Launch `bola_demo_v1`, apply `enforce_record_ownership`, retest `record_owner_check_enforced`, and verify run drawer reflection.

