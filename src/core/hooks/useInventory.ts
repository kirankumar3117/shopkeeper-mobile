/**
 * useInventory — Inventory Management Hook
 * Wraps inventoryService calls with local state management.
 *
 * Usage in Inventory screen:
 *   const { products, loading, fetchProducts, addProduct, toggleStock, saveChanges } = useInventory();
 */

import { inventoryService } from '@/src/core/api/services/inventory';
import type { AddToInventoryRequest, InventoryItem } from '@/src/core/api/types';
import { ApiError } from '@/src/core/api/types';
import { useCallback, useState } from 'react';

interface UseInventoryReturn {
  products: InventoryItem[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  /** Fetch products from API */
  fetchProducts: () => Promise<void>;
  /** Add a new product */
  addProduct: (data: AddToInventoryRequest) => Promise<boolean>;
  /** Toggle stock status (optimistic update) */
  toggleStock: (id: string) => void;
  /** Update a product's price (optimistic update) */
  updatePrice: (id: string, newPrice: number) => void;
  /** Save all changes to API (Promise.all patches) */
  saveChanges: () => Promise<boolean>;
  /** Track whether local edits exist */
  hasUnsavedChanges: boolean;
  clearError: () => void;
}

export function useInventory(): UseInventoryReturn {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track local changes for bulk save
  const [changedProductIds, setChangedProductIds] = useState<Set<string>>(new Set());

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getMyInventory();
      setProducts(response.data);
      setHasUnsavedChanges(false);
      setChangedProductIds(new Set());
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load products';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (data: AddToInventoryRequest): Promise<boolean> => {
    setError(null);
    try {
      const response = await inventoryService.addToInventory(data);
      // Prepend the newly created product
      setProducts(prev => [response.data, ...prev]);
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to add product';
      setError(msg);
      return false;
    }
  }, []);

  const toggleStock = useCallback((id: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, stock: p.stock > 0 ? 0 : 10 } : p))
    );
    setChangedProductIds(prev => new Set(prev).add(id));
    setHasUnsavedChanges(true);
  }, []);

  const updatePrice = useCallback((id: string, newPrice: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, price: newPrice } : p))
    );
    setChangedProductIds(prev => new Set(prev).add(id));
    setHasUnsavedChanges(true);
  }, []);

  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (changedProductIds.size === 0) return true;

    setSaving(true);
    setError(null);
    try {
      const changedProducts = products.filter(p => changedProductIds.has(p.id));
      await Promise.all(
        changedProducts.map(p =>
          inventoryService.updateInventory(p.id, { price: p.price, stock: p.stock })
        )
      );

      setHasUnsavedChanges(false);
      setChangedProductIds(new Set());
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save changes';
      setError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  }, [products, changedProductIds]);

  const clearError = useCallback(() => setError(null), []);

  return {
    products,
    loading,
    saving,
    error,
    fetchProducts,
    addProduct,
    toggleStock,
    updatePrice,
    saveChanges,
    hasUnsavedChanges,
    clearError,
  };
}
