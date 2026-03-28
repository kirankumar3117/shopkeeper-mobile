/**
 * Shop Service
 * Handles shop registration, setup, and profile API calls.
 */

import { apiClient } from '../client';
import type {
  ApiResponse,
  RegisterShopRequest,
  RegisterShopResponse,
  Shop,
  ShopDashboardResponse,
} from '../types';

const SHOPS_BASE = '/shops';

export const shopService = {
  /**
   * Get basic shop dashboard info
   * GET /shop/
   */
  getShopDashboard: () =>
    apiClient.get<ShopDashboardResponse>(`/shop/`),
  /**
   * Register a new shop (Step 1)
   * POST /shops/register
   */
  registerShop: (data: RegisterShopRequest) =>
    apiClient.post<ApiResponse<RegisterShopResponse>>(
      `${SHOPS_BASE}/register`,
      data,
      { skipAuth: true }
    ),

  /**
   * Setup shop details with location & images (Step 2)
   * POST /shops/setup
   * Uses multipart/form-data for image uploads
   */
  setupShop: (data: {
    latitude: number;
    longitude: number;
    address: string;
    shopImageUri?: string;
    ownerImageUri?: string;
  }) => {
    const formData = new FormData();

    formData.append('latitude', String(data.latitude));
    formData.append('longitude', String(data.longitude));
    formData.append('address', data.address);

    // Append images if provided
    if (data.shopImageUri) {
      const shopImageName = data.shopImageUri.split('/').pop() || 'shop.jpg';
      formData.append('shop_image', {
        uri: data.shopImageUri,
        name: shopImageName,
        type: 'image/jpeg',
      } as any);
    }

    if (data.ownerImageUri) {
      const ownerImageName = data.ownerImageUri.split('/').pop() || 'owner.jpg';
      formData.append('owner_image', {
        uri: data.ownerImageUri,
        name: ownerImageName,
        type: 'image/jpeg',
      } as any);
    }

    return apiClient.upload<ApiResponse<Shop>>(
      `${SHOPS_BASE}/setup`,
      formData
    );
  },

  /**
   * Get the current shop profile
   * GET /shops/me
   */
  getProfile: () =>
    apiClient.get<ApiResponse<Shop>>(`${SHOPS_BASE}/me`),

  /**
   * Update shop online/offline status
   * PATCH /shops/me/status
   */
  updateStatus: (isOnline: boolean) =>
    apiClient.patch<ApiResponse<Shop>>(`/shop/`, { is_online: isOnline }),

  /**
   * Update shop profile details
   * PATCH /shops/me
   */
  updateProfile: (data: Partial<Shop>) =>
    apiClient.patch<ApiResponse<Shop>>(`${SHOPS_BASE}/me`, data),
};
