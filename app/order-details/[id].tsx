import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import Data
import { MOCK_ORDERS } from '@/src/data/mockData';

// Import Components
import { DigitalOrderView } from '@/src/components/DigitalOrderView';
import { HandwrittenOrderView } from '@/src/components/HandwrittenOrderView';
import { OrderActionButtons } from '@/src/components/OrderActionButtons';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // 1. GET REAL DATA
  const order = useMemo(() => {
    return MOCK_ORDERS.find(o => o.id === id);
  }, [id]);

  // 2. LOCAL STATE (Lifted State)
  const [manualTotal, setManualTotal] = useState(order?.total || '');

  // Safety Check
  if (!order) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Order Not Found</Text>
      </View>
    );
  }

  // 3. HANDLERS (Controller Logic)
  const handleReject = () => {
    Alert.alert("Confirm Reject", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reject Order", style: "destructive", onPress: () => router.back() }
    ]);
  };

  const handleAccept = () => {
    // Logic for both "Accept" and "Send Bill"
    Alert.alert("Success", order.type === 'image' ? `Bill sent: ₹${manualTotal}` : "Order Accepted!");
    if(order.status === 'new') router.back();
  };

  const handleMarkReady = () => {
    Alert.alert("Ready!", "Customer notified.");
    router.back();
  };

  const handleComplete = () => {
    Alert.alert("Completed", "Order closed successfully.");
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">

        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center shadow-sm z-10">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-gray-100 rounded-full">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold text-gray-900">Order {order.id}</Text>
            <Text className="text-xs text-gray-500 font-medium capitalize">
              {order.status === 'new' ? '⚡ New Request' : order.status}
            </Text>
          </View>
        </View>

        {/* Content Area */}
        <ScrollView className="flex-1 px-4 py-4">
          
          {order.type === 'image' ? (
            <HandwrittenOrderView 
              imageUri={order.imageUrl || ''} 
              total={manualTotal}
              onUpdateTotal={setManualTotal}
              status={order.status}
            />
          ) : (
            <DigitalOrderView 
              items={order.items} 
              status={order.status}
            />
          )}

          <View className="h-40" /> 
        </ScrollView>

        {/* Bottom Actions */}
        <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-200 shadow-lg">
          <OrderActionButtons 
            status={order.status}
            type={order.type}
            hasTotal={!!manualTotal}
            onReject={handleReject}
            onAccept={handleAccept}
            onMarkReady={handleMarkReady}
            onComplete={handleComplete}
          />
        </View>

      </SafeAreaView>
    </View>
  );
}