import { ProductCard } from '@/src/components/ProductCard';
import { productsService } from '@/src/core/api/services/products';
import { DiscoverProduct } from '@/src/core/api/types';
import { useInventory } from '@/src/core/hooks/useInventory';
import { useInventoryStore } from '@/src/core/inventoryStore';
import { useAuthStore } from '@/src/core/store';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { Camera, CheckCircle2, Package, Plus, Save, Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Keyboard, KeyboardAvoidingView, Modal, PanResponder, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<DiscoverProduct[]>([]);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DiscoverProduct | null>(null);

  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemStock, setNewItemStock] = useState('10');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Auth store for shop_id
  const shopId = useAuthStore((s) => s.shopId);

  // Drag-to-dismiss
  const sheetTranslateY = useRef(new Animated.Value(0)).current;

  // Backdrop opacity: 0.5 at rest → 0 when dragged 300px down
  const backdropOpacity = sheetTranslateY.interpolate({
    inputRange: [0, 300],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) {
          sheetTranslateY.setValue(gs.dy);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80) {
          Animated.timing(sheetTranslateY, {
            toValue: 600,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            // Don't reset translateY here — it causes a 1-frame glitch.
            // It gets reset in openAddSheet / resetAddForm instead.
            setAddSheetVisible(false);
          });
        } else {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
    if (!searchText.trim() || !newItemPrice) {
      Alert.alert('Missing Info', 'Please enter a Product Name and Price.');
      return;
    }

    const price = parseFloat(newItemPrice);
    const stock = parseInt(newItemStock, 10) || 10;

    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    if (selectedProduct) {
      // Existing product from catalog
      const success = await addProduct({
        shop_id: shopId || '',
        product_id: selectedProduct.id,
        productName: selectedProduct.name,
        price,
        stock,
      });

      if (success) {
        resetAddForm();
        setAddSheetVisible(false);
      }
    } else {
      // Custom new product request
      try {
        setIsSubmittingNew(true);
        // Note: We use an empty string or standard URL if no image is captured, 
        // depending on your backend strictness. Assuming it handles base64 or empty gracefully.
        await productsService.createProductRequest({
          name: searchText.trim(),
          price,
          stock,
          image_url: newProductImage || '',
        });
        setIsSubmittingNew(false);
        Alert.alert('Request Sent', 'Your product addition request has been sent to the admin.');
        resetAddForm();
        setAddSheetVisible(false);
      } catch (err: any) {
        setIsSubmittingNew(false);
        Alert.alert('Error', err.message || 'Failed to submit product request');
      }
    }
  };

  const handleSearchTextChange = async (text: string) => {
    setSearchText(text);
    if (selectedProduct && text !== selectedProduct.name) {
      setSelectedProduct(null);
    }

    if (text.length > 2) {
      setIsSearchingProduct(true);
      try {
        const results = await productsService.discoverProducts(text);
        // Map any generic item returned into DiscoverProduct assuming it has id/name/mrp or price
        // The endpoint is expected to return objects shaped appropriately matching types
        setSuggestions((results as any)?.data || results || []);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setIsSearchingProduct(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (item: DiscoverProduct) => {
    setSelectedProduct(item);
    setSearchText(item.name);
    setNewItemPrice(item.mrp?.toString() || '');
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const captureImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to capture images.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      setNewProductImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const resetAddForm = () => {
    setSearchText('');
    setSelectedProduct(null);
    setSuggestions([]);
    setNewProductImage(null);
    setNewItemPrice('');
    sheetTranslateY.setValue(0);
    setNewItemStock('10');
  };

  // ── Open sheet ────────────────────────────────────────────
  const openAddSheet = () => {
    Keyboard.dismiss();
    resetAddForm();
    setAddSheetVisible(true);
  };

  const closeAddSheet = () => {
    Keyboard.dismiss();
    Animated.timing(sheetTranslateY, {
      toValue: 600,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setAddSheetVisible(false);
    });
  };

  // ── Filter Logic ──────────────────────────────────────────
  const filteredProducts = inventory.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(search.toLowerCase());
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="absolute inset-0 justify-end"
            style={{ zIndex: 50 }}
          >

            {/* Backdrop — tap to dismiss, opacity fades with drag */}
            <TouchableWithoutFeedback onPress={closeAddSheet}>
              <Animated.View
                style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' }, { opacity: backdropOpacity }]}
              />
            </TouchableWithoutFeedback>

            {/* Sheet */}
            <Animated.View
              className="bg-white rounded-t-3xl p-6"
              style={{ maxHeight: '70%', transform: [{ translateY: sheetTranslateY }] }}
            >
              {/* Handle bar — draggable */}
              <View {...panResponder.panHandlers} className="items-center pb-4 pt-1">
                <View className="w-10 h-1.5 bg-gray-300 rounded-full" />
              </View>

              {/* Title row */}
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">Add to Inventory</Text>
                <TouchableOpacity onPress={closeAddSheet} className="bg-gray-100 p-2 rounded-full">
                  <X size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 32 }}
              >

                  {/* Product Field */}
                  <View style={{ marginBottom: 20 }}>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-1.5 tracking-wide">
                      Product
                    </Text>
                    <View>
                      <TextInput
                        placeholder="e.g. Aashirvaad Atta"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base font-semibold text-gray-900"
                        value={searchText}
                        onChangeText={handleSearchTextChange}
                        autoCapitalize="words"
                      />
                      {isSearchingProduct && (
                        <View className="absolute right-4 top-3.5">
                          <ActivityIndicator size="small" color="#9CA3AF" />
                        </View>
                      )}
                    </View>

                    {/* Suggestions — rendered outside of input view, no layout shift */}
                    {suggestions.length > 0 && !selectedProduct && (
                      <View
                        className="bg-white border border-gray-200 rounded-xl mt-1 shadow-md overflow-hidden"
                        style={{ maxHeight: 180 }}
                      >
                        <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled bounces={false}>
                          {suggestions.map((item, idx) => (
                            <TouchableOpacity
                              key={item.id || idx}
                              onPress={() => selectSuggestion(item)}
                              className="px-4 py-3 flex-row justify-between items-center"
                              style={{
                                borderBottomWidth: idx < suggestions.length - 1 ? 1 : 0,
                                borderBottomColor: "#F3F4F6",
                              }}
                            >
                              <Text className="text-gray-800 text-sm flex-1 mr-2">{item.name}</Text>
                              <Text className="text-green-700 font-bold text-sm">₹{item.mrp || 0}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* Price Field */}
                  <View style={{ marginBottom: 20 }}>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-1.5 tracking-wide">
                      Price (₹)
                    </Text>
                    <TextInput
                      placeholder="0.00"
                      keyboardType="numeric"
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xl font-bold text-green-700"
                      value={newItemPrice}
                      onChangeText={setNewItemPrice}
                    />
                  </View>

                  {/* Stock Field */}
                  <View style={{ marginBottom: 20 }}>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-1.5 tracking-wide">
                      Starting Stock
                    </Text>
                    <TextInput
                      placeholder="10"
                      keyboardType="numeric"
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xl font-bold text-gray-900"
                      value={newItemStock}
                      onChangeText={setNewItemStock}
                    />
                  </View>

                  {/* New Product Image Upload */}
                  {searchText.length > 0 && !selectedProduct && (
                    <View style={{ marginBottom: 20 }}>
                      <Text className="text-gray-500 font-bold text-xs uppercase mb-1.5 tracking-wide">
                        Product Photo
                      </Text>
                      <TouchableOpacity
                        onPress={captureImage}
                        className="bg-gray-50 border-2 border-dashed border-yellow-400 rounded-xl p-6 items-center justify-center flex-row"
                      >
                        {newProductImage ? (
                          <Image
                            source={{ uri: newProductImage }}
                            style={{ width: "100%", height: 128, borderRadius: 10 }}
                            resizeMode="cover"
                          />
                        ) : (
                          <>
                            <Camera size={28} color="#FBBF24" />
                            <Text className="text-yellow-700 font-bold text-base ml-3">
                              Capture Product Photo
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <Text className="text-xs text-gray-400 mt-2 text-center">
                        New product — upload a photo to request admin approval.
                      </Text>
                    </View>
                  )}

                  {/* Submit Button */}
                  <TouchableOpacity
                    onPress={handleAddNewProduct}
                    disabled={isSubmittingNew}
                    className={`rounded-xl py-4 items-center mt-4 shadow-md ${isSubmittingNew ? "bg-gray-400" : "bg-green-600"
                      }`}
                  >
                    {isSubmittingNew ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-base">Add to Inventory</Text>
                    )}
                  </TouchableOpacity>

                </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
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