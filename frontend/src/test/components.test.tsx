import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FindingInspector } from '../components/evidence/FindingInspector';
import { MitigationPanel } from '../components/mitigations/MitigationPanel';
import { RetestPanel } from '../components/verification/RetestPanel';
import { ResetModal } from '../components/runs/ResetModal';
import { ClearHistoryModal } from '../components/runs/ClearHistoryModal';
import { RunHistoryDrawer } from '../components/runs/RunHistoryDrawer';
import { RunHistoryTable } from '../components/runs/RunHistoryTable';
import { ScenarioSelector } from '../components/scenarios/ScenarioSelector';
import { SafetyModeBanner } from '../components/common/SafetyModeBanner';
import { NavRail } from '../components/navigation/NavRail';
import { Finding, MitigationDetail, MitigationItem, RunStatus, RunSummaryItem, ScenarioItem, VerificationResult } from '../types/api';

describe('SafetyModeBanner', () => {
  it('renders simulation isolation disclaimer with loopback boundary', () => {
    render(<SafetyModeBanner />);
    expect(screen.getByRole('region', { name: /simulation safety disclaimer/i })).toBeInTheDocument();
    expect(screen.getByText(/Simulation Mode:/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero outbound traffic/i)).toBeInTheDocument();
    expect(screen.getByText(/Boundary: Loopback Isolation/i)).toBeInTheDocument();
  });
});

