import React, { useState, useEffect } from 'react';
import { useAegisLoop } from './hooks/useAegisLoop';
import { TopBar } from './components/common/TopBar';
import { SafetyModeBanner } from './components/common/SafetyModeBanner';
import { ErrorState } from './components/common/ErrorState';
import { EmptyState } from './components/common/EmptyState';
import { ScenarioSelector } from './components/scenarios/ScenarioSelector';
import { AgentPathStage } from './components/workflow/AgentPathStage';
import { WorkflowTracker } from './components/workflow/WorkflowTracker';
import { RunLifecycleHeader } from './components/workflow/RunLifecycleHeader';
import { FindingInspector } from './components/evidence/FindingInspector';
import { EvidenceTimeline } from './components/evidence/EvidenceTimeline';
import { MitigationPanel } from './components/mitigations/MitigationPanel';
import { RetestPanel } from './components/verification/RetestPanel';
import { ResetModal } from './components/runs/ResetModal';
import { ClearHistoryModal } from './components/runs/ClearHistoryModal';
import { RunHistoryDrawer } from './components/runs/RunHistoryDrawer';
import { RunHistoryTable } from './components/runs/RunHistoryTable';
import { InteractiveBackground } from './components/ui/InteractiveBackground';
import { AegisLoopIntro } from './components/intro/AegisLoopIntro';
import { NavRail } from './components/navigation/NavRail';

