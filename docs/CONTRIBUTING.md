# Contributing to AegisLoop

## Change workflow
1. Read `AGENTS.md`, `SECURITY_BOUNDARIES.md`, `ARCHITECTURE.md`, and the relevant feature spec.
2. Identify the API and data model impact before editing.
3. Make a small, reviewable change.
4. Add or update tests.
5. Update docs and contract examples when behavior changes.
6. Run formatting, linting, tests, and production build.
7. Review the diff for accidental secrets, broad permissions, and unimplemented claims.

## Definition of done
A feature is not complete until its positive and negative behavior is tested, its UI states are covered, and documentation matches actual behavior.

## Dependency policy
Prefer existing dependencies. Explain why a new dependency is needed and check compatibility before adding it.
