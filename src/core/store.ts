import { clearAllTokens } from '@/src/core/api/tokenStorage';
import type { User } from '@/src/core/api/types';
import { create } from 'zustand';

// Define the shape of our "Brain"
interface AuthState {
  phoneNumber: string;
  isAuthenticated: boolean;
  ownerPin: string | null; 
  
  // Track why we are on the Verify Screen
  verifyPurpose: 'login' | 'register'; 
  verificationMethod: 'otp' | 'agent';

  // API integration fields
  token: string | null;
  user: User | null;

  setPhoneNumber: (phone: string) => void;
  login: () => void;
  logout: () => void;
  
  setOwnerPin: (pin: string | null) => void;
  verifyPin: (inputPin: string) => boolean;

  setVerifyPurpose: (purpose: 'login' | 'register') => void;
  setVerificationMethod: (method: 'otp' | 'agent') => void;

  // API integration actions
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

// Create the Store
export const useAuthStore = create<AuthState>((set, get) => ({
  phoneNumber: '',
  isAuthenticated: false,
  ownerPin: null, 
  verificationMethod: 'otp',
  token: null,
  user: null,
  
  // 👇 Default to 'login' to be safe
  verifyPurpose: 'login', 
  
  // Actions
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  
  login: () => set({ isAuthenticated: true }),
  
  // Update logout to clear everything (including secure tokens)
  logout: () => {
    clearAllTokens(); // Clear from secure storage
    set({ 
      phoneNumber: '', 
      isAuthenticated: false, 
      ownerPin: null, 
      verifyPurpose: 'login',
      token: null,
      user: null,
    });
  },
  
  setOwnerPin: (pin) => set({ ownerPin: pin }),
  
  verifyPin: (inputPin) => {
    const { ownerPin } = get();
    return ownerPin === inputPin;
  },

  setVerifyPurpose: (purpose) => set({ verifyPurpose: purpose }),
  setVerificationMethod: (method) => set({ verificationMethod: method }),

  // API integration actions
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
}));