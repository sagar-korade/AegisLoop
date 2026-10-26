import React, { useState } from 'react';
import { RunResponse } from '../../types/api';

interface RunLifecycleHeaderProps {
  run: RunResponse;
  onApplyMitigationClick: () => void;
  onRetestClick: () => void;
  onResetClick: () => void;
  isApplyingMitigation: boolean;
  isRetesting: boolean;
  isResetting: boolean;
}

/**
 * Run lifecycle controls header.
 * Displays authoritative run metadata, copyable run ID, timestamps,
 * and contextual stage action pills.
 */
export const RunLifecycleHeader: React.FC<RunLifecycleHeaderProps> = ({
  run,
  onApplyMitigationClick,
  onRetestClick,
  onResetClick,
  isApplyingMitigation,
  isRetesting,
  isResetting,
}) => {
  const [copied, setCopied] = useState(false);

  const copyRunId = async () => {
    try {
      await navigator.clipboard.writeText(run.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const canApplyMitigation =
    run.status === 'evidence_ready' && run.available_mitigations.length > 0;
  const canRetest =
    run.status === 'mitigation_applied' || run.status === 'verification_failed';

  const formatTimestamp = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="aegis-card rounded-xl p-5 border border-white/10 dark:border-white/10 bg-[#101010] dark:bg-[#101010] flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Run Metadata */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider">RUN ID:</span>
          <button
            type="button"
            onClick={copyRunId}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#151515] dark:bg-[#151515] border border-white/10 dark:border-white/10 hover:border-white/30 dark:hover:border-white/30 text-xs font-mono text-white dark:text-white transition-all cursor-pointer aegis-pill active:scale-95"
            title="Copy Run ID"
          >
            <span>{run.id}</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-400 font-semibold">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Status Badge */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold uppercase aegis-pill ${
              run.status === 'verified'
                ? 'bg-white/10 dark:bg-white/10 text-white dark:text-white border border-white/20 dark:border-white/20'
                : run.status === 'verification_failed'
                ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                : run.status === 'mitigation_applied'
                ? 'bg-white/10 dark:bg-white/10 text-white dark:text-white border border-white/20 dark:border-white/20'
                : run.status === 'evidence_ready'
                ? 'bg-zinc-500/15 text-zinc-200 dark:text-zinc-200 border border-zinc-500/30'
                : 'bg-white/5 dark:bg-white/5 text-zinc-400 border border-white/10'
            }`}
          >
            {run.status.replace(/_/g, ' ')}
          </span>

          {run.reset_of_run_id && (
            <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 bg-white/5 dark:bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 dark:border-white/10 aegis-pill">
              Successor of <code className="text-zinc-200 dark:text-zinc-200">{run.reset_of_run_id}</code>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 dark:text-zinc-400">
          <span>
            Scenario: <strong className="text-white dark:text-white font-mono">{run.scenario_id}</strong>
          </span>
          <span className="text-zinc-600 dark:text-zinc-600">•</span>
          <span>
            Created: <span className="font-mono text-zinc-200 dark:text-zinc-200">{formatTimestamp(run.created_at)}</span>
          </span>
          <span className="text-zinc-600 dark:text-zinc-600">•</span>
          <span>
            Updated: <span className="font-mono text-zinc-200 dark:text-zinc-200">{formatTimestamp(run.updated_at)}</span>
          </span>
        </div>
      </div>

      {/* Primary Actions for current stage */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {canApplyMitigation && (
          <button
            type="button"
            onClick={onApplyMitigationClick}
            disabled={isApplyingMitigation}
            className="px-4 py-2 rounded-full bg-white dark:bg-white hover:bg-zinc-200 dark:hover:bg-zinc-200 text-black dark:text-black font-bold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed aegis-pill shadow-md shadow-black/20 active:scale-95"
          >
            {isApplyingMitigation ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Apply Mitigation</span>
              </>
            )}
          </button>
        )}

        {canRetest && (
          <button
            type="button"
            onClick={onRetestClick}
            disabled={isRetesting}
            className="px-4 py-2 rounded-full bg-white dark:bg-white hover:bg-zinc-200 dark:hover:bg-zinc-200 text-black dark:text-black font-bold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed aegis-pill shadow-md shadow-black/20 active:scale-95"
          >
            {isRetesting ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Retesting...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Retest Assertion</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onResetClick}
          disabled={isResetting}
          className="px-3.5 py-2 rounded-full bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 hover:border-[#EF4444]/50 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed aegis-pill active:scale-95"
          title="Reset run"
        >
          <svg className="w-3.5 h-3.5 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
