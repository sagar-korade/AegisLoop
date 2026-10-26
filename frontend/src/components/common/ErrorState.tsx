import React from 'react';
import { ApiClientError } from '../../lib/api-client';
import { CornerFrame } from '../ui/CornerFrame';

interface ErrorStateProps {
  error: Error | ApiClientError | null;
  onRetry?: () => void;
  title?: string;
}

/**
 * Standardized error envelope presenter with CornerFrame,
 * error code, HTTP status, request ID, and retry action.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  title = 'An Error Occurred',
}) => {
  const isApiError = error instanceof ApiClientError;

  return (
    <CornerFrame variant="danger" cornerSize={10} className="rounded-xl overflow-hidden">
      <div
        role="alert"
        className="rounded-xl border border-[#EF4444]/40 bg-[#181113] p-5 text-xs text-zinc-200 shadow-lg shadow-black/40"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 aegis-pill">
              !
            </div>
            <div>
              <h4 className="font-bold text-[#EF4444] text-sm mb-1">{title}</h4>
              <p className="text-zinc-300 leading-relaxed mb-3">
                {error?.message || 'An unexpected error occurred while communicating with the server.'}
              </p>

              {isApiError && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-[#F59E0B]">
                  <span className="bg-black/40 px-2 py-0.5 rounded border border-white/8 aegis-pill">
                    Code: <code className="text-white font-semibold">{error.code}</code>
                  </span>
                  <span className="bg-black/40 px-2 py-0.5 rounded border border-white/8 aegis-pill">
                    Status: <code className="text-white font-semibold">{error.status}</code>
                  </span>
                  {error.requestId && (
                    <span className="bg-black/40 px-2 py-0.5 rounded border border-white/8 aegis-pill">
                      Request ID: <code className="text-white font-semibold">{error.requestId}</code>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs whitespace-nowrap cursor-pointer transition-all border border-white/10 aegis-pill shrink-0 active:scale-95"
            >
              Retry Action
            </button>
          )}
        </div>
      </div>
    </CornerFrame>
  );
};
