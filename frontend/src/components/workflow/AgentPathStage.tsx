import React from 'react';
import { useReducedMotion } from 'motion/react';
import { RunStatus } from '../../types/api';
import { CornerFrame } from '../ui/CornerFrame';

interface AgentPathStageProps {
  status: RunStatus | null;
  scenarioId: string | null;
}

/**
 * 3-stage security workflow path.
 * Renders the causal sequence: Red Agent probe -> Target Arena response -> Blue Agent defense.
 * Accurately displays authoritative backend lifecycle status and respects prefers-reduced-motion.
 */
export const AgentPathStage: React.FC<AgentPathStageProps> = ({
  status,
  scenarioId: _scenarioId,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Determine active visual stage based strictly on authoritative status
  const isRedActive = status === 'testing';
  const isArenaActive = status === 'evidence_ready' || status === 'testing';
  const isBlueActive =
    status === 'evidence_ready' ||
    status === 'mitigation_applied' ||
    status === 'retesting' ||
    status === 'verified' ||
    status === 'verification_failed';

  const isMitigationStage =
    status === 'mitigation_applied' ||
    status === 'retesting' ||
    status === 'verified';

  const isVerifiedStage = status === 'verified';
  const isFailedStage = status === 'verification_failed';

  return (
    <section
      id="workflow"
      aria-label="Purple-Team Agent Stage"
      className="aegis-card rounded-xl p-5 md:p-6 border border-white/10 dark:border-white/10 bg-[#101010] dark:bg-[#101010] relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h2 className="text-sm font-bold text-white dark:text-white tracking-wider uppercase font-mono flex items-center gap-2">
            <span className="text-zinc-400 dark:text-zinc-400 font-mono">02.</span>
            <span>Purple-Team Workflow Path</span>
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-400 mt-1">
            Causal sequence: offensive probe → toy target response → defensive mitigation → named assertion retest.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400">Lifecycle Status:</span>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase aegis-pill ${
              isVerifiedStage
                ? 'bg-white/10 dark:bg-white/10 text-white dark:text-white border border-white/20 dark:border-white/20'
                : isFailedStage
                ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                : status
                ? 'bg-white/10 dark:bg-white/10 text-white dark:text-white border border-white/20 dark:border-white/20'
                : 'bg-white/5 dark:bg-white/5 text-zinc-400 dark:text-zinc-400 border border-white/10 dark:border-white/10'
            }`}
          >
            {status ? status.replace(/_/g, ' ') : 'IDLE'}
          </span>
        </div>
      </div>

      {/* 3-Stage Diagram Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative pt-1 pb-1">
        {/* Stage 1: Red Agent */}
        <CornerFrame
          variant={isRedActive ? 'danger' : 'default'}
          active={isRedActive}
          className="rounded-xl overflow-hidden"
        >
          <div
            className={`p-4.5 rounded-xl border flex flex-col justify-between h-full transition-all duration-200 ${
              isRedActive
                ? 'bg-[#1C1214] dark:bg-[#1C1214] border-[#EF4444]/70 ring-1 ring-[#EF4444]/30 shadow-lg shadow-[#EF4444]/10'
                : 'bg-[#151515] dark:bg-[#151515] border-white/10 dark:border-white/10'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-mono font-bold uppercase text-[#EF4444] tracking-wider flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    {isRedActive && !shouldReduceMotion && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" />
                    )}
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]" />
                  </span>
                  Red Agent
                </span>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-400 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 px-2 py-0.5 rounded-full aegis-pill">
                  Offense
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white dark:text-white mb-1">
                Deterministic Security Probe
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-400 leading-relaxed">
                Dispatches allowlisted synthetic probe payload against simulated endpoint.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-zinc-400">
              <span>Payload: Allowlisted</span>
              <span className="text-[#EF4444] font-medium">{isRedActive ? 'Active' : 'Completed'}</span>
            </div>
          </div>
        </CornerFrame>

        {/* Desktop Connector 1: Red Agent -> Target Arena */}
        <div
          className="hidden md:flex items-center justify-center absolute left-[32.5%] top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20"
          aria-hidden="true"
        >
          <div
            className={`relative flex items-center justify-center w-8 h-8 rounded-full bg-[#151515] dark:bg-[#151515] border transition-all duration-300 aegis-pill shadow-md ${
              isRedActive
                ? 'border-[#EF4444] shadow-[#EF4444]/20 scale-110'
                : 'border-white/15 dark:border-white/15'
            }`}
          >
            {isRedActive && !shouldReduceMotion && (
              <span className="animate-ping absolute inset-0 rounded-full bg-[#EF4444]/30" />
            )}
            <svg
              className={`w-3.5 h-3.5 transition-colors ${
                isRedActive ? 'text-[#EF4444]' : 'text-zinc-400 dark:text-zinc-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>

        {/* Stage 2: Arena / Target */}
        <CornerFrame
          variant={isArenaActive && !isMitigationStage ? 'accent' : 'default'}
          active={isArenaActive && !isMitigationStage}
          className="rounded-xl overflow-hidden"
        >
          <div
            className={`p-4.5 rounded-xl border flex flex-col justify-between h-full transition-all duration-200 ${
              isArenaActive && !isMitigationStage
                ? 'bg-[#1C1C1C] dark:bg-[#1C1C1C] border-white/40 dark:border-white/40 ring-1 ring-white/20 dark:ring-white/20 shadow-lg shadow-black/20'
                : 'bg-[#151515] dark:bg-[#151515] border-white/10 dark:border-white/10'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-mono font-bold uppercase text-zinc-200 dark:text-zinc-200 tracking-wider flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    {isArenaActive && !isMitigationStage && !shouldReduceMotion && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75" />
                    )}
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-400 dark:bg-zinc-400" />
                  </span>
                  Target Arena
                </span>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-400 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 px-2 py-0.5 rounded-full aegis-pill">
                  Toy Target
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white dark:text-white mb-1">
                Execution Environment
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-400 leading-relaxed">
                Evaluates request against isolated vulnerable endpoint, capturing raw response & telemetry.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-zinc-400">
              <span>Target: Loopback Only</span>
              <span className="text-zinc-300 dark:text-zinc-300 font-medium">
                {isMitigationStage ? 'Mitigated' : 'Evidence Emitted'}
              </span>
            </div>
          </div>
        </CornerFrame>

        {/* Desktop Connector 2: Target Arena -> Blue Agent */}
        <div
          className="hidden md:flex items-center justify-center absolute left-[66%] top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20"
          aria-hidden="true"
        >
          <div
            className={`relative flex items-center justify-center w-8 h-8 rounded-full bg-[#151515] dark:bg-[#151515] border transition-all duration-300 aegis-pill shadow-md ${
              isArenaActive && !isMitigationStage
                ? 'border-white/40 dark:border-white/40 scale-110'
                : isVerifiedStage
                ? 'border-white dark:border-white'
                : 'border-white/15 dark:border-white/15'
            }`}
          >
            {isArenaActive && !isMitigationStage && !shouldReduceMotion && (
              <span className="animate-ping absolute inset-0 rounded-full bg-white/20" />
            )}
            <svg
              className="w-3.5 h-3.5 transition-colors text-zinc-400 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>

        {/* Stage 3: Blue Agent */}
        <CornerFrame
          variant={isVerifiedStage ? 'success' : isBlueActive ? 'accent' : 'default'}
          active={isVerifiedStage || isBlueActive}
          className="rounded-xl overflow-hidden"
        >
          <div
            className={`p-4.5 rounded-xl border flex flex-col justify-between h-full transition-all duration-200 ${
              isVerifiedStage
                ? 'bg-[#1C1C1C] dark:bg-[#1C1C1C] border-white dark:border-white ring-1 ring-white/30 dark:ring-white/30 shadow-lg shadow-black/20'
                : isBlueActive
                ? 'bg-[#181818] dark:bg-[#181818] border-white/30 dark:border-white/30 ring-1 ring-white/15 dark:ring-white/15'
                : 'bg-[#151515] dark:bg-[#151515] border-white/10 dark:border-white/10'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-mono font-bold uppercase text-white dark:text-white tracking-wider flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    {isVerifiedStage && !shouldReduceMotion && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white dark:bg-white opacity-75" />
                    )}
                    <span
                      className="relative inline-flex rounded-full h-2 w-2 bg-white dark:bg-white"
                    />
                  </span>
                  Blue Agent
                </span>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-400 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 px-2 py-0.5 rounded-full aegis-pill">
                  Defense
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white dark:text-white mb-1">
                Mitigation & Retest
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-400 leading-relaxed">
                Applies educational patch/rule diff and executes assertion-specific retesting.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-zinc-400">
              <span>Verification: Named Check</span>
              <span
                className={`font-semibold ${
                  isVerifiedStage
                    ? 'text-white dark:text-white'
                    : isMitigationStage
                    ? 'text-zinc-300 dark:text-zinc-300'
                    : 'text-zinc-500'
                }`}
              >
                {isVerifiedStage
                  ? 'Passed'
                  : isMitigationStage
                  ? 'Mitigated'
                  : 'Pending'}
              </span>
            </div>
          </div>
        </CornerFrame>
      </div>
    </section>
  );
};
