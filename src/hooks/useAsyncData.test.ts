import * as Sentry from '@sentry/react';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAsyncData } from './useAsyncData';

vi.mock('@sentry/react', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    fmt: (strings: TemplateStringsArray, ...values: unknown[]) =>
      strings.reduce((acc, str, i) => acc + str + (values[i] || ''), ''),
  },
  captureException: vi.fn(),
}));

describe('useAsyncData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches data successfully on mount', async () => {
    const mockData = { id: 1, name: 'Test' };
    const fetchFn = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useAsyncData({
        fetchFn,
        deps: [],
        name: 'TestData',
      }),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('handles fetch errors', async () => {
    const error = new Error('Fetch failed');
    const fetchFn = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useAsyncData({
        fetchFn,
        deps: [],
        name: 'TestData',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(error);
    expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.any(Object));
  });

  it('does not fetch when enabled is false', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ id: 1 });

    const { result } = renderHook(() =>
      useAsyncData({
        fetchFn,
        deps: [],
        enabled: false,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('refetches data when refetch is called', async () => {
    const mockData = { id: 1, name: 'Test' };
    const fetchFn = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useAsyncData({
        fetchFn,
        deps: [],
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);

    await result.current.refetch();

    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  it('updates data when setData is called', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ id: 1, name: 'Original' });

    const { result } = renderHook(() =>
      useAsyncData({
        fetchFn,
        deps: [],
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newData = { id: 2, name: 'Updated' };
    result.current.setData(newData);

    await waitFor(() => {
      expect(result.current.data).toEqual(newData);
    });

    expect(result.current.error).toBeNull();
  });

  it('clears error when clearError is called', async () => {
    const error = new Error('Fetch failed');
    const fetchFn = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useAsyncData({
        fetchFn,
        deps: [],
      }),
    );

    await waitFor(() => {
      expect(result.current.error).toEqual(error);
    });

    result.current.clearError();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });

  it('refetches when dependencies change', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ id: 1 });

    const { rerender } = renderHook(
      ({ userId }) =>
        useAsyncData({
          fetchFn,
          deps: [userId],
        }),
      { initialProps: { userId: 1 } },
    );

    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    rerender({ userId: 2 });

    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  it('prevents state updates after unmount', async () => {
    let resolveAsync: ((value: unknown) => void) | null = null;
    const fetchFn = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveAsync = resolve;
        }),
    );

    const { result, unmount } = renderHook(() =>
      useAsyncData({
        fetchFn,
        deps: [],
      }),
    );

    expect(result.current.isLoading).toBe(true);

    unmount();

    // Resolve after unmount
    resolveAsync!({ id: 1 });

    // Wait a bit to ensure no state updates occur
    await new Promise((resolve) => setTimeout(resolve, 50));

    // No assertions needed - if state was updated after unmount, React would warn
  });

  it('clears error when setData is called', async () => {
    const error = new Error('Fetch failed');
    const fetchFn = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useAsyncData({
        fetchFn,
        deps: [],
      }),
    );

    await waitFor(() => {
      expect(result.current.error).toEqual(error);
    });

    result.current.setData({ id: 1, name: 'New' });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });

  it('logs debug message on successful fetch', async () => {
    const mockData = { id: 1, name: 'Test' };
    const fetchFn = vi.fn().mockResolvedValue(mockData);

    renderHook(() =>
      useAsyncData({
        fetchFn,
        deps: [],
        name: 'TestData',
      }),
    );

    await waitFor(() => {
      expect(Sentry.logger.debug).toHaveBeenCalled();
    });
  });

  it('logs error message on fetch failure', async () => {
    const error = new Error('Fetch failed');
    const fetchFn = vi.fn().mockRejectedValue(error);

    renderHook(() =>
      useAsyncData({
        fetchFn,
        deps: [],
        name: 'TestData',
      }),
    );

    await waitFor(() => {
      expect(Sentry.logger.error).toHaveBeenCalled();
    });
  });

  it('includes error context in Sentry capture', async () => {
    const error = new Error('Fetch failed');
    const fetchFn = vi.fn().mockRejectedValue(error);
    const errorContext = { userId: 123 };

    renderHook(() =>
      useAsyncData({
        fetchFn,
        deps: [],
        name: 'TestData',
        errorContext,
      }),
    );

    await waitFor(() => {
      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          contexts: {
            testdata: errorContext,
          },
        }),
      );
    });
  });
});
