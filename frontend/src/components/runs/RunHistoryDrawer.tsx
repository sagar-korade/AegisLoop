import React from 'react';
import { RunResponse, RunSummaryItem } from '../../types/api';

interface RunHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  runs: (RunSummaryItem | RunResponse)[];
  activeRunId: string | null;
  onSelectRun: (runId: string) => void;
  isLoading: boolean;
  error?: Error | null;
  onClearHistory?: () => void;
}

/**
 * Slide-over run history drawer.
 * Displays real persisted runs directly loaded from SQLite via backend API.
 */
export const RunHistoryDrawer: React.FC<RunHistoryDrawerProps> = ({
  isOpen,
  onClose,
  runs,
  activeRunId,
  onSelectRun,
  isLoading,
  error,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Persisted Run History"
    >
      <div className="w-full max-w-md bg-[#101010] dark:bg-[#101010] border-l border-white/10 dark:border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-5 border-b border-white/10 dark:border-white/10 flex items-center justify-between bg-[#151515] dark:bg-[#151515]">
          <div>
            <h3 className="text-sm font-bold text-white dark:text-white tracking-wider font-mono uppercase flex items-center gap-2">
              <span className="text-zinc-400 dark:text-zinc-400 font-mono">AL//</span>
              <span>Persisted Run History</span>
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 mt-1">
              Real runs fetched directly from SQLite via backend API.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onClearHistory && runs.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 hover:border-[#EF4444]/50 text-xs font-mono font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed aegis-pill"
                title="Clear all persisted runs"
                aria-label="Clear all run history"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 dark:bg-white/5 text-zinc-400 dark:text-zinc-400 hover:text-white dark:hover:text-white border border-white/10 dark:border-white/10 flex items-center justify-center cursor-pointer transition-colors aegis-pill"
              aria-label="Close run history"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Run List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-20 bg-white/5 dark:bg-white/5 rounded-xl" />
              <div className="h-20 bg-white/5 dark:bg-white/5 rounded-xl" />
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-[#1C1214] dark:bg-[#1C1214] border border-[#EF4444]/30 flex items-center justify-center mx-auto mb-3 text-[#EF4444] text-lg font-mono">
                !
              </div>
              <h4 className="text-sm font-semibold text-white dark:text-white mb-1">
                Unable to Load History
              </h4>
              <p className="text-xs text-zinc-400 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                {error.message || 'Failed to retrieve persisted runs from backend.'}
              </p>
            </div>
          ) : runs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 flex items-center justify-center mx-auto mb-3 text-zinc-400 dark:text-zinc-400 text-lg font-mono">
                ⏱
              </div>
              <h4 className="text-sm font-semibold text-white dark:text-white mb-1">
                No Persisted Runs Yet
              </h4>
              <p className="text-xs text-zinc-400 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Select a scenario and click "Run Simulation" to execute a traceable purple-team workflow.
              </p>
            </div>
          ) : (
            runs.map((r) => {
              const isSelected = r.id === activeRunId;
              const eventCount = 'event_count' in r ? r.event_count : (r.events?.length ?? 0);

              return (
                <div
                  key={r.id}
                  className={`p-4 rounded-xl border transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#1C1C1C] dark:bg-[#1C1C1C] border-white dark:border-white shadow-lg shadow-black/20'
                      : 'bg-[#151515] dark:bg-[#151515] hover:bg-[#1C1C1C] dark:hover:bg-[#1C1C1C] border-white/10 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-white dark:text-white">
                      {r.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase font-semibold aegis-pill ${
                        r.status === 'verified'
                          ? 'bg-white/10 dark:bg-white/10 text-white dark:text-white border border-white/20 dark:border-white/20'
                          : r.status === 'verification_failed'
                          ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                          : r.status === 'reset'
                          ? 'bg-white/5 dark:bg-white/5 text-zinc-400 border-white/10'
                          : 'bg-white/10 dark:bg-white/10 text-white dark:text-white border border-white/20 dark:border-white/20'
                      }`}
                    >
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-400 mb-3 font-mono">
                    <span className="text-[11px] text-zinc-200 dark:text-zinc-200">{r.scenario_id}</span>
                    <span className="text-[11px] text-zinc-500">
                      {r.created_at ? new Date(r.created_at).toLocaleTimeString() : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/10 dark:border-white/10">
                    <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400">
                      {eventCount} events logged
                    </span>

                    {isSelected ? (
                      <span className="text-[11px] font-mono font-semibold text-white dark:text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-white" />
                        <span>Currently Viewing</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectRun(r.id);
                          onClose();
                        }}
                        className="px-3 py-1 rounded-full bg-white/5 dark:bg-white/5 hover:bg-white dark:hover:bg-white text-zinc-300 dark:text-zinc-300 hover:text-black dark:hover:text-black border border-white/10 dark:border-white/10 text-xs font-semibold font-mono cursor-pointer transition-all aegis-pill"
                      >
                        Load Run →
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Bar with Clear Action */}
        {runs.length > 0 && onClearHistory && (
          <div className="p-3.5 border-t border-white/10 dark:border-white/10 bg-[#151515] dark:bg-[#151515] flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400">
              {runs.length} run{runs.length === 1 ? '' : 's'} recorded
            </span>
            <button
              type="button"
              onClick={onClearHistory}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 hover:border-[#EF4444]/50 text-xs font-mono font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed aegis-pill"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
