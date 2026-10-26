import {
  HealthResponse,
  ScenarioListResponse,
  RunResponse,
  RunListResponse,
  ClearHistoryResponse,
  MitigationResponse,
  RetestResponse,
  ExecutionMode,
  ApiErrorEnvelope,
} from '../types/api';

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: any;
  public readonly requestId?: string;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: any,
    requestId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    // In Vite, empty string uses the dev server proxy to avoid CORS issues.
    // Strip trailing slash and trailing /api/v1 to prevent duplicate path segments,
    // since endpoints already include /api/v1 (and /health is at root).
    const raw = (baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');
    this.baseUrl = raw.replace(/\/api\/v1\/?$/, '');
  }

  private generateRequestId(): string {
    return `req_${Math.random().toString(16).slice(2, 10)}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = this.generateRequestId();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Request-ID': requestId,
      ...(options.headers as Record<string, string>),
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(
        'Unable to connect to AegisLoop backend. Verify that the FastAPI server is running.',
        'NETWORK_ERROR',
        0,
        { originalError: err?.message },
        requestId,
      );
    }

    const responseRequestId = response.headers.get('X-Request-ID') || requestId;

    if (!response.ok) {
      let errorBody: ApiErrorEnvelope | null = null;
      try {
        if (typeof response.json === 'function') {
          errorBody = await response.json();
        }
      } catch {
        try {
          if (typeof response.text === 'function') {
            const text = await response.text();
            errorBody = JSON.parse(text);
          }
        } catch {
          // Fallback for non-JSON responses (HTML proxy error pages, gateway timeouts, raw text)
        }
      }

      if (errorBody && errorBody.error) {
        throw new ApiClientError(
          errorBody.error.message || 'An API error occurred.',
          errorBody.error.code || 'API_ERROR',
          response.status,
          errorBody.error.details,
          errorBody.error.request_id || responseRequestId,
        );
      }

      // Non-JSON response: provide clean, helpful description without leaking raw HTML or stack traces
      let cleanMessage: string;
      let errorCode = 'HTTP_ERROR';

      if (response.status === 502 || response.status === 504 || response.status === 503) {
        errorCode = 'GATEWAY_ERROR';
        cleanMessage = `Backend service is temporarily unavailable or gateway error occurred (HTTP ${response.status}).`;
      } else if (response.status >= 500) {
        errorCode = 'SERVER_ERROR';
        cleanMessage = `Internal server error occurred (HTTP ${response.status}).`;
      } else if (response.status === 404) {
        errorCode = 'NOT_FOUND';
        cleanMessage = `The requested endpoint or resource was not found (HTTP 404).`;
      } else if (response.status === 401 || response.status === 403) {
        errorCode = 'ACCESS_DENIED';
        cleanMessage = `Access denied by server (HTTP ${response.status}).`;
      } else {
        cleanMessage = `HTTP request failed with status ${response.status}.`;
      }

      throw new ApiClientError(
        cleanMessage,
        errorCode,
        response.status,
        null,
        responseRequestId,
      );
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiClientError(
        'Server returned an invalid JSON response.',
        'PARSE_ERROR',
        response.status,
        null,
        responseRequestId,
      );
    }
  }

  /** GET /health */
  public async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  /** GET /api/v1/scenarios */
  public async getScenarios(): Promise<ScenarioListResponse> {
    return this.request<ScenarioListResponse>('/api/v1/scenarios');
  }

  /** GET /api/v1/runs?limit={limit} */
  public async listRuns(limit: number = 30): Promise<RunListResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    return this.request<RunListResponse>(`/api/v1/runs?${params.toString()}`);
  }

  /** POST /api/v1/runs */
  public async createRun(
    scenarioId: string,
    mode: ExecutionMode = 'simulation',
  ): Promise<RunResponse> {
    return this.request<RunResponse>('/api/v1/runs', {
      method: 'POST',
      body: JSON.stringify({
        scenario_id: scenarioId,
        mode,
      }),
    });
  }

  /** GET /api/v1/runs/{run_id} */
  public async getRun(runId: string): Promise<RunResponse> {
    return this.request<RunResponse>(`/api/v1/runs/${encodeURIComponent(runId)}`);
  }

  /** POST /api/v1/runs/{run_id}/mitigations */
  public async applyMitigation(
    runId: string,
    mitigationId: string,
  ): Promise<MitigationResponse> {
    return this.request<MitigationResponse>(
      `/api/v1/runs/${encodeURIComponent(runId)}/mitigations`,
      {
        method: 'POST',
        body: JSON.stringify({ mitigation_id: mitigationId }),
      },
    );
  }

  /** POST /api/v1/runs/{run_id}/retest */
  public async retestRun(
    runId: string,
    assertionId: string,
  ): Promise<RetestResponse> {
    return this.request<RetestResponse>(
      `/api/v1/runs/${encodeURIComponent(runId)}/retest`,
      {
        method: 'POST',
        body: JSON.stringify({ assertion_id: assertionId }),
      },
    );
  }

  /** POST /api/v1/runs/{run_id}/reset */
  public async resetRun(runId: string): Promise<RunResponse> {
    return this.request<RunResponse>(
      `/api/v1/runs/${encodeURIComponent(runId)}/reset`,
      {
        method: 'POST',
      },
    );
  }

  /** DELETE /api/v1/runs */
  public async clearHistory(): Promise<ClearHistoryResponse> {
    return this.request<ClearHistoryResponse>('/api/v1/runs', {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
