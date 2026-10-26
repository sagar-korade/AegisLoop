import React from 'react';
import { HealthResponse } from '../../types/api';

interface TopBarProps {
  health: HealthResponse | null;
  healthLoading: boolean;
  healthError: boolean;
  historyCount: number;
  onOpenHistory: () => void;
  activeRunId: string | null;
  onResetClick: () => void;
  isResetDisabled: boolean;
  onReplayIntro?: () => void;
}

/**
 * Premium cybersecurity SaaS top header navigation dock.
 * Features translucent monochrome glass styling, persistent AEGISLOOP wordmark,
 * simulation-mode indicator, and real backend telemetry in permanent dark mode.
 */
export const TopBar: React.FC<TopBarProps> = ({
  health,
  healthLoading,
  healthError,
  historyCount,
  onOpenHistory,
  activeRunId,
  onResetClick,
  isResetDisabled,
  onReplayIntro,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-6 lg:px-10 pt-3.5 pb-2.5 backdrop-blur-xl bg-[#090909]/85 border-b border-[#303030] transition-all">
      <div className="max-w-[1720px] w-full mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo (Permanent top-left anchor for AEGISLOOP wordmark) */}
        <div className="flex items-center gap-3">
          <div className="relative group flex items-center justify-center">
            <div className="h-9 w-9 rounded-lg bg-[#151515] border border-white/10 flex items-center justify-center text-white font-mono font-bold text-xs tracking-wider shadow-inner transition-colors">
              AL
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black uppercase tracking-wider text-white text-sm md:text-base">
                AegisLoop
              </span>
              <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">/</span>
              <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">Dashboard Scene</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-semibold aegis-pill">
                v0.1.0
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 hidden sm:block tracking-normal">
              Security Validation • Controlled Purple-Team Simulation
            </p>
          </div>
        </div>

        {/* System & Mode Controls Dock */}
        <div className="flex items-center gap-2 sm:gap-2.5 bg-[#151515] p-1.5 rounded-full border border-[#303030] shadow-xl backdrop-blur-md">
          {/* Mode Pill Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-white aegis-pill"
            title="Isolated Simulation Environment"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-200" />
            </span>
            <span className="font-semibold tracking-wide">SIMULATION</span>
          </div>

          {/* Backend Connectivity Status Pill */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono aegis-pill"
            title={healthError ? 'Backend offline' : 'Backend online'}
          >
            <span
              className={`h-2 w-2 rounded-full transition-colors ${
                healthLoading
                  ? 'bg-zinc-400 animate-pulse'
                  : healthError
                  ? 'bg-[#EF4444]'
                  : 'bg-zinc-200'
              }`}
            />
            <span className="text-zinc-400 hidden md:inline">Backend:</span>
            <span className="text-zinc-200 font-medium">
              {healthLoading ? 'Connecting...' : healthError ? 'Offline' : 'Online'}
            </span>
          </div>

          {/* Replay Intro Button */}
          {onReplayIntro && (
            <button
              type="button"
              onClick={onReplayIntro}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 transition-all cursor-pointer aegis-pill active:scale-95"
              title="Replay AegisLoop Opening Sequence"
            >
              <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden lg:inline text-[11px]">Intro</span>
            </button>
          )}

          {/* History Drawer Trigger Pill */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-200 transition-all cursor-pointer aegis-pill active:scale-95"
            aria-label="View run history"
          >
            <svg
              className="w-3.5 h-3.5 text-zinc-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/15 text-[10px] font-mono text-white font-semibold border border-white/20">
                {historyCount}
              </span>
            )}
          </button>

          {/* Reset Action */}
          {activeRunId && (
            <button
              type="button"
              onClick={onResetClick}
              disabled={isResetDisabled}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EF4444]/15 hover:bg-[#EF4444]/25 border border-[#EF4444]/30 hover:border-[#EF4444]/50 text-xs font-medium text-[#EF4444] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer aegis-pill active:scale-95"
              title="Reset current run"
            >
              <svg
                className="w-3.5 h-3.5 text-[#EF4444]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Reset Run</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
