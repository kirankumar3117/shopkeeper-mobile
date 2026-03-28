/**
 * useOrders — Orders Management Hook
 * Wraps ordersService calls and syncs with orderStore.
 *
 * Usage in Orders screen:
 *   const { orders, loading, fetchOrders, accept, markReady, complete, reject } = useOrders();
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
  /** Accept an order (optimistic + API) — moves to 'preparing' */
  accept: (id: string, total?: number, comment?: string) => Promise<boolean>;
  /** Mark order as ready (optimistic + API) */
  markReady: (id: string) => Promise<boolean>;
  /** Complete an order (optimistic + API) — moves to 'picked_up' */
  complete: (id: string) => Promise<boolean>;
  /** Reject an order (optimistic + API) */
  reject: (id: string) => Promise<boolean>;
  /** Update order fields like comment and price independently */
  updateOrderDetails: (id: string, updates: { comment?: string, total_amount?: number }) => Promise<boolean>;
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
      const response = await ordersService.getMerchantOrders({ 
        skip: 0, 
        limit: 50,
        status,
      });
      setOrders(response.data, {
        total_count: response.total_count,
        total_pages: response.total_pages,
        current_page: response.current_page,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load orders';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setOrders]);

  const accept = useCallback(async (id: string, total?: number, comment?: string): Promise<boolean> => {
    // Optimistic update first (could also add comment locally if store supported it)
    optimisticAccept(id, total);
    try {
      await ordersService.updateOrderStatus(id, { 
        status: 'preparing', 
        total_amount: total,
        comment: comment,
      });
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
      await ordersService.updateOrderStatus(id, { status: 'ready' });
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
      await ordersService.updateOrderStatus(id, { status: 'picked_up' });
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to complete order';
      setError(msg);
      await fetchOrders();
      return false;
    }
  }, [optimisticComplete, fetchOrders]);

  const reject = useCallback(async (id: string): Promise<boolean> => {
    optimisticReject(id);
    try {
      await ordersService.updateOrderStatus(id, { status: 'rejected' });
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to reject order';
      setError(msg);
      await fetchOrders();
      return false;
    }
  }, [optimisticReject, fetchOrders]);

  const updateOrderDetails = useCallback(async (id: string, updates: { comment?: string, total_amount?: number }): Promise<boolean> => {
    try {
      // NOTE: We omit 'status' to keep it unchanged if the backend allows partial updates.
      // Or we can fetch the current status? We'll assume the backend allows partial updates.
      await ordersService.updateOrderStatus(id, updates as any);
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update order details';
      setError(msg);
      return false;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    fetchOrders,
    accept,
    markReady,
    complete,
    reject,
    updateOrderDetails,
    clearError,
  };
}
