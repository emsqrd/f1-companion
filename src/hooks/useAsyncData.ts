import * as Sentry from '@sentry/react';
import type { DependencyList } from 'react';
import { useCallback, useEffect, useState } from 'react';

interface UseAsyncDataOptions<T> {
  /** Function that fetches the data */
  fetchFn: () => Promise<T>;
  /** Dependencies that trigger refetch */
  deps: DependencyList;
  /** Whether to fetch immediately on mount */
  enabled?: boolean;
  /** Optional name for logging */
  name?: string;
  /** Optional error context for Sentry */
  errorContext?: Record<string, unknown>;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: (data: T) => void;
  clearError: () => void;
}

/**
 * Custom hook for fetching async data with loading, error states, and cleanup.
 * Handles component unmounting gracefully and provides refetch capability.
 *
 * @example
 * ```tsx
 * const { data: team, isLoading, error, refetch } = useAsyncData({
 *   fetchFn: getMyTeam,
 *   deps: [user],
 *   enabled: !!user,
 *   name: 'TeamData',
 * });
 * ```
 */
export function useAsyncData<T>({
  fetchFn,
  deps,
  enabled = true,
  name = 'AsyncData',
  errorContext,
}: UseAsyncDataOptions<T>): UseAsyncDataReturn<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setDataState(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      Sentry.logger.debug(Sentry.logger.fmt`${name} fetched successfully`, { data: result });

      setDataState(result);
      setIsLoading(false);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error(`Failed to fetch ${name}`);
      Sentry.logger.error(Sentry.logger.fmt`${name} fetch error: ${fetchError.message}`);

      setError(fetchError);
      setIsLoading(false);

      Sentry.captureException(fetchError, {
        contexts: {
          [name.toLowerCase()]: errorContext || {},
        },
      });
    }
  }, [fetchFn, enabled, name, errorContext]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!enabled) {
        if (isMounted) {
          setDataState(null);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const result = await fetchFn();
        Sentry.logger.debug(Sentry.logger.fmt`${name} fetched successfully`, { data: result });

        if (isMounted) {
          setDataState(result);
          setIsLoading(false);
        }
      } catch (err) {
        const fetchError = err instanceof Error ? err : new Error(`Failed to fetch ${name}`);
        Sentry.logger.error(Sentry.logger.fmt`${name} fetch error: ${fetchError.message}`);

        if (isMounted) {
          setError(fetchError);
          setIsLoading(false);
        }

        Sentry.captureException(fetchError, {
          contexts: {
            [name.toLowerCase()]: errorContext || {},
          },
        });
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((newData: T) => {
    setDataState(newData);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    setData,
    clearError,
  };
}
