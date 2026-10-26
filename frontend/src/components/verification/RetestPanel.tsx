import React from 'react';
import { RunStatus, VerificationResult } from '../../types/api';
import { CornerFrame } from '../ui/CornerFrame';

interface RetestPanelProps {
  status: RunStatus;
  verification: VerificationResult | null;
  onRetest: () => void;
  isRetesting: boolean;
  expectedAssertionId?: string;
}

/**
 * Retest and named assertion verification panel.
 * Evaluates exclusively allowlisted named assertions against the active mitigation.
 * Clearly articulates verification results and scope limitations.
 */
export const RetestPanel: React.FC<RetestPanelProps> = ({
  status,
  verification,
  onRetest,
  isRetesting,
  expectedAssertionId,
}) => {
  const canRetest =
    status === 'mitigation_applied' || status === 'verification_failed';
  const isVerified = status === 'verified' && verification?.passed === true;
  const isFailed =
    status === 'verification_failed' || (verification && !verification.passed);

  return (
    <CornerFrame
      variant={isVerified ? 'success' : isFailed ? 'danger' : 'default'}
      cornerSize={10}
      className="rounded-xl overflow-hidden"
    >
      <section id="verification" className="aegis-card rounded-xl p-5 md:p-6 border border-white/10 dark:border-white/10 bg-[#101010] dark:bg-[#101010]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-sm font-bold text-white dark:text-white tracking-wider font-mono uppercase flex items-center gap-2">
              <span className="text-zinc-400 dark:text-zinc-400 font-mono">04.</span>
              <span>Retest & Verification</span>
              {isVerified && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 dark:bg-white/10 text-white dark:text-white border border-white/20 dark:border-white/20 font-semibold aegis-pill">
                  Verified
                </span>
              )}
              {isFailed && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 font-semibold aegis-pill">
                  Failed
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 mt-1">
              Evaluates only the allowlisted named assertion against the active mitigation.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Assertion Target Box */}
          <div className="bg-[#151515] dark:bg-[#151515] border border-white/10 dark:border-white/10 rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-zinc-400 dark:text-zinc-400 font-medium">Named Assertion:</span>
                <code className="text-xs font-mono text-zinc-200 dark:text-zinc-200 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 px-2.5 py-0.5 rounded-full aegis-pill font-semibold">
                  {verification?.assertion_id || expectedAssertionId || '—'}
                </code>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-400">
                Validates that the specific defensive control is enforced during re-execution.
              </p>
            </div>

            <button
              type="button"
              onClick={onRetest}
              disabled={!canRetest || isRetesting}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-2 whitespace-nowrap aegis-pill active:scale-95 shrink-0 ${
                canRetest
                  ? 'bg-white dark:bg-white hover:bg-zinc-200 dark:hover:bg-zinc-200 text-black dark:text-black shadow-md shadow-black/20'
                  : 'bg-white/5 dark:bg-white/5 text-zinc-500 opacity-50 cursor-not-allowed border border-white/10 dark:border-white/10'
              }`}
            >
              {isRetesting ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Assertion...</span>
                </>
              ) : (
                <span>Retest Named Assertion</span>
              )}
            </button>
          </div>

          {/* Verification Outcome Banner */}
          {verification && (
            <div
              className={`rounded-xl border p-5 transition-all shadow-inner ${
                verification.passed
                  ? 'bg-[#1C1C1C] dark:bg-[#1C1C1C] border-white/30 dark:border-white/30'
                  : 'bg-[#1C1214] dark:bg-[#1C1214] border-[#EF4444]/40'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <span
                  className={`text-sm font-bold tracking-tight flex items-center gap-2 ${
                    verification.passed
                      ? 'text-white dark:text-white'
                      : 'text-[#EF4444]'
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      verification.passed ? 'bg-white dark:bg-white' : 'bg-[#EF4444]'
                    }`}
                  />
                  <span>{verification.passed ? 'Assertion Passed' : 'Assertion Verification Failed'}</span>
                </span>

                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 bg-black/40 dark:bg-black/40 px-2 py-0.5 rounded-full border border-white/10 dark:border-white/10 aegis-pill">
                  Evaluated: {new Date(verification.evaluated_at).toLocaleTimeString()}
                </span>
              </div>

              <p className="text-xs text-zinc-300 dark:text-zinc-300 leading-relaxed mb-4">
                {verification.summary}
              </p>

              {/* Scope Limitations Disclaimer */}
              <div className="pt-3 border-t border-white/10 dark:border-white/10 flex items-start gap-2.5 text-[11px] font-mono">
                <span className="font-bold bg-white/10 dark:bg-white/10 border border-white/20 dark:border-white/20 text-zinc-300 dark:text-zinc-300 px-1.5 py-0.5 rounded aegis-pill shrink-0">
                  NOTE:
                </span>
                <p className="leading-relaxed text-zinc-400 dark:text-zinc-400">
                  {verification.limitations}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </CornerFrame>
  );
};
