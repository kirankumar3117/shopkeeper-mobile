import { create } from 'zustand';

// Define the shape of our "Brain"
interface AuthState {
  phoneNumber: string;
  isAuthenticated: boolean;
  ownerPin: string | null; 
  
  // 👇 NEW: Track why we are on the Verify Screen
  verifyPurpose: 'login' | 'register'; 

  setPhoneNumber: (phone: string) => void;
  login: () => void;
  logout: () => void;
  
  setOwnerPin: (pin: string | null) => void;
  verifyPin: (inputPin: string) => boolean;

  // 👇 NEW: Action to update the purpose
  setVerifyPurpose: (purpose: 'login' | 'register') => void;
}

// Create the Store
export const useAuthStore = create<AuthState>((set, get) => ({
  phoneNumber: '',
  isAuthenticated: false,
  ownerPin: null, 
  
  // 👇 Default to 'login' to be safe
  verifyPurpose: 'login', 
  
  // Actions
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  
  login: () => set({ isAuthenticated: true }),
  
  // Update logout to clear everything
  logout: () => set({ 
    phoneNumber: '', 
    isAuthenticated: false, 
    ownerPin: null, 
    verifyPurpose: 'login' 
  }),
  
  setOwnerPin: (pin) => set({ ownerPin: pin }),
  
  verifyPin: (inputPin) => {
    const { ownerPin } = get();
    return ownerPin === inputPin;
  },

  // 👇 The new action we will use in Login/Register screens
  setVerifyPurpose: (purpose) => set({ verifyPurpose: purpose }),
}));