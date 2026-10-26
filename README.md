# AegisLoop

AegisLoop is a simulation-first purple-team security-learning prototype. It demonstrates a traceable, deterministic workflow: select a predefined scenario, inspect synthetic evidence, apply an approved mitigation, and retest one named assertion.

It is an educational prototype for local use—not a production scanner, an autonomous agent, or a general-purpose exploitation framework.

## What is implemented

- Two allowlisted simulation scenarios: unsafe dynamic SQL query construction and broken object-level authorization (BOLA).
- Deterministic, fixture-driven event generation with structured evidence and ordered timelines.
- A backend-owned workflow state machine: `created → testing → evidence_ready → mitigation_applied → retesting → verified | verification_failed`.
- Scenario-specific, allowlisted mitigations with an educational unified diff and explanation.
- Scenario-specific, allowlisted verification assertions.
- Local SQLite persistence for runs, events, applied mitigations, and verification results.
- A React dashboard for scenario selection, workflow status, evidence, mitigation review, retest results, and run history.
- Typed FastAPI responses, request IDs, structured error responses, and restricted CORS configuration.

The currently implemented scenarios and their approved controls are:

| Scenario | Approved mitigation | Retest assertion |
| --- | --- | --- |
| `sqli_demo_v1` — Unsafe Query Construction | `parameterized_query` | `sqli_input_is_parameterized` |
| `bola_demo_v1` — Broken Object-Level Authorization | `enforce_record_ownership` | `record_owner_check_enforced` |

## Safety model

Simulation mode is the supported default. The simulation adapter uses local, deterministic fixtures and does not need an external target.

The repository does **not** include an implemented Docker Compose lab or a real-target scanning mode. Although configuration reserves `local_lab` for a future isolated lab, it remains disabled by default and the included scenarios support simulation mode only. Keep `AEGISLOOP_MODE=simulation` and `AEGISLOOP_ENABLE_LOCAL_LAB=false` unless a separately implemented and verified isolated lab is added.

Inputs are deliberately narrow: scenario IDs, mitigation IDs, and assertion IDs are validated against backend allowlists. The prototype does not accept arbitrary hosts, URLs, ports, shell commands, file paths, or container names.

## Architecture

```text
React + Vite dashboard
        │ typed HTTP requests
        ▼
FastAPI API  ──► workflow services and state machine
        │                    │
        │                    ├── deterministic simulation fixtures
        │                    └── SQLite run/event persistence
        ▼
structured evidence, approved mitigation, named retest result
```

The FastAPI backend is authoritative for lifecycle state, mitigation eligibility, and verification outcomes. Frontend animations visualize backend results; they do not alter application state.

## Technology stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, and Motion.
- **Backend:** Python 3.14+, FastAPI, Pydantic Settings, SQLAlchemy, Uvicorn, and SQLite.
- **Testing:** pytest and pytest-asyncio for the backend; Vitest and Testing Library for the frontend.

## Windows setup

### Prerequisites

- Windows, because the included launcher is `start.bat`.
- Python 3.14 or later. The checked-in development requirements were generated with Python 3.14.8.
- Node.js and npm. The launcher checks that `npm` is available and advises Node.js 18 or later; use a Node release supported by the installed Vite version.
- Docker Desktop is **not** required for the current simulation-first prototype.

The launcher starts existing dependencies; it does not create a Python environment or install packages. Before the first launch, follow the bootstrap steps printed by `start.bat` when prerequisites are missing:

```bat
cd backend
python -m venv .venv
call .venv\Scripts\activate.bat
pip install -r requirements.txt

cd ..\frontend
npm install
```

### Configure local environment files

Create `backend/.env` from [`backend/.env.example`](backend/.env.example). Simulation mode requires no secrets. Its safe defaults are:

```dotenv
AEGISLOOP_MODE=simulation
AEGISLOOP_DATABASE_URL=sqlite:///./aegisloop.db
AEGISLOOP_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
AEGISLOOP_LOG_LEVEL=INFO
AEGISLOOP_ENABLE_LOCAL_LAB=false
AEGISLOOP_VERSION=0.1.0
```

Optionally create `frontend/.env` from [`frontend/.env.example`](frontend/.env.example). Leave `VITE_API_BASE_URL` empty when using Vite's default local proxy; if connecting directly to a backend, set it to the backend origin only—without `/api/v1`.

`VITE_*` variables are visible to browser code. Do not place secrets in `frontend/.env`. Do not commit either `.env` file or the generated SQLite database.

