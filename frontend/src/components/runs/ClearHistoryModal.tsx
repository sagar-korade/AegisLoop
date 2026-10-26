import React from 'react';
import { CornerFrame } from '../ui/CornerFrame';

interface ClearHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isClearing: boolean;
  error?: Error | null;
}

/**
 * Destructive action confirmation dialog for clearing all persisted run history.
 * Explicitly confirms deletion and ensures user acknowledges irreversible database purge.
 */
export const ClearHistoryModal: React.FC<ClearHistoryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isClearing,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-history-modal-title"
    >
      <CornerFrame variant="danger" cornerSize={12} className="max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-[#101010] border border-white/10 p-6 shadow-2xl">
          {/* Header & Warning Icon */}
          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] aegis-pill shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div>
              <h3 id="clear-history-modal-title" className="text-base font-bold text-white tracking-tight leading-snug">
                Clear all run history? This action cannot be undone.
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                This will permanently delete all persisted simulation runs, ordered timeline events, synthetic evidence, and verification assertions from SQLite.
              </p>
            </div>
          </div>

          {/* Error Banner if deletion failed */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#1C1214] border border-[#EF4444]/40 text-xs text-[#EF4444] flex items-start gap-2">
              <span className="font-bold font-mono">ERROR:</span>
              <span>{error.message || 'Failed to clear run history from backend.'}</span>
            </div>
          )}

          {/* Consequence Highlights */}
          <div className="bg-[#151515] border border-white/10 rounded-xl p-3.5 text-[11px] font-mono text-zinc-400 mb-6 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[#EF4444]">•</span>
              <span>All persisted run records deleted from SQLite</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#EF4444]">•</span>
              <span>Associated event logs and evidence records purged</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-200">•</span>
              <span>Scenarios and simulation fixtures remain preserved</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isClearing}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50 aegis-pill"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isClearing}
              className="px-4.5 py-2 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 aegis-pill shadow-md shadow-[#EF4444]/25"
            >
              {isClearing ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Clearing...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Confirm Clear</span>
                </>
              )}
            </button>
          </div>
        </div>
      </CornerFrame>
    </div>
  );
};
