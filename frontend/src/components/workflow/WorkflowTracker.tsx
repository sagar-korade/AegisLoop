import React from 'react';
import { RunStatus } from '../../types/api';

interface WorkflowTrackerProps {
  status: RunStatus | null;
}

/**
 * Five-stage horizontal workflow tracker directly matching Reference 1:
 * SCENARIO -> EVIDENCE -> MITIGATION -> RETEST -> VERIFICATION.
 * Renders sequential chevron connectors, active electric blue glow, and emerald verification badge.
 */
export const WorkflowTracker: React.FC<WorkflowTrackerProps> = ({ status }) => {
  const isScenarioDone = Boolean(status);
  const isEvidenceDone =
    status === 'mitigation_applied' ||
    status === 'retesting' ||
    status === 'verified';
  const isMitigationDone =
    status === 'mitigation_applied' ||
    status === 'retesting' ||
    status === 'verified';
  const isRetestDone = status === 'verified';
  const isVerified = status === 'verified';
  const isFailed = status === 'verification_failed';

  const stages = [
    {
      id: 'scenario',
      label: 'SCENARIO',
      step: '01',
      isActive: !status || status === 'testing',
      isCompleted: isScenarioDone && status !== 'testing',
    },
    {
      id: 'evidence',
      label: 'EVIDENCE',
      step: '02',
      isActive: status === 'testing' || status === 'evidence_ready',
      isCompleted: isEvidenceDone,
    },
    {
      id: 'mitigation',
      label: 'MITIGATION',
      step: '03',
      isActive: status === 'evidence_ready' || status === 'mitigation_applied',
      isCompleted: isMitigationDone,
    },
    {
      id: 'retest',
      label: 'RETEST',
      step: '04',
      isActive: status === 'mitigation_applied' || status === 'retesting',
      isCompleted: isRetestDone,
    },
    {
      id: 'verification',
      label: 'VERIFICATION',
      step: '05',
      isActive: isVerified || isFailed,
      isCompleted: isVerified,
      isFailure: isFailed,
    },
  ];

  return (
    <div
      aria-label="Workflow Tracker"
      className="w-full bg-[#151515] dark:bg-[#151515] border border-[#303030] dark:border-[#303030] rounded-xl p-3 md:p-4 shadow-lg select-none transition-colors"
    >
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2">
        {stages.map((stage, idx) => {
          const isCurrent = stage.isActive;
          const isDone = stage.isCompleted;

          return (
            <React.Fragment key={stage.id}>
              {/* Step Pill */}
              <div
                className={`flex-1 min-w-[130px] flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-all ${
                  stage.isFailure
                    ? 'bg-[#1C1214] border-[#EF4444] text-[#EF4444] shadow-md shadow-[#EF4444]/15'
                    : isCurrent
                    ? 'bg-[#242424] dark:bg-[#242424] border-white dark:border-white text-white dark:text-white shadow-md ring-1 ring-white/30 dark:ring-white/30'
                    : isDone
                    ? 'bg-white/5 dark:bg-white/5 border-[#525252] dark:border-[#525252] text-zinc-200 dark:text-zinc-200'
                    : 'bg-[#101010] dark:bg-[#101010] border-[#262626] dark:border-[#262626] text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      stage.isFailure
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : isCurrent
                        ? 'bg-white text-black dark:bg-white dark:text-black font-extrabold'
                        : isDone
                        ? 'bg-white/10 dark:bg-white/10 text-white dark:text-white font-semibold'
                        : 'bg-white/5 dark:bg-white/5 text-zinc-500'
                    }`}
                  >
                    {stage.step}
                  </span>
                  <span
                    className={`text-xs font-bold font-mono tracking-wider ${
                      isCurrent
                        ? 'text-white dark:text-white'
                        : isDone
                        ? 'text-zinc-200 dark:text-zinc-200'
                        : 'text-zinc-500 dark:text-zinc-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>

                {/* Status Indicator Icon */}
                <div>
                  {stage.isFailure ? (
                    <span className="text-[10px] font-mono font-bold text-[#EF4444]">✕</span>
                  ) : isDone ? (
                    <svg className="w-4 h-4 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-300 dark:bg-zinc-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white dark:bg-white" />
                    </span>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 dark:bg-zinc-700 inline-block" />
                  )}
                </div>
              </div>

              {/* Chevron Connector */}
              {idx < stages.length - 1 && (
                <div className="hidden lg:flex items-center justify-center px-1 text-zinc-600 dark:text-zinc-600" aria-hidden="true">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
