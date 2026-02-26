import { clearAllTokens } from '@/src/core/api/tokenStorage';
import type { OnboardingStep, ShopStatus, User } from '@/src/core/api/types';
import { create } from 'zustand';

// Define the shape of our "Brain"
interface AuthState {
  phoneNumber: string;
  isAuthenticated: boolean;
  ownerPin: string | null; 
  
  // API integration fields
  token: string | null;
  user: User | null;

  // Progressive onboarding tracking
  shopId: string | null;
  shopStatus: ShopStatus | null;
  onboardingStep: OnboardingStep | null;

  // Actions
  setPhoneNumber: (phone: string) => void;
  login: () => void;
  logout: () => void;
  
  setOwnerPin: (pin: string | null) => void;
  verifyPin: (inputPin: string) => boolean;

  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setShopId: (id: string | null) => void;
  setShopStatus: (status: ShopStatus | null) => void;
  setOnboardingStep: (step: OnboardingStep | null) => void;
}

// Create the Store
export const useAuthStore = create<AuthState>((set, get) => ({
  phoneNumber: '',
  isAuthenticated: false,
  ownerPin: null, 
  token: null,
  user: null,
  shopId: null,
  shopStatus: null,
  onboardingStep: null,
  
  // Actions
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  
  login: () => set({ isAuthenticated: true }),
  
  logout: () => {
    clearAllTokens();
    set({ 
      phoneNumber: '', 
      isAuthenticated: false, 
      ownerPin: null, 
      token: null,
      user: null,
      shopId: null,
      shopStatus: null,
      onboardingStep: null,
    });
  },
  
  setOwnerPin: (pin) => set({ ownerPin: pin }),
  
  verifyPin: (inputPin) => {
    const { ownerPin } = get();
    return ownerPin === inputPin;
  },

  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setShopId: (shopId) => set({ shopId }),
  setShopStatus: (shopStatus) => set({ shopStatus }),
  setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
}));