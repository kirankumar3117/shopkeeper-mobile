import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
// Using Lucide Icons for professional look
import { CheckCircle, Edit2, Save, XCircle } from 'lucide-react-native';

interface ProductCardProps {
  id: number;
  name: string;
  variant: string; // e.g., "5kg" or "Premium Quality"
  price: number;
  stock: boolean;
  onToggleStock: () => void;
  onUpdatePrice: (newPrice: number) => void;
}

export function ProductCard({ 
  id, name, variant, price, stock, onToggleStock, onUpdatePrice 
}: ProductCardProps) {
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempPrice, setTempPrice] = useState(price.toString());

  const handleSave = () => {
    const numPrice = parseFloat(tempPrice);
    if (!isNaN(numPrice)) {
      onUpdatePrice(numPrice);
    }
    setIsEditing(false);
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm flex-row items-center">
      
      {/* 1. Image Placeholder (Package) */}
      <View className={`h-12 w-12 rounded-lg items-center justify-center mr-4 ${
        stock ? 'bg-green-50' : 'bg-gray-100'
      }`}>
        <Text className="text-2xl">📦</Text>
      </View>

      {/* 2. Product Details */}
      <View className="flex-1">
        <Text className={`font-bold text-gray-900 text-base ${!stock && 'text-gray-400 decoration-slate-400'}`}>
          {name}
        </Text>
        <Text className="text-gray-500 text-xs font-medium bg-gray-50 self-start px-2 py-0.5 rounded mt-1">
          {variant}
        </Text>
      </View>

      {/* 3. Price & Stock Controls */}
      <View className="items-end space-y-2">
        
        {/* Price Section */}
        {isEditing ? (
          <View className="flex-row items-center bg-gray-50 rounded border border-green-200 px-1">
            <Text className="text-gray-500 text-xs mr-1">₹</Text>
            <TextInput 
              value={tempPrice}
              onChangeText={setTempPrice}
              keyboardType="numeric"
              autoFocus
              className="w-12 p-0 text-sm font-bold text-gray-900 h-8"
            />
            <TouchableOpacity onPress={handleSave} className="bg-green-100 p-1 rounded-full ml-1">
              <Save size={12} color="#16A34A" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={() => setIsEditing(true)}
            className="flex-row items-center"
          >
            <Text className="font-bold text-lg text-gray-900 mr-2">₹{price}</Text>
            <Edit2 size={12} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Stock Toggle */}
        <TouchableOpacity 
          onPress={onToggleStock}
          className={`flex-row items-center px-2 py-1 rounded-full ${
            stock ? 'bg-green-100' : 'bg-red-50'
          }`}
        >
          {stock ? <CheckCircle size={10} color="#16A34A" /> : <XCircle size={10} color="#EF4444" />}
          <Text className={`text-[10px] font-bold ml-1 ${
            stock ? 'text-green-700' : 'text-red-500'
          }`}>
            {stock ? 'IN STOCK' : 'OUT OF STOCK'}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}