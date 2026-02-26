/**
 * Inventory Service
 * Handles all product/inventory-related API calls.
 */

import { apiClient } from '../client';
import type {
    ApiResponse,
    BulkUpdateProductsRequest,
    CreateProductRequest,
    PaginatedResponse,
    Product,
    UpdateProductRequest,
} from '../types';

const INVENTORY_BASE = '/inventory/products';

export const inventoryService = {
  /**
   * Fetch all products for the current shop
   * GET /inventory/products
   */
  getProducts: (params?: { search?: string; inStock?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.inStock !== undefined) query.set('in_stock', String(params.inStock));
    const qs = query.toString();
    return apiClient.get<PaginatedResponse<Product>>(
      `${INVENTORY_BASE}${qs ? `?${qs}` : ''}`
    );
  },

  /**
   * Add a new product
   * POST /inventory/products
   */
  addProduct: (data: CreateProductRequest) =>
    apiClient.post<ApiResponse<Product>>(INVENTORY_BASE, data),

  /**
   * Update a product (price, name, variant, etc.)
   * PATCH /inventory/products/:id
   */
  updateProduct: (id: number, data: UpdateProductRequest) =>
    apiClient.patch<ApiResponse<Product>>(`${INVENTORY_BASE}/${id}`, data),

  /**
   * Toggle stock status for a product
   * PATCH /inventory/products/:id/stock
   */
  toggleStock: (id: number, inStock: boolean) =>
    apiClient.patch<ApiResponse<Product>>(`${INVENTORY_BASE}/${id}/stock`, {
      stock: inStock,
    }),

  /**
   * Bulk update multiple products at once (for the "Save Changes" flow)
   * PUT /inventory/products/bulk
   */
  bulkUpdate: (data: BulkUpdateProductsRequest) =>
    apiClient.put<ApiResponse<{ updated: number }>>(`${INVENTORY_BASE}/bulk`, data),

  /**
   * Delete a product
   * DELETE /inventory/products/:id
   */
  deleteProduct: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`${INVENTORY_BASE}/${id}`),
};
