import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiClientError } from '../lib/api-client';
import { RunSummaryItem } from '../types/api';

export function useAegisLoop() {
  const queryClient = useQueryClient();
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<ApiClientError | Error | null>(null);

  // 1. Backend Health Query
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 30000,
    retry: 1,
  });

  // 2. Scenario List Query
  const scenariosQuery = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => apiClient.getScenarios(),
    staleTime: 60000,
  });

  // 3. Persisted Run History Query from backend SQLite
  const historyRunsQuery = useQuery({
    queryKey: ['runs', 'history'],
    queryFn: async (): Promise<RunSummaryItem[]> => {
      const res = await apiClient.listRuns(30);
      return res.items;
    },
  });

  // Set default active run from backend history on initial load if available
  useEffect(() => {
    if (!activeRunId && historyRunsQuery.data && historyRunsQuery.data.length > 0) {
      setActiveRunId(historyRunsQuery.data[0].id);
    }
  }, [historyRunsQuery.data, activeRunId]);

  // 4. Active Run Full Detail Query (fetched only for the currently active run)
  const activeRunQuery = useQuery({
    queryKey: ['run', activeRunId],
    queryFn: () => {
      if (!activeRunId) return null;
      return apiClient.getRun(activeRunId);
    },
    enabled: Boolean(activeRunId),
  });

  // 5. Mutation: Create Run
  const createRunMutation = useMutation({
    mutationFn: (scenarioId: string) => apiClient.createRun(scenarioId),
    onSuccess: (newRun) => {
      setLastError(null);
      setActiveRunId(newRun.id);
      queryClient.setQueryData(['run', newRun.id], newRun);
      queryClient.invalidateQueries({ queryKey: ['runs', 'history'] });
    },
    onError: (err: ApiClientError | Error) => {
      setLastError(err);
    },
  });

  // 6. Mutation: Apply Mitigation
  const applyMitigationMutation = useMutation({
    mutationFn: async ({ runId, mitigationId }: { runId: string; mitigationId: string }) => {
      return apiClient.applyMitigation(runId, mitigationId);
    },
    onSuccess: async () => {
      setLastError(null);
      if (activeRunId) {
        // Refetch complete run to reflect persisted state changes
        await queryClient.invalidateQueries({ queryKey: ['run', activeRunId] });
        await queryClient.invalidateQueries({ queryKey: ['runs', 'history'] });
      }
    },
    onError: (err: ApiClientError | Error) => {
      setLastError(err);
    },
  });

  // 7. Mutation: Retest Run
  const retestMutation = useMutation({
    mutationFn: async ({ runId, assertionId }: { runId: string; assertionId: string }) => {
      return apiClient.retestRun(runId, assertionId);
    },
    onSuccess: async () => {
      setLastError(null);
      if (activeRunId) {
        await queryClient.invalidateQueries({ queryKey: ['run', activeRunId] });
        await queryClient.invalidateQueries({ queryKey: ['runs', 'history'] });
      }
    },
    onError: (err: ApiClientError | Error) => {
      setLastError(err);
    },
  });

  // 8. Mutation: Reset Run
  const resetMutation = useMutation({
    mutationFn: async (runId: string) => {
      return apiClient.resetRun(runId);
    },
    onSuccess: (newActiveRun) => {
      setLastError(null);
      setActiveRunId(newActiveRun.id);
      queryClient.setQueryData(['run', newActiveRun.id], newActiveRun);
      queryClient.invalidateQueries({ queryKey: ['runs', 'history'] });
    },
    onError: (err: ApiClientError | Error) => {
      setLastError(err);
    },
  });

  // 9. Mutation: Clear Run History from SQLite
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      return apiClient.clearHistory();
    },
    onSuccess: async () => {
      setLastError(null);
      setActiveRunId(null);
      queryClient.removeQueries({ queryKey: ['run'] });
      await queryClient.invalidateQueries({ queryKey: ['runs', 'history'] });
    },
    onError: (err: ApiClientError | Error) => {
      setLastError(err);
    },
  });

  const historyRuns = historyRunsQuery.data ?? [];
  const runIds = historyRuns.map((r) => r.id);

  return {
    healthQuery,
    scenariosQuery,
    activeRun: activeRunQuery.data ?? null,
    isActiveRunLoading: activeRunQuery.isLoading,
    activeRunError: activeRunQuery.error,
    historyRuns,
    isHistoryLoading: historyRunsQuery.isLoading,
    historyError: historyRunsQuery.error,
    runIds,
    activeRunId,
    setActiveRunId,
    lastError,
    clearError: () => setLastError(null),
    createRun: (scenarioId: string) => createRunMutation.mutate(scenarioId),
    isCreatingRun: createRunMutation.isPending,
    applyMitigation: (mitigationId: string) => {
      if (!activeRunId) return;
      applyMitigationMutation.mutate({ runId: activeRunId, mitigationId });
    },
    isApplyingMitigation: applyMitigationMutation.isPending,
    retestRun: (assertionId: string) => {
      if (!activeRunId) return;
      retestMutation.mutate({ runId: activeRunId, assertionId });
    },
    isRetesting: retestMutation.isPending,
    resetRun: () => {
      if (!activeRunId) return;
      resetMutation.mutate(activeRunId);
    },
    isResetting: resetMutation.isPending,
    clearHistory: () => clearHistoryMutation.mutateAsync(),
    isClearingHistory: clearHistoryMutation.isPending,
    clearHistoryError: clearHistoryMutation.error,
  };
}
