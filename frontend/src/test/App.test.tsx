import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from '../App';
import { apiClient } from '../lib/api-client';
import { RunResponse, ScenarioListResponse, HealthResponse, MitigationResponse, RetestResponse } from '../types/api';

describe('AegisLoop App End-to-End Workflow', () => {
  let queryClient: QueryClient;

  const mockHealth: HealthResponse = {
    status: 'ok',
    mode: 'simulation',
    version: '0.1.0',
  };

  const mockScenarios: ScenarioListResponse = {
    items: [
      {
        id: 'sqli_demo_v1',
        name: 'Unsafe Query Construction',
        category: 'injection',
        severity: 'high',
        summary: 'Demonstrates SQL injection vulnerability.',
        mode_support: ['simulation'],
        expected_assertion_id: 'sqli_input_is_parameterized',
      },
      {
        id: 'bola_demo_v1',
        name: 'Broken Object-Level Authorization',
        category: 'authorization',
        severity: 'high',
        summary: 'Demonstrates object-level authorization bypass.',
        mode_support: ['simulation'],
        expected_assertion_id: 'record_owner_check_enforced',
      },
    ],
  };

  const mockCreatedRun: RunResponse = {
    id: 'run_sqli_test_100',
    scenario_id: 'sqli_demo_v1',
    mode: 'simulation',
    status: 'evidence_ready',
    events: [
      {
        id: 'evt_01',
        sequence: 1,
        run_id: 'run_sqli_test_100',
        stage: 'red_agent',
        event_type: 'probe_dispatched',
        title: 'Dispatched Probe Payload',
        message: "Sent probe payload admin' OR '1'='1' to toy target endpoint.",
        evidence_json: { payload: "admin' OR '1'='1'" },
        occurred_at: '2026-10-25T10:00:00Z',
      },
      {
        id: 'evt_02',
        sequence: 2,
        run_id: 'run_sqli_test_100',
        stage: 'arena',
        event_type: 'target_responded',
        title: 'Toy Target Evaluated Vulnerability',
        message: 'Endpoint returned database dump due to unsafe query string concatenation.',
        evidence_json: { records_leaked: 5 },
        occurred_at: '2026-10-25T10:00:01Z',
      },
    ],
    finding: {
      id: 'finding_sqli_v1',
      title: 'Unsafe SQL Query String Concatenation',
      severity: 'high',
      summary: 'Raw string formatting constructs SQL statement without parameterization.',
      evidence: [
        {
          type: 'source_snippet',
          label: 'Vulnerable Query Concatenation',
          content: 'query = f"SELECT * FROM users WHERE username = \'{user_input}\'"',
          details: { line: 24, file: 'toy_backend.py' },
        },
      ],
    },
    available_mitigations: [
      {
        id: 'mit_sql_param_v1',
        label: 'Parameterized Query Construction',
        description: 'Bind query parameters safely using prepared statements.',
      },
    ],
    applied_mitigation: null,
    verification: null,
    expected_assertion_id: 'sqli_input_is_parameterized',
    created_at: '2026-10-25T10:00:00Z',
    updated_at: '2026-10-25T10:00:01Z',
  };

  const mockMitigatedRun: RunResponse = {
    ...mockCreatedRun,
    status: 'mitigation_applied',
    applied_mitigation: {
      id: 'mit_sql_param_v1',
      label: 'Parameterized Query Construction',
      rule_summary: 'Uses parameterized query to prevent SQL payload execution.',
      unified_diff: '--- toy_backend.py\n+++ toy_backend.py\n@@ -24,1 +24,1 @@\n-query = f"SELECT * FROM users WHERE username = \'{user_input}\'"\n+query = "SELECT * FROM users WHERE username = :user"',
      file_path: 'toy_backend.py',
    },
  };

  const mockVerifiedRun: RunResponse = {
    ...mockMitigatedRun,
    status: 'verified',
    verification: {
      assertion_id: 'sqli_input_is_parameterized',
      passed: true,
      summary: 'Verified that raw input injection is safely escaped via bind parameters.',
      evaluated_at: '2026-10-25T10:00:05Z',
      limitations: 'Proves only named assertion sqli_input_is_parameterized in simulation fixture.',
    },
  };

  beforeEach(() => {
    localStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.spyOn(apiClient, 'getHealth').mockResolvedValue(mockHealth);
    vi.spyOn(apiClient, 'getScenarios').mockResolvedValue(mockScenarios);
    vi.spyOn(apiClient, 'listRuns').mockResolvedValue({ items: [] });
    vi.spyOn(apiClient, 'createRun').mockResolvedValue(mockCreatedRun);
    vi.spyOn(apiClient, 'getRun').mockResolvedValue(mockCreatedRun);
  });

  const renderApp = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

  it('renders initial dashboard with health status, safety disclaimer, metrics, and scenarios', async () => {
    renderApp();

    expect(screen.getByText('AegisLoop')).toBeInTheDocument();
    expect(screen.getByText('SIMULATION')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: /Purple-Team Security Workflow/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Simulation Mode:/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Unsafe Query Construction')).toBeInTheDocument();
      expect(screen.getByText('Broken Object-Level Authorization')).toBeInTheDocument();
    });

    expect(screen.getByText('No Active Purple-Team Run')).toBeInTheDocument();
  });

  it('executes full journey: launch simulation -> view evidence -> apply mitigation -> retest', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Unsafe Query Construction')).toBeInTheDocument();
    });

    // 1. Select SQLi Scenario to Create Run
    const launchButtons = screen.getAllByRole('button', { name: /run simulation/i });
    fireEvent.click(launchButtons[0]);

    // 2. Active Run loaded, shows lifecycle status and findings
    await waitFor(() => {
      expect(screen.getAllByText('run_sqli_test_100').length).toBeGreaterThan(0);
      expect(screen.getByText('Unsafe SQL Query String Concatenation')).toBeInTheDocument();
      expect(screen.getByText(/Vulnerable Query Concatenation/i)).toBeInTheDocument();
      expect(screen.getByText('Dispatched Probe Payload')).toBeInTheDocument();
    });

    // 3. Mock Mitigation response and apply mitigation
    const mockMitigationRes: MitigationResponse = {
      run_id: 'run_sqli_test_100',
      status: 'mitigation_applied',
      mitigation: mockMitigatedRun.applied_mitigation!,
    };
    vi.spyOn(apiClient, 'applyMitigation').mockResolvedValue(mockMitigationRes);
    vi.spyOn(apiClient, 'getRun').mockResolvedValue(mockMitigatedRun);

    const applyButtons = screen.getAllByRole('button', { name: /apply mitigation/i });
    fireEvent.click(applyButtons[0]);

    // 4. Mitigation diff rendered
    await waitFor(() => {
      expect(screen.getByText(/Active Mitigation: Parameterized Query Construction/i)).toBeInTheDocument();
      expect(screen.getByText('Unified Diff')).toBeInTheDocument();
    });

    // 5. Mock Retest response and retest
    const mockRetestRes: RetestResponse = {
      status: 'verified',
      verification: mockVerifiedRun.verification!,
    };
    vi.spyOn(apiClient, 'retestRun').mockResolvedValue(mockRetestRes);
    vi.spyOn(apiClient, 'getRun').mockResolvedValue(mockVerifiedRun);

    const retestButtons = screen.getAllByRole('button', { name: /retest named assertion/i });
    fireEvent.click(retestButtons[0]);

    // 6. Verification result rendered with assertion outcome and limitations
    await waitFor(() => {
      expect(screen.getByText('Assertion Passed')).toBeInTheDocument();
      expect(screen.getByText(/Proves only named assertion sqli_input_is_parameterized in simulation fixture/i)).toBeInTheDocument();
    });
  });

  it('opens and closes run history drawer with persisted runs', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Unsafe Query Construction')).toBeInTheDocument();
    });

    // Mock listRuns returning the newly persisted run upon query invalidation
    vi.spyOn(apiClient, 'listRuns').mockResolvedValue({
      items: [
        {
          id: 'run_sqli_test_100',
          scenario_id: 'sqli_demo_v1',
          mode: 'simulation',
          status: 'evidence_ready',
          created_at: '2026-10-25T10:00:00Z',
          updated_at: '2026-10-25T10:00:01Z',
          applied_mitigation_id: null,
          verification_passed: null,
          reset_of_run_id: null,
          event_count: 2,
        },
      ],
    });

    // Create a run so it is added to history
    const launchButtons = screen.getAllByRole('button', { name: /run simulation/i });
    fireEvent.click(launchButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByText('run_sqli_test_100').length).toBeGreaterThan(0);
    });

    const historyBtn = screen.getByRole('button', { name: /view run history/i });
    fireEvent.click(historyBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /persisted run history/i })).toBeInTheDocument();
      expect(screen.getByText('Persisted Run History')).toBeInTheDocument();
      expect(screen.getByText('2 events logged')).toBeInTheDocument();
    });

    const closeBtn = screen.getByRole('button', { name: /close run history/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /persisted run history/i })).not.toBeInTheDocument();
    });
  });

  it('runs strictly in dark mode without any theme toggle control', async () => {
    // Attempt to set a legacy light theme preference in storage
    localStorage.setItem('aegisloop_theme', 'light');

    renderApp();

    // Verify there is no theme toggle or switch button anywhere in the interface
    expect(screen.queryByRole('button', { name: /theme/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /light mode/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /dark mode/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/toggle theme/i)).not.toBeInTheDocument();

    // Verify root document continues to have dark mode active
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('clears all run history via confirmation dialog and resets workspace to clean empty state', async () => {
    // 1. Initial state with 1 persisted run
    vi.spyOn(apiClient, 'listRuns').mockResolvedValue({
      items: [
        {
          id: 'run_sqli_test_100',
          scenario_id: 'sqli_demo_v1',
          mode: 'simulation',
          status: 'evidence_ready',
          created_at: '2026-10-25T10:00:00Z',
          updated_at: '2026-10-25T10:00:01Z',
          applied_mitigation_id: null,
          verification_passed: null,
          reset_of_run_id: null,
          event_count: 2,
        },
      ],
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getAllByText('run_sqli_test_100').length).toBeGreaterThan(0);
      expect(screen.getByText('1 Runs Recorded')).toBeInTheDocument();
    });

    // 2. Click Clear History button in table header
    const clearHistoryButtons = screen.getAllByRole('button', { name: /clear all run history/i });
    fireEvent.click(clearHistoryButtons[0]);

    // 3. Confirm dialog opens with mandatory warning text
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /clear all run history/i })).toBeInTheDocument();
      expect(
        screen.getByText('Clear all run history? This action cannot be undone.')
      ).toBeInTheDocument();
    });

    // 4. Test accidental deletion prevention: click Cancel
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(
        screen.queryByText('Clear all run history? This action cannot be undone.')
      ).not.toBeInTheDocument();
      // Runs are preserved
      expect(screen.getAllByText('run_sqli_test_100').length).toBeGreaterThan(0);
    });

    // 5. Click Clear History again and confirm
    fireEvent.click(screen.getAllByRole('button', { name: /clear all run history/i })[0]);

    await waitFor(() => {
      expect(
        screen.getByText('Clear all run history? This action cannot be undone.')
      ).toBeInTheDocument();
    });

    const clearSpy = vi.spyOn(apiClient, 'clearHistory').mockResolvedValue({
      cleared_count: 1,
      message: 'Successfully cleared 1 run history record(s).',
    });

    // Mock next listRuns returning empty list
    vi.spyOn(apiClient, 'listRuns').mockResolvedValue({ items: [] });

    const confirmClearBtn = screen.getByRole('button', { name: /confirm clear/i });
    fireEvent.click(confirmClearBtn);

    // 6. Verify clearHistory API call, modal close, and clean empty state
    await waitFor(() => {
      expect(clearSpy).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByText('Clear all run history? This action cannot be undone.')
      ).not.toBeInTheDocument();
      expect(screen.getByText(/No persisted runs in database/i)).toBeInTheDocument();
      expect(screen.getByText('No Active Purple-Team Run')).toBeInTheDocument();
    });
  });

  it('displays error in confirmation modal if clearing run history fails', async () => {
    vi.spyOn(apiClient, 'listRuns').mockResolvedValue({
      items: [
        {
          id: 'run_sqli_test_100',
          scenario_id: 'sqli_demo_v1',
          mode: 'simulation',
          status: 'evidence_ready',
          created_at: '2026-10-25T10:00:00Z',
          updated_at: '2026-10-25T10:00:01Z',
          applied_mitigation_id: null,
          verification_passed: null,
          reset_of_run_id: null,
          event_count: 2,
        },
      ],
    });

    vi.spyOn(apiClient, 'clearHistory').mockRejectedValue(
      new Error('SQLite lock conflict error')
    );

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('1 Runs Recorded')).toBeInTheDocument();
    });

    // Open clear dialog
    const clearBtn = screen.getAllByRole('button', { name: /clear all run history/i })[0];
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Clear all run history? This action cannot be undone.')
      ).toBeInTheDocument();
    });

    // Confirm deletion
    const confirmClearBtn = screen.getByRole('button', { name: /confirm clear/i });
    fireEvent.click(confirmClearBtn);

    // Error is displayed inside modal
    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(within(modal).getByText(/SQLite lock conflict error/i)).toBeInTheDocument();
      expect(
        within(modal).getByText('Clear all run history? This action cannot be undone.')
      ).toBeInTheDocument();
    });
  });
});
