# AegisLoop Demonstration Script

Target length: 4–6 minutes.

## 1. Set expectations (30 seconds)
Explain that the default experience is a deterministic simulation. The agent path visualizes workflow stages; it is not a live packet capture or public target scan.

## 2. Select scenario (30 seconds)
Choose a predefined scenario such as unsafe query construction. Read the scenario summary and severity.

## 3. Run and inspect evidence (60 seconds)
Start the run. Show the event timeline, synthetic evidence, and the explanation of why the pattern is risky.

## 4. Apply mitigation (60 seconds)
Select the allowlisted mitigation. Explain the parameterized-query concept or corresponding rule change. Open the diff and describe the specific changed lines.

## 5. Retest (60 seconds)
Run the retest. Read the exact assertion ID, pass/fail result, summary, and limitation. Emphasize that the result validates only this named assertion in this scenario.

## 6. Explain architecture (60 seconds)
Briefly show React UI, FastAPI API, persistence, deterministic scenario adapter, and tests. If the local lab is not implemented, state that it is planned rather than implying it exists.

## 7. Close (20 seconds)
Summarize the value: traceability from test to evidence to mitigation to verification, with safe and repeatable execution.
