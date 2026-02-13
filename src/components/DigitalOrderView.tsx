import { CheckCircle, ShoppingBag } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface DigitalListProps {
  items: any[];
  status: string;
}

export function DigitalOrderView({ items, status }: DigitalListProps) {
  const [packedItems, setPackedItems] = useState<Record<number, boolean>>({});

  const togglePack = (id: number) => {
    // 🔒 CONSTRAINT: Only allow checking boxes if status is 'preparing'
    if (status === 'preparing') {
      setPackedItems(prev => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const calculateTotal = () => items.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <View className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <View className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex-row items-center">
        <ShoppingBag size={18} color="#4B5563" />
        <Text className="ml-2 font-bold text-gray-700">Item Checklist</Text>
      </View>
      
      {items.map((item) => {
        const isPacked = packedItems[item.id];
        const canCheck = status === 'preparing';

        return (
          <TouchableOpacity 
            key={item.id}
            onPress={() => togglePack(item.id)}
            activeOpacity={canCheck ? 0.7 : 1}
            className={`flex-row justify-between items-center p-4 border-b border-gray-100 ${isPacked ? 'bg-green-50' : 'bg-white'}`}
          >
            <View className="flex-row items-center flex-1">
              
              {/* CHECKBOX: Only visible for 'preparing' */}
              {status === 'preparing' && (
                <View className={`h-6 w-6 rounded border mr-4 items-center justify-center ${
                  isPacked ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'
                }`}>
                  {isPacked && <CheckCircle size={16} color="white" />}
                </View>
              )}
              
              <View>
                <Text className={`text-base font-medium ${isPacked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {item.name}
                </Text>
                <Text className="text-gray-500 text-xs">{item.qty}</Text>
              </View>
            </View>
            <Text className="font-bold text-gray-700">₹{item.price}</Text>
          </TouchableOpacity>
        );
      })}

      {/* Auto-Calculated Total Footer */}
      <View className="p-4 bg-gray-50 flex-row justify-between items-center border-t border-gray-100">
        <Text className="font-bold text-gray-500">Total System Bill</Text>
        <Text className="text-2xl font-bold text-green-700">₹{calculateTotal()}.00</Text>
      </View>
    </View>
  );
}