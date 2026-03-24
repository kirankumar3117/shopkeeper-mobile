import { create } from 'zustand';
import type { Order } from './api/types';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  
  // Actions
  setOrders: (orders: Order[], pagination?: { total_count: number; total_pages: number; current_page: number }) => void;
  acceptOrder: (id: string, total?: number) => void;
  markReady: (id: string) => void;
  completeOrder: (id: string) => void;
  rejectOrder: (id: string) => void;
  updateTotal: (id: string, total: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,

  // Sync orders from API
  setOrders: (orders, pagination) => set({ 
    orders, 
    isLoading: false, 
    error: null,
    ...(pagination && {
      totalCount: pagination.total_count,
      totalPages: pagination.total_pages,
      currentPage: pagination.current_page,
    }),
  }),

  acceptOrder: (id, total) => set((state) => ({
    orders: state.orders.map((order) => 
      order.id === id 
        ? { ...order, status: 'preparing' as const, total_amount: total || order.total_amount } 
        : order
    )
  })),

  markReady: (id) => set((state) => ({
    orders: state.orders.map((order) => 
      order.id === id ? { ...order, status: 'ready' as const } : order
    )
  })),

  completeOrder: (id) => set((state) => ({
    orders: state.orders.map((order) => 
      order.id === id ? { ...order, status: 'picked_up' as const } : order
    )
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