### Launch with `start.bat`

From the repository root, run:

```bat
start.bat
```

The launcher verifies `backend/.venv` and `frontend/node_modules`, checks for existing listeners, then starts the services in separate terminal windows:

- Backend: `http://127.0.0.1:8001`
- Frontend: `http://localhost:5173`
- Interactive API documentation: `http://127.0.0.1:8001/docs`

For this launcher path, the frontend is started with `VITE_API_BASE_URL=http://127.0.0.1:8001`, matching its backend port. When Vite is launched separately with no API base URL, [`frontend/vite.config.ts`](frontend/vite.config.ts) proxies `/api` and `/health` to port `8000`; configure the frontend explicitly if your manually launched backend uses another port.

The launcher also documents `--help`, `--no-window` (or `--bg`), and `--non-interactive`, plus `BACKEND_HOST`, `BACKEND_PORT`, and `FRONTEND_PORT` environment overrides.

## API

All workflow endpoints are under `/api/v1`; the health check is at `/health`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Return service status, active mode, and version. |
| `GET` | `/api/v1/scenarios` | List enabled, allowlisted scenarios. |
| `GET` | `/api/v1/runs?limit=1..100` | List persisted runs; the default limit is 30. |
| `POST` | `/api/v1/runs` | Create a run for an allowlisted scenario and mode. |
| `GET` | `/api/v1/runs/{run_id}` | Read a persisted run, events, evidence, and any result. |
| `POST` | `/api/v1/runs/{run_id}/mitigations` | Apply an approved mitigation to an eligible run. |
| `POST` | `/api/v1/runs/{run_id}/retest` | Evaluate the scenario's named verification assertion. |
| `POST` | `/api/v1/runs/{run_id}/reset` | Mark a run reset and create an active replacement run. |
| `DELETE` | `/api/v1/runs` | Remove persisted run history and related events. |

Requests and responses are JSON. Failed requests use a structured error envelope with a code, safe message, optional details, and request ID. See [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) for request and response shapes.

## Testing and validation

Backend coverage includes API behavior, CORS and error shapes, full workflow and persistence integration tests, plus unit tests for fixtures, state transitions, mitigation eligibility, assertions, configuration, and the simulation runner. Frontend coverage includes the API client, app workflow, and components.

To install backend test dependencies and run the backend suite:

```bat
cd backend
call .venv\Scripts\activate.bat
pip install -r requirements.txt -r requirements-dev.txt
pytest -W error
```

From `frontend`, the available validation commands are:

```bat
npm run lint
npm run tsc
npm run test
npm run build
```

Verified on 2026-10-26: all 118 backend tests passed; frontend lint and TypeScript checks passed; all 36 frontend tests passed; and the production build completed successfully.

## Project structure

```text
AegisLoop/
├── backend/
│   ├── app/
│   │   ├── adapters/simulation/  # deterministic scenario fixtures and runner
│   │   ├── api/routes/           # health, scenarios, runs, mitigations, retest
│   │   ├── db/                   # SQLite schema, session, repositories
│   │   ├── domain/               # enums, errors, workflow state machine
│   │   ├── schemas/              # request and response models
│   │   └── services/             # run, evidence, mitigation, verification logic
│   ├── tests/
│   ├── .env.example
│   ├── requirements.txt
│   └── requirements-dev.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/api-client.ts
│   │   ├── test/
│   │   └── types/
│   ├── .env.example
│   └── package.json
├── docs/                         # architecture, API, safety, test, and UX references
├── prompts/                      # implementation and review prompts
├── start.bat                     # Windows launcher
└── .env.example                  # configuration overview
```

## Responsible use

- Use the included scenarios only for education and local demonstration.
- Treat all evidence, payloads, diffs, and assertions as synthetic fixture data.
- A passing retest demonstrates only the named assertion in the selected simulation; it does not prove a system is secure.
- Do not adapt this prototype to probe public systems, real customer data, or targets without explicit authorization.
- If an isolated lab is added later, keep it private, loopback-bound, non-privileged, free of Docker socket mounts, and populated only with synthetic data.

## Further reading

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md)
- [`docs/SECURITY_BOUNDARIES.md`](docs/SECURITY_BOUNDARIES.md)
- [`docs/ENVIRONMENT_AND_CONFIG.md`](docs/ENVIRONMENT_AND_CONFIG.md)
- [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md)
