# AegisLoop API Contract

Base path: `/api/v1`. JSON requests and responses. The exact field names below are the contract; update this document and tests together if a deliberate change is made.

## Conventions
- IDs are opaque strings; clients must not parse them.
- Timestamps are ISO 8601 UTC strings.
- Every response uses a documented schema.
- Errors use `application/problem+json`-style structure or the equivalent documented JSON shape.
- Backend state is authoritative.

## `GET /health`
Response:
```json
{"status":"ok","mode":"simulation","version":"0.1.0"}
```

## `GET /scenarios`
Response:
```json
{
  "items": [
    {
      "id": "sqli_demo_v1",
      "name": "Unsafe Query Construction",
      "category": "injection",
      "severity": "high",
      "summary": "A synthetic fixture demonstrates unsafe query construction.",
      "mode_support": ["simulation"]
    }
  ]
}
```
The response must contain only scenarios implemented and enabled by the backend.

## `GET /runs`
Query parameters:
- `limit`: optional integer between 1 and 100 (default 30).
Response:
```json
{
  "items": [
    {
      "id": "run_example",
      "scenario_id": "sqli_demo_v1",
      "mode": "simulation",
      "status": "verified",
      "created_at": "2026-10-26T10:00:00Z",
      "updated_at": "2026-10-26T10:00:05Z",
      "applied_mitigation_id": "parameterized_query",
      "verification_passed": true,
      "reset_of_run_id": null,
      "event_count": 5
    }
  ]
}
```

## `DELETE /runs`
Deletes all persisted simulation run records and associated timeline events/verification results from the database.
Response:
```json
{
  "cleared_count": 3,
  "message": "Successfully cleared 3 run history record(s)."
}
```

## `POST /runs`
Request:
```json
{"scenario_id":"sqli_demo_v1","mode":"simulation"}
```
Response:
```json
{
  "id": "run_example",
  "scenario_id": "sqli_demo_v1",
  "mode": "simulation",
  "status": "evidence_ready",
  "events": [],
  "finding": {
    "id": "finding_example",
    "title": "Unsafe query construction",
    "severity": "high",
    "summary": "Synthetic evidence for the selected scenario.",
    "evidence": []
  },
  "available_mitigations": [
    {"id":"parameterized_query","label":"Use parameterized queries","description":"Replace string concatenation with bound parameters."}
  ]
}
```
This is an illustrative shape; actual IDs and field names must be implemented consistently. Do not return fields that the application does not actually support.

## `GET /runs/{run_id}`
Returns the current persisted run, events, finding, applied mitigation if any, and verification result if one exists.

## `POST /runs/{run_id}/mitigations`
Request:
```json
{"mitigation_id":"parameterized_query"}
```
Response includes updated status `mitigation_applied`, applied mitigation metadata, and an educational diff/rule explanation.

## `POST /runs/{run_id}/retest`
Request:
```json
{"assertion_id":"sqli_input_is_parameterized"}
```
The server must verify that this assertion is allowed for the run's scenario. Do not accept arbitrary code or an arbitrary assertion expression.
Response:
```json
{
  "status": "verified",
  "verification": {
    "assertion_id": "sqli_input_is_parameterized",
    "passed": true,
    "summary": "The named assertion passed for this simulated scenario.",
    "limitations": "This result covers only this assertion and scenario."
  }
}
```

## `POST /runs/{run_id}/reset`
Either creates a new run or resets the selected run according to one documented strategy. Do not mix both semantics. The chosen behavior must be covered by tests.

## Error shape
```json
{
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Retest is available only after a mitigation has been applied.",
    "details": null,
    "request_id": "req_example"
  }
}
```

## Status and error mapping
- 400: request is syntactically valid but semantically invalid.
- 404: run or scenario not found.
- 409: conflicting current state.
- 422: request schema validation failed.
- 500: unexpected internal error; safe message only.
- 503: optional local lab unavailable.

## Contract discipline
Do not silently change request/response shapes. Update Pydantic schemas, frontend TypeScript types, API tests, and this document together.
