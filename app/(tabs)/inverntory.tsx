import { ProductCard } from '@/src/components/ProductCard';
import { Plus, Search, X } from 'lucide-react-native'; // Standard Icons
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InventoryScreen() {
  const [search, setSearch] = useState('');
  
  // --- 1. LOCAL DATA STORE (Temporary) ---
  const [products, setProducts] = useState([
    { id: 1, name: 'Aashirvaad Atta', variant: '5kg Pack', price: 245, stock: true },
    { id: 2, name: 'Aashirvaad Atta', variant: '10kg Pack', price: 480, stock: true }, // Variant Example
    { id: 3, name: 'Freedom Oil', variant: '1L Pouch', price: 110, stock: true },
    { id: 4, name: 'Tata Salt', variant: '1kg', price: 28, stock: false },
    { id: 5, name: 'Maggi Noodles', variant: 'Small Packet', price: 14, stock: true },
  ]);

  // --- 2. ADD PRODUCT MODAL STATE ---
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemVariant, setNewItemVariant] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // --- ACTIONS ---

  const handleToggleStock = (id: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: !p.stock } : p));
  };

  const handleUpdatePrice = (id: number, newPrice: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, price: newPrice } : p));
  };

  const handleAddNewProduct = () => {
    if (!newItemName || !newItemPrice) {
      Alert.alert("Missing Info", "Please enter Item Name and Price.");
      return;
    }

    const newProduct = {
      id: Date.now(), // Unique ID based on timestamp
      name: newItemName,
      variant: newItemVariant || 'Standard', // Default if empty
      price: parseFloat(newItemPrice),
      stock: true
    };

    setProducts([newProduct, ...products]); // Add to top
    
    // Reset & Close
    setNewItemName('');
    setNewItemVariant('');
    setNewItemPrice('');
    setAddModalVisible(false);
  };

  // Filter Logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        
        {/* Header */}
        <View className="px-6 pt-4 pb-2 bg-white border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">Inventory</Text>
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

        {/* Product List */}
        <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>
          {filteredProducts.map((item) => (
            <ProductCard 
              key={item.id}
              id={item.id} // Pass ID for tracking
              name={item.name}
              variant={item.variant}
              price={item.price}
              stock={item.stock}
              onToggleStock={() => handleToggleStock(item.id)}
              onUpdatePrice={(newPrice) => handleUpdatePrice(item.id, newPrice)}
            />
          ))}
          <View className="h-24" /> 
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity 
          onPress={() => setAddModalVisible(true)}
          className="absolute bottom-6 right-6 bg-green-600 h-14 w-14 rounded-full items-center justify-center shadow-lg shadow-green-300 z-50"
          activeOpacity={0.9}
        >
          <Plus size={32} color="white" />
        </TouchableOpacity>

      </SafeAreaView>

      {/* --- ADD PRODUCT MODAL --- */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-[60%]">
            
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Add New Item</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} className="bg-gray-100 p-2 rounded-full">
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Form Fields */}
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
                  <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Variant / Quality</Text>
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
              
              <View className="h-10" />
            </ScrollView>
            
          </View>
        </View>
      </Modal>

    </View>
  );
}