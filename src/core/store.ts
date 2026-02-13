import { create } from 'zustand';

// Define the shape of our "Brain"
interface AuthState {
  phoneNumber: string;
  isAuthenticated: boolean;
  // 👇 NEW: Owner PIN State (null means no PIN set)
  ownerPin: string | null; 
  
  setPhoneNumber: (phone: string) => void;
  login: () => void;
  logout: () => void;
  
  // 👇 NEW: PIN Actions
  setOwnerPin: (pin: string | null) => void;
  verifyPin: (inputPin: string) => boolean;
}

// Create the Store
export const useAuthStore = create<AuthState>((set, get) => ({
  phoneNumber: '',
  isAuthenticated: false,
  ownerPin: null, // Default: No PIN is set
  
  // Actions
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  
  login: () => set({ isAuthenticated: true }),
  
  // Update logout to clear everything, including PIN
  logout: () => set({ phoneNumber: '', isAuthenticated: false, ownerPin: null }),
  
  // 👇 Set the PIN (or null to remove it)
  setOwnerPin: (pin) => set({ ownerPin: pin }),
  
  // 👇 Verify if the input matches the stored PIN
  verifyPin: (inputPin) => {
    const { ownerPin } = get();
    return ownerPin === inputPin;
  }
}));