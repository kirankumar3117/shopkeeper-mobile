/**
 * Inventory & Master Catalog Service
 * Handles product catalog browsing and shop inventory management.
 */

import { apiClient } from '../client';
import type {
  AddToInventoryRequest,
  ApiResponse,
  InventoryItem,
  MasterProduct,
  PaginatedResponse,
  UpdateInventoryRequest,
} from '../types';

export const inventoryService = {
  // ─── Master Catalog ────────────────────────────────────

  /**
   * Browse master catalog products
   * GET /products/?search=...&limit=50
   */
  getMasterProducts: (params?: { search?: string; category_id?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category_id) query.set('category_id', params.category_id);
    if (params?.limit) query.set('limit', String(params.limit));

    // As per guide: Do NOT pass available_only=true so the merchant sees all master products.
    const qs = query.toString();
    return apiClient.get<PaginatedResponse<MasterProduct>>(
      `/products/${qs ? `?${qs}` : ''}`
    );
  },

  // ─── Shop Inventory ────────────────────────────────────

  /**
   * Get all products the merchant is currently selling
   * GET /inventory/my-inventory
   */
  getMyInventory: () =>
    apiClient.get<InventoryItem[]>('/inventory/merchant'),

  /**
   * Add a product from master catalog to shop inventory
   * POST /inventory/
   */
  addToInventory: (data: AddToInventoryRequest) =>
    apiClient.post<ApiResponse<InventoryItem>>('/inventory/', data),

  /**
   * Update price and/or stock of an existing inventory item
   * PATCH /inventory/{inventory_id}
   */
  updateInventory: (inventoryId: string, data: UpdateInventoryRequest) =>
    apiClient.patch<ApiResponse<InventoryItem>>(`/inventory/${inventoryId}`, data),

  /**
   * Remove product from shop inventory
   * DELETE /inventory/{inventory_id}
   */
  removeFromInventory: (inventoryId: string) =>
    apiClient.delete<ApiResponse<null>>(`/inventory/${inventoryId}`),
};
