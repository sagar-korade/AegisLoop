# Environment and Configuration

## General rules
- Simulation mode must work without secrets.
- Use typed configuration and validate values at startup.
- Never commit `.env`, credentials, local database files, or generated evidence dumps.
- Include `.env.example` with safe, non-secret defaults only.
- Do not support arbitrary target URLs or shell commands as configuration options.

## Suggested settings
Backend:
- `AEGISLOOP_MODE=simulation`
- `AEGISLOOP_DATABASE_URL=sqlite:///./aegisloop.db`
- `AEGISLOOP_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`
- `AEGISLOOP_LOG_LEVEL=INFO`
- `AEGISLOOP_ENABLE_LOCAL_LAB=false`

Frontend:
- `VITE_API_BASE_URL=""` (leave empty for default Vite dev server proxy to `http://127.0.0.1:8000`; or specify backend origin e.g. `http://127.0.0.1:8000` without trailing `/api/v1`)

## Startup validation
- Reject unknown mode values.
- If local lab is disabled, reject local-lab execution requests.
- Do not print environment variable values in logs.
- Validate CORS origins against a finite configured list.
- Fail startup with a clear message if required database configuration is invalid.

## Frontend environment caveat
Vite variables prefixed with `VITE_` are exposed to the browser. Never place secrets in them.
