import { CheckSquare, Send } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ActionButtonsProps {
  status: string;
  type: string;
  hasTotal: boolean; 
  onReject: () => void;
  onAccept: () => void; // Includes "Send Bill" logic
  onMarkReady: () => void;
  onComplete: () => void;
}

export function OrderActionButtons({ 
  status, type, hasTotal, onReject, onAccept, onMarkReady, onComplete 
}: ActionButtonsProps) {
  
  // 1. NEW ORDER
  if (status === 'new') {
    return (
      <View className="flex-row space-x-3">
        <TouchableOpacity onPress={onReject} className="flex-1 bg-red-50 border border-red-100 py-4 rounded-xl items-center">
          <Text className="text-red-600 font-bold text-base">Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onAccept}
          disabled={type === 'image' && !hasTotal} // Disable if no price entered for handwritten
          className={`flex-[2] py-4 rounded-xl items-center shadow-lg ${
            (type === 'image' && !hasTotal) ? 'bg-gray-300' : 'bg-green-600 shadow-green-200'
          }`}
        >
          <Text className="text-white font-bold text-lg">
            {type === 'image' ? 'Send Bill & Accept' : 'Accept Order'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. PREPARING ORDER
  if (status === 'preparing') {
    return (
      <View className="flex-col space-y-3">
        {/* Primary Action */}
        <TouchableOpacity 
          onPress={onMarkReady}
          className="w-full bg-green-600 py-4 rounded-xl items-center shadow-lg shadow-green-200"
        >
          <Text className="text-white font-bold text-lg">Mark as Ready</Text>
        </TouchableOpacity>

        {/* Secondary: Update Bill (Only for Handwritten) */}
        {type === 'image' && (
          <TouchableOpacity 
            onPress={onAccept} // Re-using logic to "Send/Update Bill"
            className="w-full bg-white border border-green-200 py-3 rounded-xl items-center flex-row justify-center"
          >
            <Send size={18} color="#16A34A" />
            <Text className="text-green-700 font-bold ml-2">Send / Update Bill</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // 3. READY ORDER
  if (status === 'ready') {
    return (
      <TouchableOpacity 
        onPress={onComplete}
        className="w-full bg-gray-900 py-4 rounded-xl items-center shadow-lg flex-row justify-center"
      >
        <CheckSquare size={20} color="white" />
        <Text className="text-white font-bold text-lg ml-2">Complete Order</Text>
      </TouchableOpacity>
    );
  }

  return null;
}