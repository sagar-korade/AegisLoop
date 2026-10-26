import React from 'react';
import { CornerFrame } from '../ui/CornerFrame';

interface ResetModalProps {
  isOpen: boolean;
  runId: string;
  onClose: () => void;
  onConfirm: () => void;
  isResetting: boolean;
}

/**
 * Safe reset confirmation modal.
 * Explains backend persistence consequences, parent marking,
 * and child run succession before execution.
 */
export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  runId,
  onClose,
  onConfirm,
  isResetting,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <CornerFrame variant="danger" cornerSize={12} className="max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-[#101010] dark:bg-[#101010] border border-white/10 dark:border-white/10 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] aegis-pill shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 id="reset-modal-title" className="text-base font-bold text-white dark:text-white tracking-tight">
              Reset Workflow Run?
            </h3>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-400 leading-relaxed mb-4">
            Resetting will mark the current run{' '}
            <code className="text-white dark:text-white font-mono bg-white/5 dark:bg-white/5 px-1.5 py-0.5 rounded border border-white/10 dark:border-white/10 font-semibold">
              {runId}
            </code>{' '}
            as <strong className="text-[#EF4444]">reset</strong> in the SQLite database and initiate a fresh child run linked via{' '}
            <code className="text-zinc-200 dark:text-zinc-200 font-mono font-semibold">reset_of_run_id</code>.
          </p>

          <div className="bg-[#151515] dark:bg-[#151515] border border-white/10 dark:border-white/10 rounded-xl p-3.5 text-[11px] font-mono text-zinc-400 dark:text-zinc-400 mb-6 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[#EF4444]">•</span>
              <span>Original run status becomes <span className="text-zinc-200 dark:text-zinc-200 font-semibold">"reset"</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 dark:text-zinc-400">•</span>
              <span>Ordered audit event appended</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 dark:text-zinc-400">•</span>
              <span>Successor run advances to <span className="text-zinc-200 dark:text-zinc-200 font-semibold">"evidence_ready"</span></span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isResetting}
              className="px-4 py-2 rounded-full bg-white/10 dark:bg-white/10 hover:bg-white/15 dark:hover:bg-white/15 border border-white/10 dark:border-white/10 text-xs font-semibold text-white dark:text-white transition-all cursor-pointer disabled:opacity-50 aegis-pill"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isResetting}
              className="px-4.5 py-2 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 aegis-pill shadow-md shadow-[#EF4444]/25"
            >
              {isResetting ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Confirm Reset</span>
              )}
            </button>
          </div>
        </div>
      </CornerFrame>
    </div>
  );
};
