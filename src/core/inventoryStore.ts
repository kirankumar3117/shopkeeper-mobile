import { create } from "zustand";
import type { InventoryItem } from "./api/types";

interface InventoryState {
    inventory: InventoryItem[];
    isLoading: boolean;
    error: string | null;
    totalCount: number;
    totalPages: number;
    currentPage: number;

    setInventory: (inventory: InventoryItem[], pagination?: { total_count: number; total_pages: number }) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    addItem: (item: InventoryItem) => void;
    updateItem: (id: string, updates: Partial<InventoryItem>) => void;
    removeItem: (id: string) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
    inventory: [],
    isLoading: false,
    error: null,
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,

    setInventory: (inventory, pagination) => {
        console.log("inventory", inventory)
        set({
            inventory,
            totalCount: pagination?.total_count || inventory.length,
            totalPages: pagination?.total_pages || 1,
        })
    },

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    addItem: (item) => set((state) => ({
        inventory: [item, ...state.inventory],
        totalCount: state.totalCount + 1,
    })),

    updateItem: (id, updates) => set((state) => ({
        inventory: state.inventory.map((item) =>
            item.id === id ? { ...item, ...updates } : item
        ),
    })),

    removeItem: (id) => set((state) => ({
        inventory: state.inventory.filter((item) => item.id !== id),
        totalCount: Math.max(0, state.totalCount - 1),
    })),
}));
