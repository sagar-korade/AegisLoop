import React, { useState } from 'react';

interface NavRailProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  historyCount: number;
  onOpenHistory: () => void;
  activeRunId: string | null;
  onResetClick: () => void;
  isResetDisabled: boolean;
  onReplayIntro?: () => void;
  isOnline: boolean;
}

/**
 * Reference 1 Sidebar with Reference 2 Design Tokens.
 * Features full navigation hierarchy: Dashboard, Security Scenarios, Workflow Path,
 * Evidence, Mitigation, Validation Runs, Run History, and Simulation info in permanent dark mode.
 */
export const NavRail: React.FC<NavRailProps> = ({
  activeSection,
  onSectionClick,
  historyCount,
  onOpenHistory,
  activeRunId,
  onResetClick,
  isResetDisabled,
  onReplayIntro,
  isOnline,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    {
      id: 'top',
      label: 'Dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'scenarios',
      label: 'Security Scenarios',
      badge: '2',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'workflow',
      label: 'Workflow Path',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'evidence',
      label: 'Evidence',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'defense',
      label: 'Mitigation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'runs-table',
      label: 'Validation Runs',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      aria-label="Application Rail"
      className="hidden lg:flex flex-col justify-between w-60 bg-[#090909]/95 border-r border-[#303030] backdrop-blur-2xl z-40 fixed left-0 top-0 bottom-0 select-none shadow-2xl transition-colors"
    >
      {/* Top Section: Brand + Search + Navigation */}
      <div className="p-4 flex flex-col gap-4">
        {/* Brand Header */}
        <div
          className="flex items-center gap-3 px-1 py-1 cursor-pointer group"
          onClick={() => onSectionClick('top')}
          title="AegisLoop Security Platform"
        >
          <div className="relative flex items-center justify-center">
            <div className="h-9 w-9 rounded-xl bg-[#151515] border border-white/10 flex items-center justify-center text-white font-mono font-bold text-xs tracking-wider shadow-inner transition-colors">
              AL
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black uppercase tracking-wider text-white text-sm">
                AEGISLOOP
              </span>
              <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-semibold aegis-pill">
                v0.1
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Security Validation
            </p>
          </div>
        </div>

        {/* Quick Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-zinc-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fixtures..."
            className="w-full bg-[#151515] border border-[#303030] hover:border-zinc-500 focus:border-zinc-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all font-sans"
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 mt-1" aria-label="Main Navigation">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 py-1 font-semibold">
            Platform Menu
          </div>

          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionClick(item.id)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/20 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={item.label}
                aria-label={item.label}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-zinc-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold ${
                      isActive
                        ? 'bg-white text-black font-bold'
                        : 'bg-white/10 text-zinc-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Persisted History Trigger Button with Badge */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer mt-1"
            title="Persisted Run History"
            aria-label="Open run history"
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Run History</span>
            </div>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/15 text-[10px] font-mono text-white font-bold border border-white/20">
                {historyCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Bottom Section: Reset, Simulation Mode & Session Status */}
      <div className="p-4 border-t border-[#303030] flex flex-col gap-2.5 bg-[#101010]">
        {/* Simulation Mode Information Card */}
        <div className="p-2.5 rounded-lg bg-[#151515] border border-[#303030] text-[11px] font-mono flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-zinc-200 font-bold uppercase tracking-wider text-[10px]">
              Simulation Mode
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
          </div>
          <p className="text-[10px] text-zinc-400 font-sans leading-tight">
            Loopback Isolation • Zero Outbound Calls
          </p>
        </div>

        {/* Reset Current Run Trigger */}
        {activeRunId && (
          <button
            type="button"
            onClick={onResetClick}
            disabled={isResetDisabled}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-xs font-medium text-[#EF4444] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Reset active run"
            aria-label="Reset active run"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset Active Run</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#EF4444] bg-[#EF4444]/20 px-1.5 py-0.2 rounded">
              RUN
            </span>
          </button>
        )}

        {/* Replay Intro Trigger */}
        {onReplayIntro && (
          <button
            type="button"
            onClick={onReplayIntro}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer"
            title="Replay cinematic intro"
            aria-label="Replay intro"
          >
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Replay Opening</span>
          </button>
        )}

        {/* Session Status Pill */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#151515] border border-[#303030] text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isOnline ? 'bg-zinc-200' : 'bg-[#EF4444]'
              }`}
            />
            <span className="text-zinc-300 font-medium">AEGIS035</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-semibold">
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </aside>
  );
};
