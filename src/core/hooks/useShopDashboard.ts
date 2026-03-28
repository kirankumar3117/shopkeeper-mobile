import { useCallback, useState } from 'react';
import { shopService } from '@/src/core/api/services/shop';
import { ApiError } from '@/src/core/api/types';
import { useShopStore } from '@/src/core/shopStore';

export function useShopDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { dashboardData, setDashboardData } = useShopStore();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await shopService.getShopDashboard();
      // Using .data if the response wraps it in ApiResponse, or directly if the type is unnested.
      // Based on typical apiClient setup, it unwraps, or maybe it doesn't.
      // E.g., shopService.updateStatus returns apiClient.put<ApiResponse<Shop>>
      // But getShopDashboard returns apiClient.get<ShopDashboardResponse>.
      // Let's assume the client returns ApiResponse unwrapped if the Type is unnested, or it's wrapped.
      // The user type config in `shop.ts` uses `apiClient.get<ApiResponse<Shop>>` for `getProfile`.
      // I added getShopDashboard as `apiClient.get<ShopDashboardResponse>`.
      // If the backend returns { shop_name, ... } directly, this is fine.
      // Wait, let's type assertion to be safe:
      const data = (response as any).data ? (response as any).data : response;
      setDashboardData(data);
    } catch (err) {
      if (__DEV__) console.error('❌ fetchDashboard Failed', err);
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch dashboard';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    fetchDashboard,
  };
}
