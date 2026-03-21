/**
 * Product Requests Service
 * Allows merchants to request new products be added to the Master Catalog.
 */

import { apiClient } from '../client';
import type {
    ApiResponse,
    CreateProductRequestPayload,
    PaginatedResponse,
    ProductRequest,
} from '../types';

const REQUESTS_BASE = '/product-requests';

export const productRequestsService = {
  /**
   * Submit a new product request to the admin
   * POST /product-requests/
   */
  requestNewProduct: (data: CreateProductRequestPayload) =>
    apiClient.post<ApiResponse<ProductRequest>>(`${REQUESTS_BASE}/`, data),

  /**
   * Track the status of the merchant's previous product requests
   * GET /product-requests/my-requests
   */
  getMyRequests: () =>
    apiClient.get<PaginatedResponse<ProductRequest>>(`${REQUESTS_BASE}/my-requests`),
};