describe('FindingInspector', () => {
  const mockFinding: Finding = {
    id: 'find_sqli_01',
    title: 'Unsafe Dynamic SQL Query Construction',
    severity: 'high',
    summary: 'The application concatenates unsanitized input into raw SQL queries.',
    evidence: [
      {
        type: 'source_snippet',
        label: 'Vulnerable Query Pattern',
        content: 'SELECT * FROM users WHERE username = \'' + 'admin\' OR \'1\'=\'1\';',
        details: { line: 42, file: 'toy_backend.py' },
      },
    ],
  };

  it('renders finding title, severity, summary, and evidence snippet', () => {
    render(<FindingInspector finding={mockFinding} />);

    expect(screen.getByText('Unsafe Dynamic SQL Query Construction')).toBeInTheDocument();
    expect(screen.getByText(/high severity/i)).toBeInTheDocument();
    expect(screen.getByText(/The application concatenates unsanitized input/i)).toBeInTheDocument();
    expect(screen.getByText('Vulnerable Query Pattern')).toBeInTheDocument();
    expect(screen.getByText(/SELECT \* FROM users/i)).toBeInTheDocument();
    expect(screen.getByText('line:')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});

describe('MitigationPanel', () => {
  const mockMitigations: MitigationItem[] = [
    {
      id: 'mit_sql_param_v1',
      label: 'Parameterized Query Construction',
      description: 'Replace raw string concatenation with parameterized queries.',
    },
  ];

  const mockApplied: MitigationDetail = {
    id: 'mit_sql_param_v1',
    label: 'Parameterized Query Construction',
    rule_summary: 'Parameterizes query input using bind variables (:username).',
    unified_diff: '--- toy_backend.py\n+++ toy_backend.py\n@@ -42,1 +42,1 @@\n-cursor.execute(f"SELECT * FROM users WHERE name = \'{user}\'")\n+cursor.execute("SELECT * FROM users WHERE name = :user", {"user": user})',
    file_path: 'app/toy_backend.py',
  };

  it('renders available mitigations and handles apply click', () => {
    const onApply = vi.fn();
    render(
      <MitigationPanel
        availableMitigations={mockMitigations}
        appliedMitigation={null}
        status={'evidence_ready' as RunStatus}
        onApplyMitigation={onApply}
        isApplying={false}
      />
    );

    expect(screen.getByText('Parameterized Query Construction')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /apply mitigation/i });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onApply).toHaveBeenCalledWith('mit_sql_param_v1');
  });

  it('renders unified diff and explanation when mitigation is applied', () => {
    render(
      <MitigationPanel
        availableMitigations={[]}
        appliedMitigation={mockApplied}
        status={'mitigation_applied' as RunStatus}
        onApplyMitigation={vi.fn()}
        isApplying={false}
      />
    );

    expect(screen.getByText(/Active Mitigation: Parameterized Query Construction/i)).toBeInTheDocument();
    expect(screen.getByText('Unified Diff')).toBeInTheDocument();
    expect(screen.getByText(/Parameterizes query input using bind variables/i)).toBeInTheDocument();
    expect(screen.getByText(/cursor\.execute\("SELECT \* FROM users WHERE name = :user"/i)).toBeInTheDocument();
  });
});

describe('RetestPanel', () => {
  const mockVerification: VerificationResult = {
    assertion_id: 'sqli_input_is_parameterized',
    passed: true,
    summary: 'Parameterized query successfully rejected SQL injection probe.',
    evaluated_at: '2026-10-25T12:00:00Z',
    limitations: 'Proves only that named assertion sqli_input_is_parameterized holds in this fixture.',
  };

  it('disables retest button when status is evidence_ready', () => {
    render(
      <RetestPanel
        status={'evidence_ready' as RunStatus}
        verification={null}
        onRetest={vi.fn()}
        isRetesting={false}
        expectedAssertionId="sqli_input_is_parameterized"
      />
    );

    const button = screen.getByRole('button', { name: /retest named assertion/i });
    expect(button).toBeDisabled();
  });

  it('enables retest button when status is mitigation_applied and invokes handler', () => {
    const onRetest = vi.fn();
    render(
      <RetestPanel
        status={'mitigation_applied' as RunStatus}
        verification={null}
        onRetest={onRetest}
        isRetesting={false}
        expectedAssertionId="sqli_input_is_parameterized"
      />
    );

    const button = screen.getByRole('button', { name: /retest named assertion/i });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onRetest).toHaveBeenCalledTimes(1);
  });

  it('renders passed verification result with summary and limitations disclaimer', () => {
    render(
      <RetestPanel
        status={'verified' as RunStatus}
        verification={mockVerification}
        onRetest={vi.fn()}
        isRetesting={false}
        expectedAssertionId="sqli_input_is_parameterized"
      />
    );

    expect(screen.getByText('Assertion Passed')).toBeInTheDocument();
    expect(screen.getByText('Parameterized query successfully rejected SQL injection probe.')).toBeInTheDocument();
    expect(screen.getByText(/Proves only that named assertion sqli_input_is_parameterized holds/i)).toBeInTheDocument();
  });
});

describe('ResetModal', () => {
  it('renders modal details and calls onConfirm and onClose', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ResetModal
        isOpen={true}
        runId="run_demo_123"
        onClose={onClose}
        onConfirm={onConfirm}
        isResetting={false}
      />
    );

    expect(screen.getByText('Reset Workflow Run?')).toBeInTheDocument();
    expect(screen.getByText('run_demo_123')).toBeInTheDocument();
    expect(screen.getByText(/Original run status becomes/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirm reset/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('RunHistoryDrawer', () => {
  const mockSummaryRuns: RunSummaryItem[] = [
    {
      id: 'run_sqli_001',
      scenario_id: 'sqli_demo_v1',
      mode: 'simulation',
      status: 'verified',
      created_at: '2026-10-25T12:00:00Z',
      updated_at: '2026-10-25T12:01:00Z',
      applied_mitigation_id: 'parameterized_query',
      verification_passed: true,
      reset_of_run_id: null,
      event_count: 6,
    },
  ];

  it('renders summary items with event count and triggers onSelectRun', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <RunHistoryDrawer
        isOpen={true}
        onClose={onClose}
        runs={mockSummaryRuns}
        activeRunId="run_other"
        onSelectRun={onSelect}
        isLoading={false}
      />
    );

    expect(screen.getByText('Persisted Run History')).toBeInTheDocument();
    expect(screen.getByText('run_sqli_001')).toBeInTheDocument();
    expect(screen.getByText('6 events logged')).toBeInTheDocument();

    const loadBtn = screen.getByRole('button', { name: /load run/i });
    fireEvent.click(loadBtn);
    expect(onSelect).toHaveBeenCalledWith('run_sqli_001');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders error state when error is provided', () => {
    render(
      <RunHistoryDrawer
        isOpen={true}
        onClose={vi.fn()}
        runs={[]}
        activeRunId={null}
        onSelectRun={vi.fn()}
        isLoading={false}
        error={new Error('Failed to reach backend database.')}
      />
    );

    expect(screen.getByText('Unable to Load History')).toBeInTheDocument();
    expect(screen.getByText('Failed to reach backend database.')).toBeInTheDocument();
  });

  it('renders empty state when no runs exist', () => {
    render(
      <RunHistoryDrawer
        isOpen={true}
        onClose={vi.fn()}
        runs={[]}
        activeRunId={null}
        onSelectRun={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText('No Persisted Runs Yet')).toBeInTheDocument();
  });
});

describe('ScenarioSelector', () => {
  const mockScenarios: ScenarioItem[] = [
    {
      id: 'sqli_demo_v1',
      name: 'Unsafe Query Construction',
      category: 'injection',
      severity: 'high',
      summary: 'Demonstrates SQL injection vulnerability.',
      mode_support: ['simulation'],
    },
    {
      id: 'bola_demo_v1',
      name: 'Broken Object-Level Authorization',
      category: 'authorization',
      severity: 'high',
      summary: 'Demonstrates object-level authorization bypass.',
      mode_support: ['simulation'],
    },
  ];

  it('renders all allowlisted scenarios and handles selection', () => {
    const onSelect = vi.fn();
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        selectedScenarioId={'sqli_demo_v1'}
        onSelectScenario={onSelect}
        isLoading={false}
        isCreating={false}
      />
    );

    expect(screen.getByText('Unsafe Query Construction')).toBeInTheDocument();
    expect(screen.getByText('Broken Object-Level Authorization')).toBeInTheDocument();

    const bolaButton = screen.getAllByRole('button', { name: /run simulation/i })[0];
    fireEvent.click(bolaButton);
    expect(onSelect).toHaveBeenCalledWith('bola_demo_v1');
  });
});

describe('AegisLoopIntro', () => {
  it('renders AEGISLOOP wordmark and breathing orb without extra buttons or subtitles', async () => {
    const { AegisLoopIntro } = await import('../components/intro/AegisLoopIntro');
    const onComplete = vi.fn();
    const onBeginTransition = vi.fn();

    render(
      <AegisLoopIntro
        onComplete={onComplete}
        onBeginTransition={onBeginTransition}
        skipInTest={false}
      />
    );

    // Verify prominent wordmark is present
    expect(screen.getByRole('heading', { name: /AEGISLOOP/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/AegisLoop Cinematic Introduction/i)).toBeInTheDocument();

    // Verify strictly NO extra buttons or subtitles exist
    expect(screen.queryByRole('button', { name: /Enter Workspace/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Skip Intro/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Purple-Team Security Workflow')).not.toBeInTheDocument();

    // Click anywhere on the intro screen to trigger transition
    const introRegion = screen.getByLabelText(/AegisLoop Cinematic Introduction/i);
    await act(async () => {
      fireEvent.click(introRegion);
    });

    expect(onBeginTransition).toHaveBeenCalled();

    await act(async () => {
      await vi.waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      }, { timeout: 1500 });
    });
  });

  it('triggers traveling and completion via Escape key', async () => {
    const { AegisLoopIntro } = await import('../components/intro/AegisLoopIntro');
    const onComplete = vi.fn();
    const onBeginTransition = vi.fn();

    render(
      <AegisLoopIntro
        onComplete={onComplete}
        onBeginTransition={onBeginTransition}
        skipInTest={false}
      />
    );

    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    expect(onBeginTransition).toHaveBeenCalled();

    await act(async () => {
      await vi.waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      }, { timeout: 1500 });
    });
  });

});


describe('InteractiveBackground', () => {
  it('renders canvas element and decorative layers without throwing', async () => {
    const { InteractiveBackground } = await import('../components/ui/InteractiveBackground');
    const { container } = render(<InteractiveBackground />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
    expect(container.querySelector('.aegis-aurora')).toBeInTheDocument();
    expect(container.querySelector('.aegis-dot-grid')).toBeInTheDocument();
  });
});

describe('NavRail', () => {
  it('renders navigation rail with action items and handles interactions', () => {
    const onSectionClick = vi.fn();
    const onOpenHistory = vi.fn();
    const onResetClick = vi.fn();
    const onReplayIntro = vi.fn();

    render(
      <NavRail
        activeSection="scenarios"
        onSectionClick={onSectionClick}
        historyCount={5}
        onOpenHistory={onOpenHistory}
        activeRunId="run_demo_123"
        onResetClick={onResetClick}
        isResetDisabled={false}
        onReplayIntro={onReplayIntro}
        isOnline={true}
      />
    );

    expect(screen.getByRole('complementary', { name: /application rail/i })).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Section click
    fireEvent.click(screen.getByRole('button', { name: /workflow path/i }));
    expect(onSectionClick).toHaveBeenCalledWith('workflow');

    // History open
    fireEvent.click(screen.getByRole('button', { name: /open run history/i }));
    expect(onOpenHistory).toHaveBeenCalledTimes(1);

    // Reset click
    fireEvent.click(screen.getByRole('button', { name: /reset active run/i }));
    expect(onResetClick).toHaveBeenCalledTimes(1);

    // Replay intro click
    fireEvent.click(screen.getByRole('button', { name: /replay intro/i }));
    expect(onReplayIntro).toHaveBeenCalledTimes(1);
  });
});

describe('ClearHistoryModal', () => {
  it('renders confirmation title, prevents accidental deletion on Cancel, and confirms on action', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    const { rerender } = render(
      <ClearHistoryModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        isClearing={false}
      />
    );

    // Verify confirmation warning dialog title
    expect(
      screen.getByText('Clear all run history? This action cannot be undone.')
    ).toBeInTheDocument();

    // Cancel action prevents deletion
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();

    // Confirm action triggers deletion
    const confirmBtn = screen.getByRole('button', { name: /confirm clear/i });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    // When isClearing is true, shows spinner and disabled state
    rerender(
      <ClearHistoryModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        isClearing={true}
      />
    );
    expect(screen.getByText('Clearing...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clearing/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('renders error banner when deletion fails', () => {
    render(
      <ClearHistoryModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isClearing={false}
        error={new Error('Database foreign key transaction failed')}
      />
    );

    expect(screen.getByText(/Database foreign key transaction failed/i)).toBeInTheDocument();
    expect(screen.getByText('ERROR:')).toBeInTheDocument();
  });
});

describe('RunHistoryTable Clear History Integration', () => {
  const mockRuns: RunSummaryItem[] = [
    {
      id: 'run_test_table_1',
      scenario_id: 'sqli_demo_v1',
      mode: 'simulation',
      status: 'verified',
      created_at: '2026-10-26T10:00:00Z',
      updated_at: '2026-10-26T10:00:05Z',
      applied_mitigation_id: 'parameterized_query',
      verification_passed: true,
      reset_of_run_id: null,
      event_count: 4,
    },
  ];

  it('triggers onClearHistory when Clear History button is clicked in table header', () => {
    const onClearHistory = vi.fn();
    render(
      <RunHistoryTable
        runs={mockRuns}
        activeRunId="run_test_table_1"
        onSelectRun={vi.fn()}
        isLoading={false}
        onClearHistory={onClearHistory}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /clear all run history/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(onClearHistory).toHaveBeenCalledTimes(1);
  });
});

