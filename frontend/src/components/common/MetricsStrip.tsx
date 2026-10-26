import React from 'react';
import { RunResponse } from '../../types/api';
import { CornerFrame } from '../ui/CornerFrame';

interface MetricsStripProps {
  activeRun: RunResponse | null;
  totalPersistedRuns: number;
}

/**
 * Security telemetry KPI strip.
 * Displays real SQLite-persisted run count, active finding risk,
 * defensive mitigation state, and named-assertion verification outcome.
 */
export const MetricsStrip: React.FC<MetricsStripProps> = ({
  activeRun,
  totalPersistedRuns,
}) => {
  const isMitigated = Boolean(activeRun?.applied_mitigation);
  const isVerified = activeRun?.verification?.passed === true;
  const isFailed =
    activeRun?.status === 'verification_failed' ||
    activeRun?.verification?.passed === false;

  return (
    <section aria-label="Workflow Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Metric 1: Runs Recorded */}
      <CornerFrame variant="default" className="rounded-xl overflow-hidden">
        <div className="aegis-card rounded-xl p-4 flex flex-col justify-between h-full group transition-all bg-[#101010] dark:bg-[#101010] border border-white/10 dark:border-white/10">
          <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-400 font-medium">
            <span>Persisted Runs</span>
            <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-300 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 px-1.5 py-0.5 rounded-full aegis-pill">
              Active DB
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-mono font-bold tracking-tight text-white dark:text-white">
              {totalPersistedRuns}
            </span>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400">SQLite Backed</span>
          </div>
        </div>
      </CornerFrame>

      {/* Metric 2: Active Finding Severity */}
      <CornerFrame
        variant={activeRun ? 'danger' : 'default'}
        className="rounded-xl overflow-hidden"
      >
        <div className="aegis-card rounded-xl p-4 flex flex-col justify-between h-full group transition-all bg-[#101010] dark:bg-[#101010] border border-white/10 dark:border-white/10">
          <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-400 font-medium">
            <span>Active Finding</span>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-400">Synthetic</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-base font-bold text-white dark:text-white tracking-tight truncate max-w-[140px]">
              {activeRun ? activeRun.finding.severity.toUpperCase() : '—'}
            </span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-medium ${
                activeRun
                  ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 aegis-pill'
                  : 'text-zinc-500'
              }`}
            >
              {activeRun ? 'High Risk' : 'No Active Run'}
            </span>
          </div>
        </div>
      </CornerFrame>

      {/* Metric 3: Mitigations Applied */}
      <CornerFrame
        variant={isMitigated ? 'accent' : 'default'}
        className="rounded-xl overflow-hidden"
      >
        <div className="aegis-card rounded-xl p-4 flex flex-col justify-between h-full group transition-all bg-[#101010] dark:bg-[#101010] border border-white/10 dark:border-white/10">
          <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-400 font-medium">
            <span>Mitigation Status</span>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-400">Rule / Diff</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-base font-mono font-bold text-white dark:text-white truncate">
              {isMitigated ? 'Applied' : 'Pending'}
            </span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-medium ${
                isMitigated
                  ? 'bg-white/10 dark:bg-white/10 text-white dark:text-white border border-white/20 dark:border-white/20 aegis-pill'
                  : 'text-zinc-500'
              }`}
            >
              {isMitigated ? activeRun?.applied_mitigation?.id : '0 Active'}
            </span>
          </div>
        </div>
      </CornerFrame>

      {/* Metric 4: Retest Outcome */}
      <CornerFrame
        variant={isVerified ? 'success' : isFailed ? 'danger' : 'default'}
        className="rounded-xl overflow-hidden"
      >
        <div className="aegis-card rounded-xl p-4 flex flex-col justify-between h-full group transition-all bg-[#101010] dark:bg-[#101010] border border-white/10 dark:border-white/10">
          <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-400 font-medium">
            <span>Retest Outcome</span>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-400">Named Assertion</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span
              className={`text-base font-mono font-bold truncate ${
                isVerified
                  ? 'text-white dark:text-white'
                  : isFailed
                  ? 'text-[#EF4444]'
                  : 'text-zinc-400'
              }`}
            >
              {isVerified ? 'Verified' : isFailed ? 'Failed' : 'Pending'}
            </span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-medium ${
                isVerified
                  ? 'bg-white/10 dark:bg-white/10 text-white dark:text-white border border-white/20 dark:border-white/20 aegis-pill'
                  : isFailed
                  ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 aegis-pill'
                  : 'text-zinc-500'
              }`}
            >
              {isVerified ? 'Passed' : isFailed ? 'Defect' : 'Awaiting Test'}
            </span>
          </div>
        </div>
      </CornerFrame>
    </section>
  );
};
