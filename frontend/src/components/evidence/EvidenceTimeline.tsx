import React, { useState } from 'react';
import { RunEvent } from '../../types/api';
import { CornerFrame } from '../ui/CornerFrame';

interface EvidenceTimelineProps {
  events: RunEvent[];
}

/**
 * Monotonic timeline of ordered audit events.
 * Renders each causal event with sequence index, stage beacon,
 * timestamp, and toggleable raw JSON telemetry payload.
 */
export const EvidenceTimeline: React.FC<EvidenceTimelineProps> = ({ events }) => {
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'red_agent':
        return 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/30';
      case 'arena':
        return 'text-zinc-300 dark:text-zinc-300 bg-white/5 dark:bg-white/5 border-white/10 dark:border-white/10';
      case 'blue_agent':
        return 'text-zinc-200 dark:text-zinc-200 bg-white/10 dark:bg-white/10 border-white/20 dark:border-white/20';
      default:
        return 'text-zinc-400 bg-white/5 border-white/10';
    }
  };

  return (
    <CornerFrame variant="default" cornerSize={10} className="rounded-xl overflow-hidden">
      <section aria-label="Event Timeline" className="aegis-card rounded-xl p-5 md:p-6 border border-white/10 dark:border-white/10 bg-[#101010] dark:bg-[#101010]">
        <div className="flex items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-sm font-bold text-white dark:text-white tracking-wider font-mono uppercase">
              Ordered Event History
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 mt-1">
              Append-only, causal timeline persisted in SQLite with monotonic sequencing.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 px-2.5 py-1 rounded-full aegis-pill">
            {events.length} Events Logged
          </span>
        </div>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-px before:bg-gradient-to-b before:from-white/30 dark:before:from-white/30 before:via-white/10 dark:before:via-white/10 before:to-transparent">
          {events.map((evt) => {
            const isExpanded = Boolean(expandedEvents[evt.id]);
            const hasEvidence = Boolean(evt.evidence_json && Object.keys(evt.evidence_json).length > 0);

            return (
              <div
                key={evt.id}
                className="relative pl-7 text-xs flex flex-col justify-start"
              >
                {/* Timeline Node Marker */}
                <div className="absolute left-1 top-2.5 -translate-x-1/2 w-4 h-4 rounded-full bg-[#101010] dark:bg-[#101010] border-2 border-zinc-500 dark:border-zinc-500 flex items-center justify-center shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-200" />
                </div>

                <div className="bg-[#151515] dark:bg-[#151515] hover:bg-[#1C1C1C] dark:hover:bg-[#1C1C1C] border border-white/10 dark:border-white/10 rounded-xl p-3.5 transition-colors duration-150">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-zinc-300 dark:text-zinc-300">
                        #{evt.sequence}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border uppercase aegis-pill ${getStageBadgeColor(
                          evt.stage
                        )}`}
                      >
                        {evt.stage.replace(/_/g, ' ')}
                      </span>
                      <span className="font-semibold text-white dark:text-white tracking-tight">
                        {evt.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400">
                      {formatTime(evt.occurred_at)}
                    </span>
                  </div>

                  <p className="text-zinc-400 dark:text-zinc-400 leading-relaxed">
                    {evt.message}
                  </p>

                  {hasEvidence && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => toggleExpand(evt.id)}
                        className="text-[11px] font-mono text-zinc-300 dark:text-zinc-300 hover:text-white dark:hover:text-white flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <span>{isExpanded ? 'Hide Payload Details ▲' : 'View Payload Details ▼'}</span>
                      </button>

                      {isExpanded && (
                        <pre className="mt-2.5 p-3 rounded-lg bg-[#0C0C0C] dark:bg-[#0C0C0C] border border-white/10 dark:border-white/10 text-[11px] font-mono text-zinc-200 dark:text-zinc-200 overflow-x-auto whitespace-pre selection:bg-white/20 shadow-inner">
                          {JSON.stringify(evt.evidence_json, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </CornerFrame>
  );
};
