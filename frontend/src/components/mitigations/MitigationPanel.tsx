import React from 'react';
import { MitigationDetail, MitigationItem, RunStatus } from '../../types/api';
import { CornerFrame } from '../ui/CornerFrame';

interface MitigationPanelProps {
  availableMitigations: MitigationItem[];
  appliedMitigation: MitigationDetail | null;
  status: RunStatus;
  onApplyMitigation: (mitigationId: string) => void;
  isApplying: boolean;
}

/**
 * Defensive mitigation panel.
 * Displays allowlisted remediations with rule explanation
 * and an syntax-highlighted unified diff viewer with emerald additions and ruby deletions.
 */
export const MitigationPanel: React.FC<MitigationPanelProps> = ({
  availableMitigations,
  appliedMitigation,
  status,
  onApplyMitigation,
  isApplying,
}) => {
  const isApplied = Boolean(appliedMitigation);

  return (
    <CornerFrame variant={isApplied ? 'accent' : 'default'} cornerSize={10} className="rounded-xl overflow-hidden">
      <section id="mitigations" className="aegis-card rounded-xl p-5 md:p-6 border border-white/10 dark:border-white/10 bg-[#101010] dark:bg-[#101010]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-sm font-bold text-white dark:text-white tracking-wider font-mono uppercase flex items-center gap-2">
              <span className="text-zinc-400 dark:text-zinc-400 font-mono">03.</span>
              <span>Defensive Mitigation</span>
              {isApplied && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 dark:bg-white/10 text-white dark:text-white border border-white/20 dark:border-white/20 font-semibold aegis-pill">
                  Applied
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 mt-1">
              Strict allowlisted remediation with educational rule explanation and code diff.
            </p>
          </div>
        </div>

        {!appliedMitigation ? (
          <div className="space-y-3.5">
            {availableMitigations.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-400 italic bg-[#151515] dark:bg-[#151515] p-4 rounded-xl border border-white/10 dark:border-white/10">
                No mitigations available for the current state.
              </p>
            ) : (
              availableMitigations.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#151515] dark:bg-[#151515] hover:bg-[#1C1C1C] dark:hover:bg-[#1C1C1C] border border-white/10 dark:border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white dark:text-white mb-1">
                      {m.label}
                    </h4>
                    <p className="text-xs text-zinc-400 dark:text-zinc-400 leading-relaxed">
                      {m.description}
                    </p>
                    <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 mt-2 block">
                      ID: <code className="text-zinc-200 dark:text-zinc-200">{m.id}</code>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onApplyMitigation(m.id)}
                    disabled={isApplying || status !== 'evidence_ready'}
                    className="px-4 py-2 rounded-full bg-white dark:bg-white hover:bg-zinc-200 dark:hover:bg-zinc-200 text-black dark:text-black font-bold text-xs whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed aegis-pill shadow-md shadow-black/20 active:scale-95 shrink-0"
                  >
                    {isApplying ? (
                      <>
                        <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Applying Patch...</span>
                      </>
                    ) : (
                      <span>Apply Mitigation</span>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Applied Mitigation Details & Code Diff */
          <div className="space-y-4">
            <div className="bg-[#1C1C1C] dark:bg-[#1C1C1C] border border-white/15 dark:border-white/15 rounded-xl p-4.5 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-white dark:text-white font-mono uppercase tracking-wider">
                  Active Mitigation: {appliedMitigation.label}
                </span>
                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 bg-[#121212] dark:bg-[#121212] px-2.5 py-0.5 rounded-full border border-white/10 dark:border-white/10 aegis-pill">
                  Target: <code className="text-zinc-200 dark:text-zinc-200">{appliedMitigation.file_path}</code>
                </span>
              </div>
              <p className="text-xs text-zinc-300 dark:text-zinc-300 leading-relaxed">
                {appliedMitigation.rule_summary}
              </p>
            </div>

            {/* Unified Code Diff Viewer */}
            <div className="rounded-xl border border-white/10 dark:border-white/10 bg-[#0C0C0C] dark:bg-[#0C0C0C] overflow-hidden text-xs shadow-inner">
              <div className="bg-[#151515] dark:bg-[#151515] px-4 py-2.5 border-b border-white/10 dark:border-white/10 flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-200 dark:text-zinc-200 font-semibold flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>{appliedMitigation.file_path}</span>
                </span>
                <span className="text-zinc-200 dark:text-zinc-200 font-bold uppercase tracking-wider bg-white/10 dark:bg-white/10 border border-white/20 dark:border-white/20 px-2 py-0.5 rounded-full aegis-pill">
                  Unified Diff
                </span>
              </div>

              <div className="p-3.5 overflow-x-auto font-mono text-[12px] leading-relaxed space-y-0.5">
                {appliedMitigation.unified_diff.split('\n').map((line, idx) => {
                  const isAddition = line.startsWith('+') && !line.startsWith('+++');
                  const isDeletion = line.startsWith('-') && !line.startsWith('---');
                  const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');

                  let lineClass = 'text-zinc-300 dark:text-zinc-300';
                  let bgClass = '';
                  let borderClass = 'border-l-2 border-transparent';

                  if (isAddition) {
                    lineClass = 'text-[#34D399] font-medium';
                    bgClass = 'bg-[#10B981]/15';
                    borderClass = 'border-l-2 border-[#10B981]';
                  } else if (isDeletion) {
                    lineClass = 'text-[#F87171] font-medium';
                    bgClass = 'bg-[#EF4444]/15';
                    borderClass = 'border-l-2 border-[#EF4444]';
                  } else if (isHeader) {
                    lineClass = 'text-zinc-400 dark:text-zinc-400 font-semibold';
                  }

                  return (
                    <div
                      key={idx}
                      className={`px-2.5 py-0.5 rounded-xs flex items-center ${bgClass} ${borderClass}`}
                    >
                      <span className={lineClass}>{line}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </CornerFrame>
  );
};
