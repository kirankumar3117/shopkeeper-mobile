/**
 * Orders Service
 * Handles all order-related API calls.
 */

import { apiClient } from '../client';
import type {
    ApiResponse,
    MerchantOrdersResponse,
    Order,
    UpdateOrderRequest,
} from '../types';

export const ordersService = {
  /**
   * Fetch orders for the current merchant (resolved by auth token)
   * GET /orders/merchant?skip=0&limit=20&status=...&order_type=...
   */
  getMerchantOrders: (params?: { skip?: number; limit?: number; status?: string; order_type?: string }) => {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set('skip', params.skip.toString());
    if (params?.limit !== undefined) query.set('limit', params.limit.toString());
    if (params?.status) query.set('status', params.status);
    if (params?.order_type) query.set('order_type', params.order_type);
    const qs = query.toString();
    return apiClient.get<MerchantOrdersResponse>(`/orders/merchant${qs ? `?${qs}` : ''}`);
  },

  /**
   * Get a single order by ID
   * GET /orders/{id}
   */
  getOrderById: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/orders/${id}`),

  /**
   * Update order status and details (e.g. accept, prepare, ready, reject)
   * PATCH /orders/{id}
   */
  updateOrderStatus: (id: string, data: UpdateOrderRequest) =>
    apiClient.patch<ApiResponse<Order>>(`/orders/${id}`, data),
};
