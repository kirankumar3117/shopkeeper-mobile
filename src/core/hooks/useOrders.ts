/**
 * useOrders — Orders Management Hook
 * Wraps ordersService calls and syncs with orderStore.
 *
 * Usage in Orders screen:
 *   const { orders, loading, fetchOrders, accept, markReady, complete } = useOrders();
 */

import { ordersService } from '@/src/core/api/services/orders';
import type { OrderStatus } from '@/src/core/api/types';
import { ApiError } from '@/src/core/api/types';
import { useOrderStore } from '@/src/core/orderStore';
import { useCallback, useState } from 'react';

interface UseOrdersReturn {
  loading: boolean;
  error: string | null;
  /** Fetch orders from API and sync to store */
  fetchOrders: (status?: OrderStatus) => Promise<void>;
  /** Accept an order (optimistic + API) */
  accept: (id: string, total?: string) => Promise<boolean>;
  /** Mark order as ready (optimistic + API) */
  markReady: (id: string) => Promise<boolean>;
  /** Complete an order (optimistic + API) */
  complete: (id: string) => Promise<boolean>;
  /** Reject an order (optimistic + API) */
  reject: (id: string, reason?: string) => Promise<boolean>;
  clearError: () => void;
}

export function useOrders(): UseOrdersReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    setOrders,
    acceptOrder: optimisticAccept,
    markReady: optimisticReady,
    completeOrder: optimisticComplete,
    rejectOrder: optimisticReject,
  } = useOrderStore();

  const fetchOrders = useCallback(async (status?: OrderStatus) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersService.getOrders(status);
      setOrders(response.data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load orders';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setOrders]);

  const accept = useCallback(async (id: string, total?: string): Promise<boolean> => {
    // Optimistic update first
    optimisticAccept(id, total);
    try {
      await ordersService.acceptOrder(id, total ? { total } : undefined);
      return true;
    } catch (err) {
      // Rollback: re-fetch from server if API fails
      const msg = err instanceof ApiError ? err.message : 'Failed to accept order';
      setError(msg);
      await fetchOrders(); // Rollback
      return false;
    }
  }, [optimisticAccept, fetchOrders]);

  const markReady = useCallback(async (id: string): Promise<boolean> => {
    optimisticReady(id);
    try {
      await ordersService.markReady(id);
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to mark ready';
      setError(msg);
      await fetchOrders();
      return false;
    }
  }, [optimisticReady, fetchOrders]);

  const complete = useCallback(async (id: string): Promise<boolean> => {
    optimisticComplete(id);
    try {
      await ordersService.completeOrder(id);
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to complete order';
      setError(msg);
      await fetchOrders();
      return false;
    }
  }, [optimisticComplete, fetchOrders]);

  const reject = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    optimisticReject(id);
    try {
      await ordersService.rejectOrder(id, reason ? { reason } : undefined);
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to reject order';
      setError(msg);
      await fetchOrders();
      return false;
    }
  }, [optimisticReject, fetchOrders]);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    fetchOrders,
    accept,
    markReady,
    complete,
    reject,
    clearError,
  };
}
