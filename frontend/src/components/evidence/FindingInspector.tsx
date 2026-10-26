import React from 'react';
import { Finding } from '../../types/api';
import { CornerFrame } from '../ui/CornerFrame';

interface FindingInspectorProps {
  finding: Finding;
}

/**
 * Vulnerability finding and synthetic evidence inspector.
 * Renders vulnerability title, severity pill, and code/request snippets
 * in a high-contrast dark telemetry terminal frame.
 */
export const FindingInspector: React.FC<FindingInspectorProps> = ({ finding }) => {
  return (
    <CornerFrame variant="danger" cornerSize={10} className="rounded-xl overflow-hidden">
      <section className="aegis-card rounded-xl p-5 md:p-6 border border-white/10 dark:border-white/10 bg-[#101010] dark:bg-[#101010]">
        {/* Finding Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-[#EF4444] shadow-sm shadow-[#EF4444]/50" />
            <h3 className="text-sm font-bold text-white dark:text-white tracking-tight">
              {finding.title}
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 aegis-pill shrink-0">
            {finding.severity} Severity
          </span>
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-400 leading-relaxed mb-5">
          {finding.summary}
        </p>

        {/* Synthetic Evidence Snippets */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-zinc-400 uppercase tracking-wider font-semibold">
            <span>Synthetic Evidence Items ({finding.evidence.length})</span>
            <span>Deterministic Capture</span>
          </div>

          {finding.evidence.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/10 dark:border-white/10 bg-[#0C0C0C] dark:bg-[#0C0C0C] overflow-hidden text-xs shadow-inner"
            >
              {/* Evidence Topbar with Terminal Dots */}
              <div className="bg-[#151515] dark:bg-[#151515] px-3.5 py-2 border-b border-white/10 dark:border-white/10 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 dark:bg-zinc-600 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 dark:bg-zinc-600 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 dark:bg-zinc-600 inline-block" />
                  </div>
                  <span className="text-zinc-200 dark:text-zinc-200 font-semibold ml-1.5">{item.label}</span>
                </div>
                <span className="text-zinc-300 dark:text-zinc-300 text-[10px] font-semibold uppercase bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 px-2 py-0.5 rounded-full aegis-pill">
                  {item.type}
                </span>
              </div>

              {/* Code Preformatted Content */}
              <pre className="p-3.5 text-[12px] font-mono text-zinc-200 dark:text-zinc-200 leading-relaxed overflow-x-auto whitespace-pre selection:bg-white/20">
                {item.content}
              </pre>

              {/* Snippet Details Strip */}
              {item.details && (
                <div className="bg-[#121212] dark:bg-[#121212] px-3.5 py-2 border-t border-white/10 dark:border-white/10 text-[11px] font-mono text-zinc-400 dark:text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                  {Object.entries(item.details).map(([key, val]) => (
                    <span key={key}>
                      <span className="text-zinc-500">{key}:</span>{' '}
                      <span className="text-zinc-200 dark:text-zinc-200 font-semibold">{String(val)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </CornerFrame>
  );
};
