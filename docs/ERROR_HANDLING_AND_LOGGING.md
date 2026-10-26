# Error Handling and Logging

## API error structure
Use a stable error code, safe message, optional structured details, and request ID. Frontend copy should translate technical errors into a concise next action without hiding the underlying reason.

## Error categories
- `SCENARIO_NOT_FOUND`
- `RUN_NOT_FOUND`
- `INVALID_STATE_TRANSITION`
- `MITIGATION_NOT_ALLOWED`
- `ASSERTION_NOT_ALLOWED`
- `LOCAL_LAB_DISABLED`
- `LOCAL_LAB_UNAVAILABLE`
- `VALIDATION_ERROR`
- `INTERNAL_ERROR`

## Logging
- Use structured logs with timestamp, level, request ID, route, status code, and duration.
- Do not log secrets, cookies, authorization headers, arbitrary request bodies, or environment values.
- Evidence fixture content may be logged only if it is synthetic and bounded.
- Keep debug tracebacks in local development only; never return them to the browser.

## Frontend handling
- Preserve the last known valid run state when a request fails.
- Show a retry action only when retry is safe.
- Do not show a success animation before the API confirms success.
- Announce important state changes with a concise ARIA live message.
