import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
// Using Lucide Icons for professional look
import { CheckCircle, Edit2, Package, XCircle } from 'lucide-react-native';

interface ProductCardProps {
  id: string;
  name: string;
  unit?: string;
  price: number;
  stock: number;
  onToggleStock: () => void;
  onUpdatePrice: (newPrice: number) => void;
}

export function ProductCard({
  id, name, unit, price, stock, onToggleStock, onUpdatePrice
}: ProductCardProps) {

  const [isEditing, setIsEditing] = useState(false);
  const [tempPrice, setTempPrice] = useState(price.toString());

  const inStock = stock > 0;

  const handleSave = () => {
    const numPrice = parseFloat(tempPrice);
    if (!isNaN(numPrice)) {
      onUpdatePrice(numPrice);
    }
    setIsEditing(false);
  };

  return (
    <View className="bg-white rounded-xl p-3 mb-3 border border-gray-100 shadow-sm flex-row items-center">

      {/* 1. Image Placeholder */}
      <View className={`h-12 w-12 rounded-lg items-center justify-center mr-3 ${inStock ? 'bg-green-50' : 'bg-gray-100'
        }`}>
        <Package size={24} color={inStock ? "#16A34A" : "#9CA3AF"} />
      </View>

      {/* 2. Product Details */}
      <View className="flex-1 mr-2">
        <Text className={`font-bold text-gray-900 text-base ${!inStock && 'text-gray-400 decoration-slate-400'}`}>
          {name}
        </Text>
        {unit ? (
          <Text className="text-gray-500 text-xs font-medium bg-gray-50 self-start px-2 py-0.5 rounded mt-1">
            {unit}
          </Text>
        ) : null}
      </View>

      {/* 3. Price & Stock Controls */}
      <View className="items-end space-y-2">

        {/* Price Section */}
        {isEditing ? (
          <View className="flex-row items-center bg-white rounded border-2 border-green-500 pl-2 pr-1 h-9">
            <Text className="text-gray-500 text-xs mr-1">₹</Text>
            <TextInput
              value={tempPrice}
              onChangeText={setTempPrice}
              keyboardType="numeric"
              autoFocus
              onBlur={handleSave}
              onSubmitEditing={handleSave}
              selectTextOnFocus
              className="w-12 p-0 text-center text-base font-bold text-gray-900 h-8"
              style={{
                textAlignVertical: 'center',
                includeFontPadding: false,
              }}
            />
            {/* Bigger Save Button */}
            {/* <TouchableOpacity onPress={handleSave} className="bg-green-500 h-7 w-7 items-center justify-center rounded ml-1">
              <Check size={16} color="white" />
            </TouchableOpacity> */}
          </View>
        ) : (
          <TouchableOpacity

            onPress={() => {
              setTempPrice(price.toString());
              setIsEditing(true)
            }
            }
            className="flex-row items-center py-1"
          >
            <Text className="font-bold text-lg text-gray-900 mr-2">₹{price}</Text>
            <View className="bg-gray-100 p-1.5 rounded-full">
              <Edit2 size={12} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Stock Toggle - Increased Padding for better touch */}
        <TouchableOpacity
          onPress={onToggleStock}
          className={`flex-row items-center px-3 py-1.5 rounded-full border ${inStock ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
            }`}
        >
          {inStock ? <CheckCircle size={12} color="#16A34A" /> : <XCircle size={12} color="#EF4444" />}
          <Text className={`text-[10px] font-bold ml-1.5 ${inStock ? 'text-green-700' : 'text-red-500'
            }`}>
            {inStock ? 'IN STOCK' : 'OUT OF STOCK'}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}