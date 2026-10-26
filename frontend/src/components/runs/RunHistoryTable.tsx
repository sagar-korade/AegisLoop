import React from 'react';
import { RunResponse, RunSummaryItem } from '../../types/api';
import { CornerFrame } from '../ui/CornerFrame';

interface RunHistoryTableProps {
  runs: (RunSummaryItem | RunResponse)[];
  activeRunId: string | null;
  onSelectRun: (runId: string) => void;
  isLoading: boolean;
  error?: Error | null;
  onClearHistory?: () => void;
}

/**
 * Bottom Run History Table matching Reference 1 ("Dashboard Scene" table).
 * Directly displays persisted SQLite runs with columns:
 * Run ID, Scenario, Status, Mitigation, Events, Time, and Action.
 */
export const RunHistoryTable: React.FC<RunHistoryTableProps> = ({
  runs,
  activeRunId,
  onSelectRun,
  isLoading,
  error,
  onClearHistory,
}) => {
  const formatTime = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <CornerFrame variant="default" cornerSize={10} className="rounded-xl overflow-hidden">
      <section id="runs-table" className="aegis-card rounded-xl p-5 md:p-6 border border-white/10 dark:border-white/10 bg-[#101010] dark:bg-[#101010]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white dark:text-white tracking-wider font-mono uppercase flex items-center gap-2">
              <span className="text-zinc-400 dark:text-zinc-400 font-mono">05.</span>
              <span>Run History</span>
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 mt-0.5">
              Authoritative execution runs persisted in SQLite database.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 px-2.5 py-1 rounded-full aegis-pill">
              {runs.length} Runs Recorded
            </span>
            {onClearHistory && runs.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 hover:border-[#EF4444]/50 text-xs font-mono font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed aegis-pill"
                title="Clear all persisted runs"
                aria-label="Clear all run history"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2 animate-pulse py-4">
            <div className="h-10 bg-white/5 dark:bg-white/5 rounded-lg" />
            <div className="h-10 bg-white/5 dark:bg-white/5 rounded-lg" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-xs text-[#EF4444]">
            Failed to load persisted runs: {error.message}
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-10 text-xs text-zinc-400 dark:text-zinc-400">
            No persisted runs in database. Launch a simulation above to record a traceable run.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 dark:border-white/10 text-[11px] font-mono text-zinc-400 dark:text-zinc-400 uppercase">
                  <th className="py-2.5 px-3">Run ID</th>
                  <th className="py-2.5 px-3">Scenario</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Mitigation</th>
                  <th className="py-2.5 px-3">Events</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 dark:divide-white/6 font-mono">
                {runs.slice(0, 10).map((r) => {
                  const isSelected = r.id === activeRunId;
                  const eventCount = 'event_count' in r ? r.event_count : (r.events?.length ?? 0);
                  const mitigationId =
                    'applied_mitigation_id' in r
                      ? r.applied_mitigation_id
                      : 'applied_mitigation' in r
                      ? (r as RunResponse).applied_mitigation?.id
                      : null;

                  return (
                    <tr
                      key={r.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-white/10 dark:bg-white/10 text-white dark:text-white font-semibold'
                          : 'hover:bg-white/5 dark:hover:bg-white/5 text-zinc-300 dark:text-zinc-300'
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-white dark:text-white">
                        <div className="flex items-center gap-1.5">
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-white" />
                          )}
                          <span>{r.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-200 dark:text-zinc-200">{r.scenario_id}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase aegis-pill ${
                            r.status === 'verified'
                              ? 'bg-white/10 dark:bg-white/10 text-white dark:text-white border border-white/20 dark:border-white/20'
                              : r.status === 'verification_failed'
                              ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                              : r.status === 'reset'
                              ? 'bg-white/5 dark:bg-white/5 text-zinc-400 border border-white/10'
                              : 'bg-white/10 dark:bg-white/10 text-white dark:text-white border border-white/20 dark:border-white/20'
                          }`}
                        >
                          {r.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-400 dark:text-zinc-400">
                        {mitigationId || '—'}
                      </td>
                      <td className="py-3 px-3 text-zinc-400 dark:text-zinc-400">
                        {eventCount} events
                      </td>
                      <td className="py-3 px-3 text-zinc-400 dark:text-zinc-400">
                        {formatTime(r.created_at)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isSelected ? (
                          <span className="text-[11px] font-semibold text-white dark:text-white">
                            Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectRun(r.id)}
                            className="px-2.5 py-1 rounded-md bg-white/5 dark:bg-white/5 hover:bg-white dark:hover:bg-white text-zinc-300 dark:text-zinc-300 hover:text-black dark:hover:text-black border border-white/10 dark:border-white/10 text-[11px] font-semibold transition-all cursor-pointer aegis-pill"
                          >
                            Load Run →
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </CornerFrame>
  );
};
