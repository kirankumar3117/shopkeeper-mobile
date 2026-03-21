/**
 * Orders Service
 * Handles all order-related API calls.
 */

import { apiClient } from '../client';
import type {
    ApiResponse,
    Order,
    PaginatedResponse,
    UpdateOrderRequest,
} from '../types';

export const ordersService = {
  /**
   * Fetch orders for a shop (optionally filtered by status or type)
   * GET /orders/shop/{shop_id}?status=pending
   */
  getShopOrders: (shopId: string, params?: { status?: string; orderType?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.orderType) query.set('order_type', params.orderType);
    const qs = query.toString();
    return apiClient.get<PaginatedResponse<Order>>(`/orders/shop/${shopId}${qs ? `?${qs}` : ''}`);
  },

  /**
   * Get a single order by ID
   * GET /orders/{id}
   */
  getOrderById: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/orders/${id}`),

  /**
   * Update order status and details (e.g. accept, prepare, ready)
   * PATCH /orders/{id}
   */
  updateOrderStatus: (id: string, data: UpdateOrderRequest) =>
    apiClient.patch<ApiResponse<Order>>(`/orders/${id}`, data),

  /**
   * Get AI suggestions for Chitty (List) orders
   * GET /orders/{id}/suggestions
   */
  getOrderSuggestions: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/orders/${id}/suggestions`),
};
