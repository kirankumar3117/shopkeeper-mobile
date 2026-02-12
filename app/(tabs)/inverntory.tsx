import { ProductCard } from '@/src/components/ProductCard'; // Import our new component
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InventoryScreen() {
  const [search, setSearch] = useState('');
  
  // Dummy Data for now
  const [products, setProducts] = useState([
    { id: 1, name: 'Aashirvaad Atta (5kg)', price: 245, stock: true },
    { id: 2, name: 'Freedom Oil (1L)', price: 110, stock: true },
    { id: 3, name: 'Tata Salt (1kg)', price: 28, stock: false },
    { id: 4, name: 'Maggi Noodles (Small)', price: 14, stock: true },
    { id: 5, name: 'Red Label Tea (250g)', price: 140, stock: true },
  ]);

  // Handle Stock Toggle
  const toggleStock = (id: number) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, stock: !p.stock } : p
    ));
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-3xl font-bold text-gray-900">My Shop Stock</Text>
          <Text className="text-base text-gray-500">Manage your products & prices</Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 py-4">
          <View className="bg-white border border-gray-200 rounded-xl p-3 flex-row items-center shadow-sm">
            <Text className="mr-2 text-xl">🔍</Text>
            <TextInput 
              placeholder="Search Rice, Oil, Dal..."
              className="flex-1 text-lg"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Product List */}
        <ScrollView className="flex-1 px-6 pt-2">
          <Text className="text-gray-500 font-bold mb-4 uppercase tracking-wider text-sm">
            {products.length} Items Listed
          </Text>

          {products.map((item) => (
            <ProductCard 
              key={item.id}
              name={item.name}
              price={item.price}
              stock={item.stock}
              onToggle={() => toggleStock(item.id)}
            />
          ))}

          <View className="h-24" /> {/* Space for bottom tabs */}
        </ScrollView>

        {/* Floating "Add Product" Button */}
        <TouchableOpacity 
          className="absolute bottom-6 right-6 bg-green-600 h-16 w-16 rounded-full items-center justify-center shadow-2xl shadow-green-400 z-50"
          activeOpacity={0.8}
        >
          <Text className="text-white text-4xl mb-1 font-light">+</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </View>
  );
}