import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Phone } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, InteractionManager, ScrollView, Text, TouchableOpacity, View, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import from global store
import { useOrderStore } from '@/src/core/orderStore';
import { useOrders } from '@/src/core/hooks/useOrders';

// Import Components (lazy loaded)
const DigitalOrderView = React.lazy(() =>
  import('@/src/components/DigitalOrderView').then(m => ({ default: m.DigitalOrderView }))
);
const HandwrittenOrderView = React.lazy(() =>
  import('@/src/components/HandwrittenOrderView').then(m => ({ default: m.HandwrittenOrderView }))
);
const OrderActionButtons = React.lazy(() =>
  import('@/src/components/OrderActionButtons').then(m => ({ default: m.OrderActionButtons }))
);

// Lightweight loading placeholder
function ContentSkeleton() {
  return (
    <View className="flex-1 px-4 py-6">
      {/* Skeleton card */}
      <View className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <View className="h-4 bg-gray-200 rounded-full w-3/4 mb-4" />
        <View className="h-4 bg-gray-100 rounded-full w-1/2 mb-3" />
        <View className="h-4 bg-gray-100 rounded-full w-2/3 mb-3" />
        <View className="h-4 bg-gray-100 rounded-full w-1/3 mb-3" />
        <View className="h-20 bg-gray-100 rounded-xl mt-2" />
      </View>
    </View>
  );
}

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Defer heavy rendering until navigation animation completes
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
    return () => task.cancel();
  }, []);

  // Use global store for order data
  const { orders } = useOrderStore();
  const { accept, reject, markReady, complete } = useOrders();

  // 1. GET REAL DATA FROM STORE
  const order = useMemo(() => {
    return orders.find(o => o.id === id);
  }, [id, orders]);

  // Determine order type
  const isHandwritten = !!(order?.list_image_urls && order.list_image_urls.length > 0 && order.items.length === 0);
  const orderType = isHandwritten ? 'image' : 'list';

  // 2. LOCAL STATE (Lifted State)
  const [manualTotal, setManualTotal] = useState(order?.total_amount?.toString() || '');
  const [merchantNotes, setMerchantNotes] = useState(order?.order_notes || '');

  // 3. HANDLERS (Controller Logic)
  const handleReject = useCallback(() => {
    if (!order) return;
    Alert.alert("Confirm Reject", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reject Order", style: "destructive", onPress: async () => {
        await reject(order.id);
        router.back();
      }}
    ]);
  }, [order, reject, router]);

  const handleAccept = useCallback(async () => {
    if (!order) return;
    const total = manualTotal ? parseFloat(manualTotal) : undefined;
    const success = await accept(order.id, total, merchantNotes);
    if (success) {
      Alert.alert("Success", isHandwritten ? `Bill sent: ₹${manualTotal}` : "Order Accepted!");
      if (order.status === 'pending') router.back();
    }
  }, [order, manualTotal, merchantNotes, accept, isHandwritten, router]);

  const handleCallCustomer = useCallback(() => {
    if (order?.customer_phone) {
      Linking.openURL(`tel:${order.customer_phone}`);
    } else {
      Alert.alert('Phone Number Missing', 'Customer phone number is not available for this order.');
    }
  }, [order?.customer_phone]);

  const handleMarkReady = useCallback(async () => {
    if (!order) return;
    const success = await markReady(order.id);
    if (success) {
      Alert.alert("Ready!", "Customer notified.");
      router.back();
    }
  }, [order, markReady, router]);

  const handleComplete = useCallback(async () => {
    if (!order) return;
    const success = await complete(order.id);
    if (success) {
      Alert.alert("Completed", "Order closed successfully.");
      router.back();
    }
  }, [order, complete, router]);

  // Safety Check — show not found
  if (!order) {
    return (
      <View className="flex-1 bg-gray-50">
        <SafeAreaView className="flex-1">
          <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center shadow-sm z-10">
            <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-gray-100 rounded-full">
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">Order Details</Text>
          </View>
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-lg">Order Not Found</Text>
            <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-gray-100 px-4 py-2 rounded-xl">
              <Text className="text-gray-600 font-medium">Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">

        {/* Header — renders immediately, lightweight */}
        <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center shadow-sm z-10">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-gray-100 rounded-full">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>Order {order.id.slice(0, 8)}...</Text>
            <Text className="text-xs text-gray-500 font-medium capitalize">
              {order.status === 'pending' ? '⚡ New Request' : order.status}
            </Text>
          </View>
          <TouchableOpacity onPress={handleCallCustomer} className="p-2 ml-2 bg-green-100 rounded-full">
            <Phone size={20} color="#16A34A" />
          </TouchableOpacity>
        </View>

        {/* Content Area — lazy loaded after navigation completes */}
        {!isReady ? (
          <ContentSkeleton />
        ) : (
          <>
            <ScrollView className="flex-1 px-4 py-4">
              <React.Suspense fallback={
                <View className="flex-1 justify-center items-center py-20">
                  <ActivityIndicator size="large" color="#16A34A" />
                </View>
              }>
                {isHandwritten ? (
                  <HandwrittenOrderView
                    imageUri={order.list_image_urls![0]}
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
              </React.Suspense>

              {/* Merchant Notes Input */}
              <View className="mt-6 mb-2">
                <Text className="text-gray-700 font-bold mb-2 ml-1">Message to Customer</Text>
                <TextInput
                  value={merchantNotes}
                  onChangeText={setMerchantNotes}
                  placeholder="e.g. Some items out of stock, adjusted price."
                  placeholderTextColor="#9CA3AF"
                  className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-900 shadow-sm"
                  multiline
                  numberOfLines={2}
                  style={{ textAlignVertical: 'top', minHeight: 80 }}
                />
              </View>

              <View className="h-40" />
            </ScrollView>

            {/* Bottom Actions — lazy loaded */}
            <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-200 shadow-lg">
              <React.Suspense fallback={<View className="h-12" />}>
                <OrderActionButtons
                  status={order.status}
                  type={orderType}
                  hasTotal={!!manualTotal}
                  onReject={handleReject}
                  onAccept={handleAccept}
                  onMarkReady={handleMarkReady}
                  onComplete={handleComplete}
                />
              </React.Suspense>
            </View>
          </>
        )}

      </SafeAreaView>
    </View>
  );
}