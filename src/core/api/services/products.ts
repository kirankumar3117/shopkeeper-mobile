import { apiClient } from '../client';
import type { DiscoverProduct, ProductRequestPayload } from '../types';

export const productsService = {
  /**
   * Discover products from the global product-requests pool
   * GET /api/v1/product-requests/discover?skip=0&limit=50&search={search}
   */
  discoverProducts: async (search: string, skip = 0, limit = 50) => {
    const query = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (search) query.set('search', search);

    const response = await apiClient.get<DiscoverProduct[]>(`/product-requests/discover?${query.toString()}`);
    return response || [];
  },

  /**
   * Create a new product request
   * POST /api/v1/product-requests/
   */
  createProductRequest: async (payload: ProductRequestPayload) => {
    return apiClient.post<{ success: boolean; data: any }>('/product-requests/', payload);
  }
};
