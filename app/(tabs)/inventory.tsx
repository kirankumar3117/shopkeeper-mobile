import { ProductCard } from '@/src/components/ProductCard';
import { CheckCircle2, Plus, Save, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InventoryScreen() {
  const [search, setSearch] = useState('');
  
  // --- 1. DATA STATE ---
  const [products, setProducts] = useState([
    { id: 1, name: 'Aashirvaad Atta', variant: '5kg Pack', price: 245, stock: true },
    { id: 2, name: 'Aashirvaad Atta', variant: '10kg Pack', price: 480, stock: true },
    { id: 3, name: 'Freedom Oil', variant: '1L Pouch', price: 110, stock: true },
    { id: 4, name: 'Tata Salt', variant: '1kg', price: 28, stock: false },
    { id: 5, name: 'Maggi Noodles', variant: 'Small Packet', price: 14, stock: true },
  ]);

  // --- 2. UI STATE ---
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false); // 👈 Tracks edits
  const [isSaving, setIsSaving] = useState(false); // 👈 Tracks loading state
  const [showSuccess, setShowSuccess] = useState(false); // 👈 Tracks success popup

  // Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemVariant, setNewItemVariant] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');

  // --- ACTIONS ---

  const handleToggleStock = (id: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: !p.stock } : p));
    setUnsavedChanges(true); // 👈 Mark as modified
  };

  const handleUpdatePrice = (id: number, newPrice: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, price: newPrice } : p));
    setUnsavedChanges(true); // 👈 Mark as modified
  };

  const handleAddNewProduct = () => {
    if (!newItemName || !newItemPrice) {
      Alert.alert("Missing Info", "Please enter Item Name and Price.");
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: newItemName,
      variant: newItemVariant || 'Standard',
      price: parseFloat(newItemPrice),
      stock: true
    };

    setProducts([newProduct, ...products]);
    setNewItemName('');
    setNewItemVariant('');
    setNewItemPrice('');
    setAddModalVisible(false);
    setUnsavedChanges(true); // Adding item is also a change
  };

  // --- SAVE LOGIC ---
  const handleSaveChanges = () => {
    setIsSaving(true);

    // Simulate API Call (2 Seconds)
    setTimeout(() => {
      setIsSaving(false);
      setUnsavedChanges(false); // Reset changes tracker
      
      // Show Success Message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000); // Hide after 2s
    }, 2000);
  };

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStock = filter === 'all' 
      ? true 
      : filter === 'in' ? p.stock : !p.stock;
    return matchesSearch && matchesStock;
  });

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        
        {/* Header */}
        <View className="px-6 pt-4 pb-2 bg-white border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-gray-900">Inventory</Text>
            {/* Tiny Indicator if changes exist */}
            {unsavedChanges && (
              <View className="bg-orange-100 px-3 py-1 rounded-full">
                <Text className="text-orange-700 text-xs font-bold">Unsaved Changes</Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
            {products.length} Products Total
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-3 bg-gray-50">
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center shadow-sm">
            <Search size={20} color="#9CA3AF" />
            <TextInput 
              placeholder="Search Rice, Oil, Dal..."
              className="flex-1 text-base ml-3 text-gray-900"
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

        {/* Product List */}
        <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>
          {filteredProducts.map((item) => (
            <ProductCard 
              key={item.id}
              id={item.id}
              name={item.name}
              variant={item.variant}
              price={item.price}
              stock={item.stock}
              onToggleStock={() => handleToggleStock(item.id)}
              onUpdatePrice={(newPrice) => handleUpdatePrice(item.id, newPrice)}
            />
          ))}
          {/* Extra padding at bottom for the floating buttons */}
          <View className="h-32" /> 
        </ScrollView>

        {/* --- FLOATING ACTION AREA --- */}
        <View className="absolute bottom-6 w-full px-6 flex-row justify-end items-end pointer-events-box-none">
          
          {/* 1. SAVE CHANGES BUTTON (Only appears when needed) */}
          {unsavedChanges && (
            <TouchableOpacity 
              onPress={handleSaveChanges}
              className="flex-1 bg-black mr-4 h-14 rounded-full flex-row items-center justify-center shadow-lg shadow-gray-400"
              activeOpacity={0.9}
            >
              <Save size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>
            </TouchableOpacity>
          )}

          {/* 2. ADD PRODUCT BUTTON */}
          <TouchableOpacity 
            onPress={() => setAddModalVisible(true)}
            className="bg-green-600 h-14 w-14 rounded-full items-center justify-center shadow-lg shadow-green-300"
            activeOpacity={0.9}
          >
            <Plus size={32} color="white" />
          </TouchableOpacity>
        </View>

      </SafeAreaView>

      {/* --- ADD PRODUCT MODAL --- */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-[60%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Add New Item</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} className="bg-gray-100 p-2 rounded-full">
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-4">
                <View>
                  <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Item Name</Text>
                  <TextInput 
                    placeholder="e.g. Basmati Rice"
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-lg font-semibold"
                    value={newItemName}
                    onChangeText={setNewItemName}
                  />
                </View>
                <View>
                  <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Variant</Text>
                  <TextInput 
                    placeholder="e.g. Premium 1kg"
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
                    value={newItemVariant}
                    onChangeText={setNewItemVariant}
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
              </View>
              <TouchableOpacity 
                onPress={handleAddNewProduct}
                className="bg-green-600 rounded-xl py-4 items-center mt-8 shadow-lg shadow-green-200"
              >
                <Text className="text-white font-bold text-lg">Add to Inventory</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- LOADING / SAVING OVERLAY --- */}
      <Modal visible={isSaving} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="bg-white p-8 rounded-2xl items-center shadow-2xl">
            <ActivityIndicator size="large" color="#16A34A" />
            <Text className="text-lg font-bold text-gray-800 mt-4">Syncing Inventory...</Text>
            <Text className="text-gray-500 text-sm mt-1">Please wait moment</Text>
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