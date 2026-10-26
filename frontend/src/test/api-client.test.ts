import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient, ApiClientError } from '../lib/api-client';

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    client = new ApiClient('http://localhost:8000');
  });

  it('fetches health status successfully', async () => {
    const mockHealth = { status: 'ok', mode: 'simulation', version: '0.1.0' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHealth,
      headers: new Headers({ 'X-Request-ID': 'req_health_123' }),
    }));

    const res = await client.getHealth();
    expect(res).toEqual(mockHealth);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/health',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          'X-Request-ID': expect.stringMatching(/^req_/),
        }),
      }),
    );
  });

  it('fetches scenarios list', async () => {
    const mockScenarios = {
      items: [
        {
          id: 'sqli_demo_v1',
          name: 'Unsafe Query Construction',
          category: 'injection',
          severity: 'high',
          summary: 'SQL injection fixture',
          mode_support: ['simulation'],
        },
      ],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockScenarios,
      headers: new Headers(),
    }));

    const res = await client.getScenarios();
    expect(res.items).toHaveLength(1);
    expect(res.items[0].id).toBe('sqli_demo_v1');
  });

  it('creates a run successfully', async () => {
    const mockRun = {
      id: 'run_test_01',
      scenario_id: 'sqli_demo_v1',
      mode: 'simulation',
      status: 'evidence_ready',
      events: [],
      finding: { id: 'f1', title: 't', severity: 'high', summary: 's', evidence: [] },
      available_mitigations: [],
      applied_mitigation: null,
      verification: null,
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRun,
      headers: new Headers(),
    }));

    const res = await client.createRun('sqli_demo_v1');
    expect(res.id).toBe('run_test_01');
    expect(res.status).toBe('evidence_ready');
  });

  it('throws ApiClientError with code and request ID on API failure', async () => {
    const errorEnvelope = {
      error: {
        code: 'SCENARIO_NOT_FOUND',
        message: "Scenario 'invalid' was not found.",
        details: null,
        request_id: 'req_err_999',
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => errorEnvelope,
      headers: new Headers({ 'X-Request-ID': 'req_err_999' }),
    }));

    try {
      await client.createRun('invalid');
      expect.fail('Should have thrown an error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect(err.code).toBe('SCENARIO_NOT_FOUND');
      expect(err.status).toBe(404);
      expect(err.message).toBe("Scenario 'invalid' was not found.");
      expect(err.requestId).toBe('req_err_999');
    }
  });

  it('fetches runs history list with limit query parameter', async () => {
    const mockList = {
      items: [
        {
          id: 'run_sqli_001',
          scenario_id: 'sqli_demo_v1',
          mode: 'simulation',
          status: 'verified',
          created_at: '2026-10-25T12:00:00Z',
          updated_at: '2026-10-25T12:01:00Z',
          applied_mitigation_id: 'parameterized_query',
          verification_passed: true,
          reset_of_run_id: null,
          event_count: 5,
        },
      ],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockList,
        headers: new Headers(),
      })
    );

    const res = await client.listRuns(15);
    expect(res.items).toHaveLength(1);
    expect(res.items[0].id).toBe('run_sqli_001');
    expect(res.items[0].event_count).toBe(5);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/runs?limit=15',
      expect.anything()
    );
  });

  it('handles non-JSON HTML proxy errors without dumping raw HTML or stack traces', async () => {
    const htmlProxyError = '<html><body><h1>502 Bad Gateway</h1><p>nginx/1.24.0</p></body></html>';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new SyntaxError('Unexpected token <');
        },
        text: async () => htmlProxyError,
        headers: new Headers({ 'X-Request-ID': 'req_proxy_502' }),
      })
    );

    try {
      await client.listRuns(30);
      expect.fail('Should have thrown ApiClientError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect(err.code).toBe('GATEWAY_ERROR');
      expect(err.status).toBe(502);
      expect(err.message).not.toContain('<html>');
      expect(err.message).not.toContain('nginx');
      expect(err.message).toContain('Backend service is temporarily unavailable');
      expect(err.requestId).toBe('req_proxy_502');
    }
  });

  it('handles non-JSON 500 server error cleanly', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new SyntaxError('Unexpected token I');
        },
        text: async () => 'Internal Server Error',
        headers: new Headers(),
      })
    );

    try {
      await client.getRun('run_test');
      expect.fail('Should have thrown ApiClientError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect(err.code).toBe('SERVER_ERROR');
      expect(err.status).toBe(500);
      expect(err.message).toBe('Internal server error occurred (HTTP 500).');
    }
  });

  it('handles network failure with code NETWORK_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));

    await expect(client.getHealth()).rejects.toThrowError(ApiClientError);
    try {
      await client.getHealth();
    } catch (err: any) {
      expect(err.code).toBe('NETWORK_ERROR');
      expect(err.status).toBe(0);
      expect(err.message).toContain('Unable to connect to AegisLoop backend');
    }
  });

  it('strips redundant /api/v1 suffix from base URL without duplicating path segments', async () => {
    const customClient = new ApiClient('http://localhost:8000/api/v1/');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'ok', mode: 'simulation', version: '0.1.0' }),
        headers: new Headers(),
      })
    );

    await customClient.getHealth();
    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/health', expect.anything());

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
        headers: new Headers(),
      })
    );
    await customClient.listRuns(10);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/runs?limit=10',
      expect.anything()
    );
  });

  it('handles 200 response with malformed JSON as PARSE_ERROR', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token in JSON');
        },
        headers: new Headers({ 'X-Request-ID': 'req_parse_err' }),
      })
    );

    try {
      await client.getHealth();
      expect.fail('Should have thrown ApiClientError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect(err.code).toBe('PARSE_ERROR');
      expect(err.status).toBe(200);
      expect(err.message).toContain('Server returned an invalid JSON response');
      expect(err.requestId).toBe('req_parse_err');
    }
  });

  it('clears run history successfully via DELETE /api/v1/runs', async () => {
    const mockResponse = {
      cleared_count: 3,
      message: 'Successfully cleared 3 run history record(s).',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers({ 'X-Request-ID': 'req_clear_123' }),
      })
    );

    const res = await client.clearHistory();
    expect(res).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/runs',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });
});

