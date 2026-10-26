# Prompt 09 — Backend Test Completion

Inspect the implemented AegisLoop backend and `docs/TEST_PLAN.md`. Add meaningful tests for domain logic, state transitions, API validation, persistence, and error responses.

Requirements:
- Use a temporary test database.
- Test positive and negative cases.
- Test retest-before-mitigation, unknown IDs, invalid mitigation/scenario combinations, and unsupported modes.
- Assert the named assertion and its limitations are returned.
- Ensure no test performs external network scanning or shell execution.
- Do not make tests pass by weakening validation or deleting meaningful assertions.
- Run the tests and report exact commands and results. Clearly distinguish tests actually run from tests not run.

Before changing execution or trust boundaries, read `docs/THREAT_MODEL.md` and `docs/SECURITY_BOUNDARIES.md`. Do not broaden the project beyond the documented simulation-first and isolated-lab scope.
