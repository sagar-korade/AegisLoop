import React from 'react';
import { CornerFrame } from '../ui/CornerFrame';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Empty workspace state.
 * Features corner-bracket framing, subtle radial glow, and clear onboarding call-to-action.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <CornerFrame variant="default" cornerSize={12} className="rounded-xl overflow-hidden">
      <div className="aegis-card rounded-xl p-10 md:p-14 text-center flex flex-col items-center justify-center relative overflow-hidden bg-[#101010] dark:bg-[#101010] border border-white/10 dark:border-white/10">
        {/* Subtle decorative glow */}
        <div
          className="absolute inset-0 bg-radial from-white/5 dark:from-white/5 via-transparent to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#151515] dark:bg-[#151515] border border-white/10 dark:border-white/10 flex items-center justify-center text-white dark:text-white mb-4 text-base font-mono font-bold shadow-inner">
            AL
          </div>

          <h3 className="text-base font-bold text-white dark:text-white tracking-tight mb-2">
            {title}
          </h3>

          <p className="text-xs text-zinc-400 dark:text-zinc-400 max-w-lg leading-relaxed mb-6">
            {description}
          </p>

          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="px-5 py-2.5 rounded-full bg-white dark:bg-white hover:bg-zinc-200 dark:hover:bg-zinc-200 text-black dark:text-black font-bold text-xs transition-all cursor-pointer aegis-pill shadow-lg shadow-black/20 active:scale-95"
            >
              <span>{actionLabel}</span>
              <span className="ml-1.5 font-mono">→</span>
            </button>
          )}
        </div>
      </div>
    </CornerFrame>
  );
};
