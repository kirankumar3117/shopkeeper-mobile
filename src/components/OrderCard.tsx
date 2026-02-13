import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface OrderItem {
  name: string;
  qty: string;
}

interface OrderCardProps {
  id: string;
  time: string;
  paymentMode: string;
  status: 'new' | 'preparing' | 'ready';
  items: OrderItem[];
  total: string;
  onExpand: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onStatusUpdate?: () => void; 
}

export function OrderCard({ 
  id, time, paymentMode, status, items, total, 
  onExpand, onAccept, onReject, onStatusUpdate 
}: OrderCardProps) {
  
  // Logic: It is an Image Order if items array is empty
  const isImageOrder = items.length === 0;

  const previewItems = items.slice(0, 3);
  const hasMore = items.length > 3;

  // Dynamic Colors based on Status
  const getStatusColor = () => {
    switch(status) {
      case 'new': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <View className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden">
      
      {/* 1. Header Section */}
      <View className="p-4 flex-row justify-between items-start bg-gray-50/50">
        <View>
          <Text className="text-lg font-bold text-gray-900">{id}</Text>
          <Text className="text-gray-500 text-xs mt-1 font-medium">
            {time} •{' '}
            <Text className={`font-bold ${
              paymentMode.toLowerCase().includes('cash') ? 'text-orange-500' : 'text-green-600'
            }`}>
              {paymentMode}
            </Text>
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full border ${getStatusColor()}`}>
          <Text className={`font-bold text-xs uppercase tracking-wide`}>
            {status}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-gray-100 mx-4" />

      {/* 2. Items List Section */}
      <View className="p-4 flex-row">
        
        {/* Left Side: Content (Either Text List or Image Placeholder) */}
        <View className="flex-1 space-y-3">
          {isImageOrder ? (
             // --- IMAGE ORDER UI ---
             <View className="flex-row items-center bg-gray-50 p-2 rounded-lg border border-dashed border-gray-300">
               <Text className="text-2xl mr-3">📄</Text>
               <View>
                 <Text className="text-gray-900 font-bold text-sm">Handwritten List</Text>
                 <Text className="text-gray-400 text-xs">Tap expand to view</Text>
               </View>
             </View>
          ) : (
            // --- TEXT ORDER UI ---
            <>
              {previewItems.map((item, index) => (
                <View key={index} className="flex-row items-center">
                  <View className="h-2 w-2 rounded-full bg-green-400 mr-2" />
                  <Text className="text-gray-700 text-base flex-1">
                    {item.name} <Text className="font-bold text-gray-900">x{item.qty}</Text>
                  </Text>
                </View>
              ))}
              {hasMore && <Text className="text-gray-400 pl-4 font-bold text-lg tracking-widest">. . .</Text>}
            </>
          )}
        </View>

        {/* Expand Button: Only visible if Long Order (>3) OR Image Order */}
        {(hasMore || isImageOrder) && (
          <View className="justify-end pl-2">
            <TouchableOpacity 
              onPress={onExpand}
              className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl"
            >
              <Text className="font-bold text-green-700 text-sm">Expand ↘</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 3. Total & Actions Section */}
      <View className="p-4 bg-gray-50 border-t border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-500 font-semibold">Total Bill</Text>
          <Text className="text-xl font-bold text-gray-900">₹{total}</Text>
        </View>

        {/* Action Buttons */}
        {status === 'new' ? (
          <View className="flex-row space-x-3">
            <TouchableOpacity onPress={onReject} className="flex-1 bg-white border border-red-100 py-3 rounded-xl items-center shadow-sm">
              <Text className="text-red-600 font-bold">Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onAccept} className="flex-1 bg-green-600 py-3 rounded-xl items-center shadow-lg shadow-green-200">
              <Text className="text-white font-bold">Accept Order</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={onStatusUpdate} 
            className={`w-full py-3 rounded-xl items-center shadow-sm ${status === 'preparing' ? 'bg-blue-600 shadow-blue-200' : 'bg-green-600 shadow-green-200'}`}
          >
            <Text className="text-white font-bold">
              {status === 'preparing' ? 'Mark Ready for Pickup' : 'Complete Order'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}