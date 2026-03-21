import { MOCK_ORDERS } from '@/src/data/mockData'; // Your static data is just the "Initial State" now
import { create } from 'zustand';
import type { Order } from './api/types';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setOrders: (orders: Order[]) => void;
  acceptOrder: (id: string, total?: number) => void;
  markReady: (id: string) => void;
  completeOrder: (id: string) => void;
  rejectOrder: (id: string) => void;
  updateTotal: (id: string, total: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: MOCK_ORDERS as unknown as Order[],
  isLoading: false,
  error: null,

  // Sync orders from API
  setOrders: (orders) => set({ orders, isLoading: false, error: null }),

  acceptOrder: (id, total) => set((state) => ({
    orders: state.orders.map((order) => 
      order.id === id 
        ? { ...order, status: 'confirmed', total_amount: total || order.total_amount } 
        : order
    )
  })),

  markReady: (id) => set((state) => ({
    orders: state.orders.map((order) => 
      order.id === id ? { ...order, status: 'ready' } : order
    )
  })),

  completeOrder: (id) => set((state) => ({
    // Remove completed orders from the active list (or move to history)
    orders: state.orders.filter((order) => order.id !== id)
  })),

  rejectOrder: (id) => set((state) => ({
    orders: state.orders.filter((order) => order.id !== id)
  })),

  updateTotal: (id, total) => set((state) => ({
    orders: state.orders.map((order) => 
      order.id === id ? { ...order, total_amount: total } : order
    )
  })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));