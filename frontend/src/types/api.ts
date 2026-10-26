/**
 * AegisLoop API TypeScript Type Definitions.
 * Strict mirror of backend schemas and docs/API_CONTRACT.md.
 */

export type ExecutionMode = 'simulation' | 'local_lab';

export type RunStatus =
  | 'created'
  | 'testing'
  | 'evidence_ready'
  | 'mitigation_applied'
  | 'retesting'
  | 'verified'
  | 'verification_failed'
  | 'reset';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type WorkflowStage = 'red_agent' | 'arena' | 'blue_agent';

export type EventType =
  | 'scenario_started'
  | 'payload_sent'
  | 'response_received'
  | 'finding_detected'
  | 'mitigation_applied'
  | 'retest_initiated'
  | 'assertion_evaluated'
  | 'run_reset';

export interface HealthResponse {
  status: string;
  mode: ExecutionMode;
  version: string;
}

export interface ScenarioItem {
  id: string;
  name: string;
  category: string;
  severity: Severity;
  summary: string;
  mode_support: ExecutionMode[];
  expected_assertion_id?: string | null;
}

export interface ScenarioListResponse {
  items: ScenarioItem[];
}

export interface RunSummaryItem {
  id: string;
  scenario_id: string;
  mode: ExecutionMode;
  status: RunStatus;
  created_at: string;
  updated_at: string;
  applied_mitigation_id?: string | null;
  verification_passed?: boolean | null;
  reset_of_run_id?: string | null;
  event_count: number;
}

export interface RunListResponse {
  items: RunSummaryItem[];
}

export interface ClearHistoryResponse {
  cleared_count: number;
  message: string;
}

export interface FindingEvidenceItem {
  type: string;
  label: string;
  content: string;
  details?: Record<string, any> | null;
}

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  summary: string;
  evidence: FindingEvidenceItem[];
}

export interface RunEvent {
  id: string;
  run_id: string;
  sequence: number;
  event_type: EventType | string;
  stage: WorkflowStage | string;
  occurred_at: string;
  title: string;
  message: string;
  evidence_json?: Record<string, any> | null;
}

export interface MitigationItem {
  id: string;
  label: string;
  description: string;
}

export interface MitigationDetail {
  id: string;
  label: string;
  rule_summary: string;
  unified_diff: string;
  file_path: string;
}

export interface ApplyMitigationRequest {
  mitigation_id: string;
}

export interface MitigationResponse {
  run_id: string;
  status: RunStatus;
  mitigation: MitigationDetail;
}

export interface RetestRequest {
  assertion_id: string;
}

export interface VerificationResult {
  assertion_id: string;
  passed: boolean;
  summary: string;
  evaluated_at: string;
  limitations: string;
  details?: Record<string, any> | null;
}

export interface VerificationSummary {
  assertion_id: string;
  passed: boolean;
  summary: string;
  limitations: string;
}

export interface RetestResponse {
  status: RunStatus;
  verification: VerificationSummary;
}

export interface CreateRunRequest {
  scenario_id: string;
  mode?: ExecutionMode;
}

export interface RunResponse {
  id: string;
  scenario_id: string;
  mode: ExecutionMode;
  status: RunStatus;
  events: RunEvent[];
  finding: Finding;
  available_mitigations: MitigationItem[];
  applied_mitigation: MitigationDetail | null;
  verification: VerificationResult | null;
  expected_assertion_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  reset_of_run_id?: string | null;
}

export interface ApiErrorDetail {
  loc?: string[];
  msg?: string;
  type?: string;
  [key: string]: any;
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: any;
    request_id?: string;
  };
}
