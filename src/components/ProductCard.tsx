import React from 'react';
import { Image, Switch, Text, View } from 'react-native';

interface ProductProps {
  name: string;
  price: number;
  stock: boolean;
  image?: string;
  onToggle: () => void;
}

export function ProductCard({ name, price, stock, image, onToggle }: ProductProps) {
  return (
    <View className="flex-row bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm items-center">
      {/* Product Image (Placeholder logic) */}
      <View className="h-16 w-16 bg-gray-100 rounded-xl mr-4 items-center justify-center">
        {image ? (
          <Image source={{ uri: image }} className="h-16 w-16 rounded-xl" />
        ) : (
          <Text className="text-2xl">📦</Text>
        )}
      </View>

      {/* Details */}
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-800">{name}</Text>
        <Text className="text-lg text-green-600 font-bold">₹{price}</Text>
      </View>

      {/* Stock Toggle Switch */}
      <View className="items-center">
        <Switch 
          value={stock} 
          onValueChange={onToggle}
          trackColor={{ false: "#E5E7EB", true: "#DCFCE7" }}
          thumbColor={stock ? "#16A34A" : "#9CA3AF"}
        />
        <Text className={`text-sm mt-1 ${stock ? 'text-green-600' : 'text-red-500'}`}>
          {stock ? 'In Stock' : 'Sold Out'}
        </Text>
      </View>
    </View>
  );
}