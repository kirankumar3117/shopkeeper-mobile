/**
 * useShopStatus — Shop Online/Offline toggle hook
 *
 * Calls PATCH /shops/me/status with { is_online: boolean }
 * and syncs result to the shared shopStore.
 *
 * Usage:
 *   const { isOnline, isToggling, toggleStatus } = useShopStatus();
 */

import { shopService } from '@/src/core/api/services/shop';
import { ApiError } from '@/src/core/api/types';
import { useShopStore } from '@/src/core/shopStore';
import { useCallback } from 'react';
import { Alert } from 'react-native';

interface UseShopStatusReturn {
  isOnline: boolean;
  isToggling: boolean;
  toggleStatus: (value: boolean) => Promise<void>;
}

import { useOrderStore } from '@/src/core/orderStore';

export function useShopStatus(): UseShopStatusReturn {
  const { isOnline, isTogglingStatus, setOnline, setTogglingStatus } = useShopStore();

  const toggleStatus = useCallback(async (value: boolean) => {
    // If trying to go offline, check for pending orders first
    if (!value) {
      const pendingOrders = useOrderStore.getState().orders.filter(o => o.status === 'pending');
      if (pendingOrders.length > 0) {
        Alert.alert(
          'Cannot Go Offline',
          'You have new pending orders. Please accept or reject them before going offline.'
        );
        return;
      }
    }

    // Optimistic update immediately so UI responds fast
    setOnline(value);
    setTogglingStatus(true);

    if (__DEV__) console.log('🔄 ToggleShopStatus: Start', { value });
    try {
      const response = await shopService.updateStatus(value);
      if (__DEV__) console.log('✅ ToggleShopStatus: Success', response);
      // Server confirmed — nothing extra to do, store is already set
    } catch (err) {
      if (__DEV__) console.error('❌ ToggleShopStatus: Failed', err);
      // Rollback on failure
      setOnline(!value);
      const msg = err instanceof ApiError ? err.message : 'Failed to update shop status';
      Alert.alert('Error', msg);
    } finally {
      if (__DEV__) console.log('🏁 ToggleShopStatus: Done');
      setTogglingStatus(false);
    }
  }, [setOnline, setTogglingStatus]);

  return {
    isOnline,
    isToggling: isTogglingStatus,
    toggleStatus,
  };
}
