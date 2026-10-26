# AegisLoop Scenario Catalogue

Implement one scenario completely before adding more. All scenarios use synthetic fixtures and allowlisted mitigation/assertion IDs.

## Scenario A: Unsafe Query Construction
- ID: `sqli_demo_v1`
- Category: injection
- Teaching objective: demonstrate why query string concatenation is unsafe and why parameterized queries separate code from data.
- Evidence: synthetic code snippet and synthetic request sample.
- Mitigation: `parameterized_query`.
- Assertion: `sqli_input_is_parameterized`.
- Retest claim: the fixture's named assertion passes after the approved mitigation is applied.

## Scenario B: Broken Object-Level Authorization (educational simulation)
- ID: `bola_demo_v1`
- Category: access_control
- Teaching objective: demonstrate server-side ownership checks.
- Evidence: synthetic user A attempts to access synthetic user B's record in a local fixture.
- Mitigation: `enforce_record_ownership`.
- Assertion: `record_owner_check_enforced`.
- Retest claim: the fixture's named authorization assertion passes after mitigation.

## Scenario constraints
- No real users or real records.
- No live target URLs.
- No payloads designed to attack arbitrary systems.
- Each scenario must define preconditions, expected evidence, allowed mitigation, assertion, negative tests, and limitations before it is added to the UI.
