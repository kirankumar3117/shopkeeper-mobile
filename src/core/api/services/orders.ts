/**
 * Orders Service
 * Handles all order-related API calls.
 */

import { apiClient } from '../client';
import type {
    AcceptOrderRequest,
    ApiResponse,
    Order,
    OrderStatus,
    PaginatedResponse,
    RejectOrderRequest,
} from '../types';

const ORDERS_BASE = '/orders';

export const ordersService = {
  /**
   * Fetch orders (optionally filtered by status)
   * GET /orders?status=new
   */
  getOrders: (status?: OrderStatus) => {
    const qs = status ? `?status=${status}` : '';
    return apiClient.get<PaginatedResponse<Order>>(`${ORDERS_BASE}${qs}`);
  },

  /**
   * Get a single order by ID
   * GET /orders/:id
   */
  getOrderById: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`${ORDERS_BASE}/${id}`),

  /**
   * Accept an incoming order (move to 'preparing')
   * PATCH /orders/:id/accept
   */
  acceptOrder: (id: string, data?: AcceptOrderRequest) =>
    apiClient.patch<ApiResponse<Order>>(`${ORDERS_BASE}/${id}/accept`, data),

  /**
   * Mark an order as ready for pickup
   * PATCH /orders/:id/ready
   */
  markReady: (id: string) =>
    apiClient.patch<ApiResponse<Order>>(`${ORDERS_BASE}/${id}/ready`),

  /**
   * Complete an order (customer picked up)
   * PATCH /orders/:id/complete
   */
  completeOrder: (id: string) =>
    apiClient.patch<ApiResponse<Order>>(`${ORDERS_BASE}/${id}/complete`),

  /**
   * Reject an order
   * PATCH /orders/:id/reject
   */
  rejectOrder: (id: string, data?: RejectOrderRequest) =>
    apiClient.patch<ApiResponse<Order>>(`${ORDERS_BASE}/${id}/reject`, data),
};
