/**
 * Shop Store — Global shop online/offline state.
 * Shared across Orders, Profile, and ShopHeader so all toggles stay in sync.
 */
import { create } from 'zustand';
import { ShopDashboardResponse } from './api/types';

interface ShopState {
  isOnline: boolean;
  isTogglingStatus: boolean; // shows loader on the header toggle
  dashboardData: ShopDashboardResponse | null;

  setOnline: (value: boolean) => void;
  setTogglingStatus: (value: boolean) => void;
  setDashboardData: (data: ShopDashboardResponse | null) => void;
}

export const useShopStore = create<ShopState>((set) => ({
  isOnline: true,             // optimistic default — loaded from API in orders screen
  isTogglingStatus: false,
  dashboardData: null,

  setOnline: (isOnline) => set({ isOnline }),
  setTogglingStatus: (isTogglingStatus) => set({ isTogglingStatus }),
  setDashboardData: (dashboardData) => set({ dashboardData }),
}));
