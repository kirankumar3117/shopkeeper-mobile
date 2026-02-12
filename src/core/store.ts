import { create } from 'zustand';

// Define the shape of our "Brain"
interface AuthState {
  phoneNumber: string;
  isAuthenticated: boolean;
  setPhoneNumber: (phone: string) => void;
  login: () => void;
  logout: () => void;
}

// Create the Store
export const useAuthStore = create<AuthState>((set) => ({
  phoneNumber: '',
  isAuthenticated: false,
  
  // Actions
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ phoneNumber: '', isAuthenticated: false }),
}));