export const App: React.FC = () => {
  const {
    healthQuery,
    scenariosQuery,
    activeRun,
    isActiveRunLoading,
    historyRuns,
    isHistoryLoading,
    historyError,
    runIds,
    activeRunId,
    setActiveRunId,
    lastError,
    clearError,
    createRun,
    isCreatingRun,
    applyMitigation,
    isApplyingMitigation,
    retestRun,
    isRetesting,
    resetRun,
    isResetting,
    clearHistory,
    isClearingHistory,
    clearHistoryError,
  } = useAegisLoop();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('scenarios');
  const [showArchitecture, setShowArchitecture] = useState(false);

  // Enforce dark mode permanently and remove any saved theme preference
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('aegisloop_theme');
      } catch {
        // Ignore storage errors in restricted test/iframe environments
      }
    }
  }, []);

  // Minimal Intro State: AEGISLOOP + Breathing Orb transforming into Header
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isTest =
      import.meta.env?.MODE === 'test' ||
      (typeof globalThis !== 'undefined' &&
        Boolean((globalThis as unknown as { __AEGIS_TEST__?: boolean }).__AEGIS_TEST__));
    if (isTest) return false;
    try {
      return !sessionStorage.getItem('aegisloop_intro_seen');
    } catch {
      return false;
    }
  });

  const [dashboardEmerged, setDashboardEmerged] = useState<boolean>(() => !showIntro);

  const handleBeginTransition = () => {
    setDashboardEmerged(true);
  };

  const handleCompleteIntro = () => {
    try {
      sessionStorage.setItem('aegisloop_intro_seen', 'true');
    } catch {
      // Ignore storage errors in restricted environments
    }
    setDashboardEmerged(true);
    setShowIntro(false);
  };

  const handleReplayIntro = () => {
    setDashboardEmerged(false);
    setShowIntro(true);
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'workflow') {
      setShowArchitecture(true);
    }
    setTimeout(() => {
      const elem = document.getElementById(sectionId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const scenarios = scenariosQuery.data?.items ?? [];

  const handleSelectScenario = (scenarioId: string) => {
    createRun(scenarioId);
  };

  const handleApplyMitigation = (mitigationId: string) => {
    applyMitigation(mitigationId);
  };

  const handleRetest = () => {
    if (!activeRun) return;
    const assertionId = activeRun.expected_assertion_id;
    if (!assertionId) return;
    retestRun(assertionId);
  };

  const handleConfirmReset = () => {
    resetRun();
    setIsResetModalOpen(false);
  };

  const handleConfirmClearHistory = async () => {
    try {
      await clearHistory();
      setIsClearHistoryModalOpen(false);
    } catch {
      // Keep modal open to display clearHistoryError banner to user
    }
  };

  const isHealthOk = Boolean(healthQuery.data && !healthQuery.isError);

  return (
    <div className="min-h-screen flex bg-[#090909] text-[#F5F5F5] relative overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* 1. Topographic Elevation Contour Field with Mouse Reactivity */}
      <InteractiveBackground />

      {/* 2. Minimal Cinematic Intro: Wordmark + Breathing Orb, Transforming into Header */}
      {showIntro && (
        <AegisLoopIntro
          onBeginTransition={handleBeginTransition}
          onComplete={handleCompleteIntro}
        />
      )}

      {/* 3. Reference 1 Sidebar with Reference 2 Design Tokens (Desktop w-60) */}
      <NavRail
        activeSection={activeSection}
        onSectionClick={handleSectionClick}
        historyCount={Math.max(runIds.length, historyRuns.length)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        activeRunId={activeRunId}
        onResetClick={() => setIsResetModalOpen(true)}
        isResetDisabled={isResetting || !activeRunId}
        onReplayIntro={handleReplayIntro}
        isOnline={isHealthOk}
      />

      {/* 4. Main Operational Layout (emerges smoothly beneath traveling wordmark) */}
      <div
        className={`flex-1 flex flex-col min-h-screen lg:pl-60 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          dashboardEmerged ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Header Navigation Dock */}
        <TopBar
          health={healthQuery.data ?? null}
          healthLoading={healthQuery.isLoading}
          healthError={Boolean(healthQuery.isError)}
          historyCount={Math.max(runIds.length, historyRuns.length)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          activeRunId={activeRunId}
          onResetClick={() => setIsResetModalOpen(true)}
          isResetDisabled={isResetting || !activeRunId}
          onReplayIntro={handleReplayIntro}
        />

        {/* Safety Mode Banner */}
        <SafetyModeBanner />

        {/* Main Workspace Container — Expansive Desktop Security Shell */}
        <main className="relative z-10 flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-7 space-y-7">
          {/* Reference Page Heading: Purple-Team Security Workflow */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 dark:border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-400" />
                <span className="text-xs font-mono font-medium text-zinc-400 dark:text-zinc-400 uppercase tracking-wider">
                  Security Operations Prototype
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white dark:text-white">
                Purple-Team Security Workflow
              </h1>

              <p className="text-xs md:text-sm text-zinc-400 dark:text-zinc-400 mt-2 max-w-3xl leading-relaxed">
                AegisLoop uses controlled simulations, synthetic evidence, educational mitigation, and named-assertion verification to trace security workflows from attack to defense.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400 dark:text-zinc-400 bg-white/5 dark:bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 dark:border-white/10">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-300" />
                <span className="text-zinc-300 dark:text-zinc-300">Storage: SQLite Active</span>
              </span>
              <span className="text-zinc-600 dark:text-zinc-600">•</span>
              <span className="text-zinc-400 dark:text-zinc-400">State: Backend Authoritative</span>
            </div>
          </div>

          {/* Reference Feature: Five-Stage Horizontal Workflow Tracker */}
          <WorkflowTracker status={activeRun?.status ?? null} />

          {/* Global Error Banner */}
          {lastError && (
            <ErrorState
              error={lastError}
              title="Workflow Error"
              onRetry={clearError}
            />
          )}

          {/* Health Connection Warning */}
          {healthQuery.isError && (
            <div className="bg-[#181113] border border-[#EF4444]/40 rounded-xl p-4 text-xs text-[#EF4444] flex items-center justify-between shadow-lg">
              <span>
                <strong>Backend Disconnected:</strong> Cannot reach FastAPI at <code>http://127.0.0.1:8000</code>. Ensure the backend server is running.
              </span>
              <button
                type="button"
                onClick={() => healthQuery.refetch()}
                className="px-3.5 py-1.5 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs cursor-pointer aegis-pill transition-all"
              >
                Reconnect
              </button>
            </div>
          )}

          {/* 1. Security Scenario Selection */}
          <ScenarioSelector
            scenarios={scenarios}
            selectedScenarioId={activeRun?.scenario_id ?? null}
            onSelectScenario={handleSelectScenario}
            isLoading={scenariosQuery.isLoading}
            isCreating={isCreatingRun}
          />

          {/* Progressive Disclosure: Agent Architecture & Telemetry Details */}
          <div id="workflow" className="rounded-xl border border-white/10 dark:border-white/10 bg-[#101010] dark:bg-[#101010] p-4 transition-all">
            <button
              type="button"
              onClick={() => setShowArchitecture((prev) => !prev)}
              className="flex items-center justify-between w-full text-left cursor-pointer group"
              aria-expanded={showArchitecture}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/5 dark:bg-white/5 border border-white/10 text-zinc-300 dark:text-zinc-300 group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-bold text-white dark:text-white font-mono uppercase tracking-wider block">
                    Agent Architecture & Workflow Path
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-400">
                    Red Agent Probe → Target Arena → Blue Agent Mitigation
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400 group-hover:text-white dark:group-hover:text-white transition-colors">
                  {showArchitecture ? 'Hide Pipeline ▲' : 'Inspect Pipeline ▼'}
                </span>
              </div>
            </button>

            {showArchitecture && (
              <div className="mt-4 pt-4 border-t border-white/10 dark:border-white/10">
                <AgentPathStage
                  status={activeRun?.status ?? null}
                  scenarioId={activeRun?.scenario_id ?? null}
                />
              </div>
            )}
          </div>

          {/* 2. Run Workspace: Evidence & Mitigation (Balanced 2-Col Grid), followed by Retest & Verification */}
          {isActiveRunLoading ? (
            <div className="aegis-card rounded-xl p-10 text-center animate-pulse text-xs text-zinc-400 border border-white/8">
              Loading persisted run details from backend...
            </div>
          ) : activeRun ? (
            <div className="space-y-7">
              {/* Run Lifecycle Controls Header */}
              <RunLifecycleHeader
                run={activeRun}
                onApplyMitigationClick={() => {
                  if (activeRun.available_mitigations.length > 0) {
                    handleApplyMitigation(activeRun.available_mitigations[0].id);
                  }
                }}
                onRetestClick={handleRetest}
                onResetClick={() => setIsResetModalOpen(true)}
                isApplyingMitigation={isApplyingMitigation}
                isRetesting={isRetesting}
                isResetting={isResetting}
              />

              {/* Two Balanced Panels: Left = Synthetic Evidence, Right = Proposed Fix / Mitigation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left Panel: Synthetic Evidence */}
                <div id="evidence" className="space-y-6">
                  <FindingInspector finding={activeRun.finding} />
                  <EvidenceTimeline events={activeRun.events} />
                </div>

                {/* Right Panel: Proposed Fix / Mitigation */}
                <div id="defense" className="space-y-6">
                  <MitigationPanel
                    availableMitigations={activeRun.available_mitigations}
                    appliedMitigation={activeRun.applied_mitigation}
                    status={activeRun.status}
                    onApplyMitigation={handleApplyMitigation}
                    isApplying={isApplyingMitigation}
                  />
                </div>
              </div>

              {/* Retest & Verification Area: Compact, Below Evidence & Mitigation Panels */}
              <div id="verification">
                <RetestPanel
                  status={activeRun.status}
                  verification={activeRun.verification}
                  onRetest={handleRetest}
                  isRetesting={isRetesting}
                  expectedAssertionId={activeRun.expected_assertion_id ?? undefined}
                />
              </div>
            </div>
          ) : (
            /* Empty State when no run is active */
            <EmptyState
              title="No Active Purple-Team Run"
              description="Select either 'Unsafe Query Construction (sqli_demo_v1)' or 'Broken Object-Level Authorization (bola_demo_v1)' above to execute a deterministic security simulation."
              actionLabel="Launch SQL Injection Scenario"
              onAction={() => handleSelectScenario('sqli_demo_v1')}
            />
          )}

          {/* Reference Feature: Bottom Persisted Run History Table */}
          <RunHistoryTable
            runs={historyRuns}
            activeRunId={activeRunId}
            onSelectRun={(id) => setActiveRunId(id)}
            isLoading={isHistoryLoading}
            error={historyError}
            onClearHistory={() => setIsClearHistoryModalOpen(true)}
          />
        </main>

        {/* 4. Refined Wide Footer */}
        <footer className="relative z-10 border-t border-white/10 dark:border-white/10 bg-[#090909]/90 dark:bg-[#090909]/90 backdrop-blur-md py-6 text-xs text-zinc-400 dark:text-zinc-400">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#F5F5F5] dark:text-[#F5F5F5]">AegisLoop — Educational Purple-Team Prototype</span>
              <span className="text-zinc-600 dark:text-zinc-600 hidden md:inline">•</span>
              <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-400 hidden md:inline">Simulation-First Architecture</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-400" />
                <span className="text-zinc-400 dark:text-zinc-400">Allowlisted Deterministic Workflows • Zero External Scanning</span>
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Reset Confirmation Modal */}
      {activeRun && (
        <ResetModal
          isOpen={isResetModalOpen}
          runId={activeRun.id}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleConfirmReset}
          isResetting={isResetting}
        />
      )}

      {/* Clear History Confirmation Modal */}
      <ClearHistoryModal
        isOpen={isClearHistoryModalOpen}
        onClose={() => setIsClearHistoryModalOpen(false)}
        onConfirm={handleConfirmClearHistory}
        isClearing={isClearingHistory}
        error={clearHistoryError}
      />

      {/* Persisted Run History Slide-Over Drawer */}
      <RunHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        runs={historyRuns}
        activeRunId={activeRunId}
        onSelectRun={(id) => setActiveRunId(id)}
        isLoading={isHistoryLoading}
        error={historyError}
        onClearHistory={() => setIsClearHistoryModalOpen(true)}
      />
    </div>
  );
};
