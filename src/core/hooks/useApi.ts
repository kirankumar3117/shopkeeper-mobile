/**
 * useApi — Generic API Hook
 * Encapsulates loading, error, and data state for any API call.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(inventoryService.getProducts);
 *   
 *   useEffect(() => { execute(); }, []);
 */

import { ApiError } from '@/src/core/api/types';
import { useCallback, useState } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T, TArgs extends any[]> extends UseApiState<T> {
  /** Execute the API call */
  execute: (...args: TArgs) => Promise<T | null>;
  /** Reset state to initial values */
  reset: () => void;
  /** Set data manually (for optimistic updates) */
  setData: (data: T | null) => void;
}

/**
 * Generic hook for making API calls with automatic state management.
 * 
 * @param apiFunction - The async API function to wrap
 * @returns Object with data, loading, error, execute, reset, and setData
 * 
 * @example
 * ```tsx
 * const { data: products, loading, error, execute: fetchProducts } = useApi(
 *   inventoryService.getProducts
 * );
 * 
 * useEffect(() => { fetchProducts(); }, []);
 * ```
 */
export function useApi<T, TArgs extends any[] = []>(
  apiFunction: (...args: TArgs) => Promise<T>
): UseApiReturn<T, TArgs> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: TArgs): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const data = await apiFunction(...args);
        setState({ data, loading: false, error: null });
        return data;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'An unexpected error occurred';
        setState(prev => ({ ...prev, loading: false, error: message }));
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}
