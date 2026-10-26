# ADR-0002: FastAPI and SQLite for the MVP

- Status: Accepted
- Date: 2026-10-25

## Context
The prototype needs a small API, typed validation, and persistence without operational overhead.

## Decision
Use FastAPI with Pydantic and SQLite for the first implementation. Use a repository layer or ORM consistently; do not mix raw database access patterns without a clear reason.

## Consequences
- Local setup is straightforward.
- Single-user/demo scale is the target.
- Production multi-user deployment would require a separate review of authentication, database choice, migrations, and operational controls.
