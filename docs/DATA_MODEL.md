# AegisLoop Data Model

## Entities

### Scenario (versioned fixture; source-controlled)
- `id`: stable allowlisted ID.
- `version`: fixture version.
- `name`, `category`, `severity`, `summary`.
- `mode_support`: supported execution modes.
- `finding_template`: synthetic finding/evidence template.
- `allowed_mitigations`: list of mitigation IDs.
- `assertion_id`: predefined verification assertion.
- `educational_notes`: explanation and scope limitations.

### Run (persisted)
- `id`: UUID or similarly collision-resistant opaque ID.
- `scenario_id`: foreign key/logical reference to Scenario.
- `scenario_version`: fixture version used for the run.
- `mode`: `simulation` or `local_lab`.
- `status`: enumerated state from architecture state machine.
- `created_at`, `updated_at`: UTC timestamps.
- `applied_mitigation_id`: nullable until applied.
- `verification_passed`: nullable until retested.
- `verification_summary`: nullable text.
- `reset_of_run_id`: optional reference if reset creates a new run.

### RunEvent (persisted append-only log)
- `id`: unique event ID.
- `run_id`: owning run.
- `sequence`: monotonic integer per run.
- `event_type`: allowlisted event type.
- `stage`: workflow stage.
- `occurred_at`: UTC timestamp.
- `title`, `message`: concise human-readable description.
- `evidence_json`: structured synthetic evidence; validate before serialization.

### Mitigation (source-controlled allowlist)
- `id`, `label`, `description`.
- `supported_scenario_ids`.
- `diff_template` or `rule_summary`.
- `expected_assertion_id`.
- `limitations`.

### VerificationResult
May be stored as Run fields for MVP or as a separate table if history is needed:
- `run_id`
- `assertion_id`
- `passed`
- `summary`
- `evaluated_at`
- `limitations`
- `details` containing only safe, synthetic details.

## Constraints
- Foreign keys enabled in SQLite.
- One event sequence per run, unique on `(run_id, sequence)`.
- Status values are enums, not arbitrary strings.
- Never persist raw credentials, real personal data, arbitrary targets, or command output from a host system.
- Use transactions for state mutation plus event insertion.
- Keep schema creation/migrations repeatable. Do not rely on manually editing a database file.
