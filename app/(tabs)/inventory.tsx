import { ProductCard } from '@/src/components/ProductCard';
import { useInventory } from '@/src/core/hooks/useInventory';
import { useInventoryStore } from '@/src/core/inventoryStore';
import { useFocusEffect } from 'expo-router';
import { CheckCircle2, Package, Plus, Save, Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InventoryScreen() {
  const [search, setSearch] = useState('');

  // ── Hook & Store ──────────────────────────────────────────
  const {
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
  } = useInventory();

  const { inventory } = useInventoryStore();

  // ── UI State ──────────────────────────────────────────────
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');

  // Add form state
  const [newProductId, setNewProductId] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemStock, setNewItemStock] = useState('10');

  // ── Load inventory on mount ───────────────────────────────
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      return () => { /* cleanup if needed */ };
    }, [fetchProducts])
  );

  // ── Show error alerts ─────────────────────────────────────
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  // ── Pull to refresh ───────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  // ── Save handler ──────────────────────────────────────────
  const handleSaveChanges = async () => {
    const success = await saveChanges();
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  // ── Add product handler ───────────────────────────────────
  const handleAddNewProduct = async () => {
    if (!newProductId || !newItemPrice) {
      Alert.alert('Missing Info', 'Please enter Product ID and Price.');
      return;
    }

    const price = parseFloat(newItemPrice);
    const stock = parseInt(newItemStock, 10) || 10;

    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    const success = await addProduct({
      product_id: newProductId.trim(),
      price,
      stock,
    });

    if (success) {
      setNewProductId('');
      setNewItemPrice('');
      setNewItemStock('10');
      setAddSheetVisible(false);
    }
  };

  // ── Open sheet ────────────────────────────────────────────
  const openAddSheet = () => {
    Keyboard.dismiss();
    setAddSheetVisible(true);
  };

  const closeAddSheet = () => {
    Keyboard.dismiss();
    setAddSheetVisible(false);
  };

  // ── Filter Logic ──────────────────────────────────────────
  const filteredProducts = inventory.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStock =
      filter === 'all' ? true : filter === 'in' ? p.stock > 0 : p.stock <= 0;
    return matchesSearch && matchesStock;
  });

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">

        {/* Header */}
        <View className="px-6 pt-4 pb-2 bg-white border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-gray-900">Inventory</Text>
            {hasUnsavedChanges && (
              <View className="bg-orange-100 px-3 py-1 rounded-full">
                <Text className="text-orange-700 text-xs font-bold">Unsaved Changes</Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
            {inventory.length || 0} Products Total
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-3 bg-gray-50">
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center shadow-sm">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search Rice, Oil, Dal..."
              className="flex-1 text-base ml-3 text-gray-900 tracking-tight"
              style={{ letterSpacing: 0 }}
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Filter Chips */}
        <View className="bg-white border-b border-gray-100 pb-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            <TouchableOpacity
              onPress={() => setFilter('all')}
              className={`mr-2 px-4 py-2 rounded-full border ${filter === 'all' ? 'bg-black border-black' : 'bg-white border-gray-300'}`}
            >
              <Text className={`text-xs font-bold ${filter === 'all' ? 'text-white' : 'text-gray-600'}`}>All Items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter('in')}
              className={`mr-2 px-4 py-2 rounded-full border ${filter === 'in' ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}
            >
              <Text className={`text-xs font-bold ${filter === 'in' ? 'text-white' : 'text-gray-600'}`}>In Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter('out')}
              className={`mr-2 px-4 py-2 rounded-full border ${filter === 'out' ? 'bg-red-600 border-red-600' : 'bg-white border-gray-300'}`}
            >
              <Text className={`text-xs font-bold ${filter === 'out' ? 'text-white' : 'text-gray-600'}`}>Out of Stock</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Loading State */}
        {loading && inventory.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#16A34A" />
            <Text className="text-gray-500 mt-3 font-medium">Loading inventory...</Text>
          </View>
        ) : inventory.length === 0 ? (
          /* Empty State */
          <View className="flex-1 justify-center items-center px-8">
            <Package size={64} color="#D1D5DB" />
            <Text className="text-xl font-bold text-gray-400 mt-4">No Products Yet</Text>
            <Text className="text-gray-400 text-center mt-2">
              Add products from the master catalog to start managing your inventory.
            </Text>
            <TouchableOpacity
              onPress={openAddSheet}
              className="bg-green-600 rounded-full px-6 py-3 mt-6 flex-row items-center"
            >
              <Plus size={20} color="white" />
              <Text className="text-white font-bold ml-2">Add First Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Product List */
          <ScrollView
            className="flex-1 px-4 pt-2"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16A34A']} />
            }
          >
            {filteredProducts.length === 0 ? (
              <View className="justify-center items-center py-16">
                <Search size={40} color="#D1D5DB" />
                <Text className="text-gray-400 font-medium mt-3">No matching products</Text>
              </View>
            ) : (
              filteredProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  unit={item.unit}
                  price={item.price}
                  stock={item.stock}
                  onToggleStock={() => toggleStock(item.id)}
                  onUpdatePrice={(newPrice) => updatePrice(item.id, newPrice)}
                />
              ))
            )}
            <View className="h-32" />
          </ScrollView>
        )}

        {/* --- FLOATING ACTION AREA --- */}
        <View className="absolute bottom-6 w-full px-6 flex-row justify-end items-end pointer-events-box-none">

          {/* SAVE CHANGES BUTTON */}
          {hasUnsavedChanges && (
            <TouchableOpacity
              onPress={handleSaveChanges}
              className="flex-1 bg-black mr-4 h-14 rounded-full flex-row items-center justify-center shadow-lg shadow-gray-400"
              activeOpacity={0.9}
            >
              <Save size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>
            </TouchableOpacity>
          )}

          {/* ADD PRODUCT FAB */}
          <TouchableOpacity
            onPress={openAddSheet}
            className="bg-green-600 h-14 w-14 rounded-full items-center justify-center shadow-lg shadow-green-300"
            activeOpacity={0.9}
          >
            <Plus size={32} color="white" />
          </TouchableOpacity>
        </View>

        {/* ── IN-COMPONENT ADD PRODUCT BOTTOM SHEET ─────────────
            Rendered INSIDE SafeAreaView so it overlays the screen
            without an OS-level Modal. The dark backdrop is a View,
            not a system overlay, so no external blur leaks out.     */}
        {isAddSheetVisible && (
          <View className="absolute inset-0 justify-end" style={{ zIndex: 50 }}>

            {/* Backdrop — tap to dismiss */}
            <TouchableWithoutFeedback onPress={closeAddSheet}>
              <View
                className="absolute inset-0 bg-black/50"
              />
            </TouchableWithoutFeedback>

            {/* Sheet */}
            <View
              className="bg-white rounded-t-3xl p-6"
              style={{ maxHeight: '65%' }}
            >
              {/* Handle bar */}
              <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

              {/* Title row */}
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">Add to Inventory</Text>
                <TouchableOpacity onPress={closeAddSheet} className="bg-gray-100 p-2 rounded-full">
                  <X size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View className="space-y-4">
                  <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Product ID</Text>
                    <TextInput
                      placeholder="Enter product ID from catalog"
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base font-semibold text-gray-900"
                      value={newProductId}
                      onChangeText={setNewProductId}
                      autoCapitalize="none"
                    />
                  </View>
                  <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Price (₹)</Text>
                    <TextInput
                      placeholder="0.00"
                      keyboardType="numeric"
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xl font-bold text-green-700"
                      value={newItemPrice}
                      onChangeText={setNewItemPrice}
                    />
                  </View>
                  <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Starting Stock</Text>
                    <TextInput
                      placeholder="10"
                      keyboardType="numeric"
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xl font-bold text-gray-900"
                      value={newItemStock}
                      onChangeText={setNewItemStock}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleAddNewProduct}
                  className="bg-green-600 rounded-xl py-4 items-center mt-8 mb-4 shadow-lg shadow-green-200"
                >
                  <Text className="text-white font-bold text-lg">Add to Inventory</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        )}

      </SafeAreaView>

      {/* --- SAVING OVERLAY (keeps OS Modal since it's a blocking operation) --- */}
      <Modal visible={saving} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="bg-white p-8 rounded-2xl items-center shadow-2xl">
            <ActivityIndicator size="large" color="#16A34A" />
            <Text className="text-lg font-bold text-gray-800 mt-4">Syncing Inventory...</Text>
            <Text className="text-gray-500 text-sm mt-1">Please wait a moment</Text>
          </View>
        </View>
      </Modal>

      {/* --- SUCCESS POPUP --- */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="bg-white p-8 rounded-2xl items-center shadow-2xl scale-110">
            <CheckCircle2 size={50} color="#16A34A" />
            <Text className="text-xl font-bold text-gray-900 mt-4">Updated!</Text>
            <Text className="text-gray-500 text-center mt-1">
              Your inventory is now live on the app.
            </Text>
          </View>
        </View>
      </Modal>

    </View>
  );
}