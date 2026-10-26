import React from 'react';

/**
 * Safety Mode Banner indicating deterministic loopback isolation.
 * Uses restrained emerald/cyan security beacon, fine monochrome border,
 * and traceable truthfulness disclaimers.
 */
export const SafetyModeBanner: React.FC = () => {
  return (
    <div
      className="bg-[#0C0C0C] dark:bg-[#0C0C0C] border-b border-white/10 dark:border-white/10 px-4 py-2 text-xs flex items-center justify-between"
      role="region"
      aria-label="Simulation Safety Disclaimer"
    >
      <div className="max-w-[1720px] mx-auto w-full flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-white/10 dark:bg-white/10 border border-white/20 dark:border-white/20 text-white dark:text-white font-bold text-[10px]">
            i
          </span>
          <span className="text-zinc-400 dark:text-zinc-400 text-xs">
            <strong className="text-white dark:text-white font-semibold">Simulation Mode:</strong> Synthetic purple-team security fixtures. Zero outbound traffic; no production systems or source code are modified.
          </span>
        </div>
        <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-500 flex items-center gap-2.5 sm:gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-400" />
            <span className="text-zinc-300 dark:text-zinc-300">Boundary: Loopback Isolation</span>
          </span>
          <span className="text-zinc-600 dark:text-zinc-600">•</span>
          <span className="text-zinc-400 dark:text-zinc-400">Allowlist Authoritative</span>
        </div>
      </div>
    </div>
  );
};
