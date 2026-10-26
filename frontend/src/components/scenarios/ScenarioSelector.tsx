import React from 'react';
import { ScenarioItem } from '../../types/api';
import { CornerFrame } from '../ui/CornerFrame';

interface ScenarioSelectorProps {
  scenarios: ScenarioItem[];
  selectedScenarioId: string | null;
  onSelectScenario: (scenarioId: string) => void;
  isLoading: boolean;
  isCreating: boolean;
}

/**
 * Scenario catalogue displaying allowlisted deterministic
 * purple-team security fixtures with corner frames, technical tags, and pill actions.
 */
export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  isLoading,
  isCreating,
}) => {
  if (isLoading) {
    return (
      <div className="aegis-card rounded-xl p-6">
        <div className="animate-pulse flex flex-col gap-3">
          <div className="h-4 bg-white/5 rounded w-1/4" />
          <div className="h-20 bg-white/5 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <section id="scenarios" className="aegis-card rounded-xl p-5 md:p-6 border border-white/10 dark:border-white/10 bg-[#101010] dark:bg-[#101010] relative overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white dark:text-white tracking-wider uppercase font-mono flex items-center gap-2">
              <span>Select a Security Scenario</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-white/5 dark:bg-white/5 text-zinc-300 dark:text-zinc-300 text-[10px] font-mono border border-white/10 dark:border-white/10 font-semibold aegis-pill">
              Deterministic
            </span>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-400 mt-1">
            Choose an allowlisted deterministic purple-team security fixture.
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 px-2.5 py-1 rounded-full aegis-pill">
          {scenarios.length} Allowlisted Fixtures
        </span>
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((sc) => {
          const isSelected = selectedScenarioId === sc.id;
          const isSqli = sc.id.includes('sqli');

          return (
            <CornerFrame
              key={sc.id}
              active={isSelected}
              variant={isSelected ? 'accent' : 'default'}
              cornerSize={10}
              className="rounded-xl overflow-hidden transition-all duration-200"
            >
              <div
                className={`p-5 rounded-xl border flex flex-col justify-between h-full transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#1C1C1C] dark:bg-[#1C1C1C] border-white dark:border-white shadow-lg shadow-black/20 ring-1 ring-white/20 dark:ring-white/20'
                    : 'bg-[#151515] dark:bg-[#151515] border-white/10 dark:border-white/10 hover:border-white/20 dark:hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 rounded-lg bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 text-zinc-300 dark:text-zinc-300 shrink-0">
                        {isSqli ? (
                          /* Database query line icon */
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                          </svg>
                        ) : (
                          /* Key / Authorization line icon */
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white dark:text-white tracking-tight block">
                          {sc.name}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 mt-0.5 block">
                          ID: <code className="text-zinc-200 dark:text-zinc-200">{sc.id}</code>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 text-zinc-400 dark:text-zinc-400 aegis-pill">
                        {sc.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 aegis-pill">
                        {sc.severity}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 dark:text-zinc-400 leading-relaxed mb-4">
                    {sc.summary}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-white/10 dark:border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 dark:text-zinc-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-400" />
                    <span className="text-zinc-400 dark:text-zinc-400">Mode: Simulation</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectScenario(sc.id)}
                    disabled={isCreating}
                    aria-label={isSelected ? 'Active Scenario' : 'Run Simulation'}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 flex items-center gap-1.5 aegis-pill active:scale-95 ${
                      isSelected
                        ? 'bg-white dark:bg-white text-black dark:text-black hover:bg-zinc-200 dark:hover:bg-zinc-200 shadow-md shadow-black/20'
                        : 'bg-white/10 dark:bg-white/10 hover:bg-white/15 dark:hover:bg-white/15 text-white dark:text-white border border-white/15 dark:border-white/15'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isCreating && isSelected ? (
                      <>
                        <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Launching...</span>
                      </>
                    ) : isSelected ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-current" />
                        <span>Active Scenario</span>
                      </>
                    ) : sc.id === 'bola_demo_v1' ? (
                      <>
                        <span>Activate Scenario</span>
                        <span className="text-zinc-400 dark:text-zinc-400">→</span>
                      </>
                    ) : (
                      <>
                        <span>Launch Simulation</span>
                        <span className="text-zinc-400 dark:text-zinc-400">→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </CornerFrame>
          );
        })}
      </div>
    </section>
  );
};
