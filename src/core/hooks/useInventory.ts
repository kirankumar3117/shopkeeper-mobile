/**
 * useInventory — Inventory Management Hook
 * Wraps inventoryService calls and syncs with inventoryStore (Zustand).
 * Follows the same pattern as useOrders.
 *
 * Usage in Inventory screen:
 *   const { loading, saving, error, fetchProducts, addProduct, toggleStock,
 *           updatePrice, saveChanges, removeProduct, hasUnsavedChanges, clearError } = useInventory();
 *   const { inventory } = useInventoryStore();
 */

import { inventoryService } from '@/src/core/api/services/inventory';
import type { AddToInventoryRequest } from '@/src/core/api/types';
import { ApiError } from '@/src/core/api/types';
import { useInventoryStore } from '@/src/core/inventoryStore';
import { useCallback, useState } from 'react';

interface UseInventoryReturn {
  loading: boolean;
  saving: boolean;
  error: string | null;
  /** Fetch products from API and sync to store */
  fetchProducts: () => Promise<void>;
  /** Add a new product to inventory via API */
  addProduct: (data: AddToInventoryRequest & { productName?: string }) => Promise<boolean>;
  /** Toggle stock status (optimistic update in store) */
  toggleStock: (id: string) => void;
  /** Update a product's price (optimistic update in store) */
  updatePrice: (id: string, newPrice: number) => void;
  /** Save all pending changes to API */
  saveChanges: () => Promise<boolean>;
  /** Remove a product from inventory via API */
  removeProduct: (id: string) => Promise<boolean>;
  /** Track whether local edits exist */
  hasUnsavedChanges: boolean;
  clearError: () => void;
}

export function useInventory(): UseInventoryReturn {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track which product IDs have been locally modified (for bulk save)
  const [changedProductIds, setChangedProductIds] = useState<Set<string>>(new Set());

  const {
    inventory,
    setInventory,
    addItem,
    updateItem,
    removeItem,
  } = useInventoryStore();

  // ── Fetch all inventory from API ──────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getMyInventory();
      setInventory(response);
      setHasUnsavedChanges(false);
      setChangedProductIds(new Set());
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load products';
      setError(msg);
      console.log("error", err)
    } finally {
      setLoading(false);
    }
  }, [setInventory]);

  // ── Add new product to inventory via API ──────────────────
  const addProduct = useCallback(async (data: AddToInventoryRequest & { productName?: string }): Promise<boolean> => {
    setError(null);
    try {
      await inventoryService.addToInventory({
        shop_id: data.shop_id,
        product_id: data.product_id,
        price: data.price,
        stock: data.stock,
      });
      // Refetch the full inventory to get complete joined data (name, unit, image_url etc.)
      await fetchProducts();
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to add product';
      setError(msg);
      return false;
    }
  }, [fetchProducts]);

  // ── Toggle stock (optimistic — saved on bulk save) ────────
  const toggleStock = useCallback((id: string) => {
    const item = inventory.find(p => p.id === id);
    if (!item) return;
    updateItem(id, { stock: item.stock > 0 ? 0 : 10 });
    setChangedProductIds(prev => new Set(prev).add(id));
    setHasUnsavedChanges(true);
  }, [inventory, updateItem]);

  // ── Update price (optimistic — saved on bulk save) ────────
  const updatePrice = useCallback((id: string, newPrice: number) => {
    updateItem(id, { price: newPrice });
    setChangedProductIds(prev => new Set(prev).add(id));
    setHasUnsavedChanges(true);
  }, [updateItem]);

  // ── Bulk save all changed items via API ───────────────────
  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (changedProductIds.size === 0) return true;

    setSaving(true);
    setError(null);
    try {
      const changedProducts = inventory.filter(p => changedProductIds.has(p.id));
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
  }, [inventory, changedProductIds]);

  // ── Remove product from inventory via API ─────────────────
  const removeProduct = useCallback(async (id: string): Promise<boolean> => {
    // Optimistic removal
    removeItem(id);
    try {
      await inventoryService.removeFromInventory(id);
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to remove product';
      setError(msg);
      // Rollback: re-fetch from server
      await fetchProducts();
      return false;
    }
  }, [removeItem, fetchProducts]);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    saving,
    error,
    fetchProducts,
    addProduct,
    toggleStock,
    updatePrice,
    saveChanges,
    removeProduct,
    hasUnsavedChanges,
    clearError,
  };
}
