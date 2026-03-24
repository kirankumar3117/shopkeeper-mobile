/**
 * Shop Store — Global shop online/offline state.
 * Shared across Orders, Profile, and ShopHeader so all toggles stay in sync.
 */
import { create } from 'zustand';

interface ShopState {
  isOnline: boolean;
  isTogglingStatus: boolean; // shows loader on the header toggle

  setOnline: (value: boolean) => void;
  setTogglingStatus: (value: boolean) => void;
}

export const useShopStore = create<ShopState>((set) => ({
  isOnline: true,             // optimistic default — loaded from API in orders screen
  isTogglingStatus: false,

  setOnline: (isOnline) => set({ isOnline }),
  setTogglingStatus: (isTogglingStatus) => set({ isTogglingStatus }),
}));
