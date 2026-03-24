import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

// --- 1. The "Sonar Alarm" Badge (Kept from previous steps) ---
const PulseBadge = () => {
  const pulse = useSharedValue(0);
  const wiggle = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1, false
    );
    wiggle.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 100 }),
        withDelay(1000, withTiming(0, { duration: 0 }))
      ),
      -1, true
    );
  }, []);

  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 2.5]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.8, 0]),
  }));

  const wave2Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 2]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.5, 0]),
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${wiggle.value}deg` }]
  }));

  return (
    <View className="relative items-center justify-center w-16 h-8">
      <Animated.View className="absolute w-full h-full rounded-full border-2 border-yellow-400" style={wave1Style} />
      <Animated.View className="absolute w-full h-full rounded-full border-2 border-yellow-500" style={wave2Style} />
      <Animated.View style={badgeStyle} className="px-4 py-1.5 rounded-full bg-yellow-400 shadow-sm z-10">
        <Text className="font-bold text-xs uppercase tracking-wider text-black">NEW!</Text>
      </Animated.View>
    </View>
  );
};

import type { OrderItem } from '@/src/core/api/types';

// --- 2. Main Component ---

interface OrderCardProps {
  id: string;
  time: string;
  paymentMode?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up';
  items: OrderItem[];
  total: string;
  listImageUrls?: string[] | null;
  order_number?: string | number;
  onExpand: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onStatusUpdate?: () => void;
}

export function OrderCard({
  id, time, paymentMode, status, items, total, listImageUrls, order_number,
  onExpand, onAccept, onReject, onStatusUpdate
}: OrderCardProps) {

  const [isExpanding, setIsExpanding] = useState(false);
  const isExpandingRef = useRef(false);

  const handleExpand = () => {
    if (isExpandingRef.current) return;
    isExpandingRef.current = true;
    setIsExpanding(true);

    onExpand();

    // Reset after timeout in case navigation is slow
    setTimeout(() => {
      isExpandingRef.current = false;
      setIsExpanding(false);
    }, 2000);
  };

  const safeItems = items || [];
  // Handwritten order: no items but has image URLs
  const isImageOrder = safeItems.length === 0 && (listImageUrls && listImageUrls.length > 0);
  const previewItems = safeItems.slice(0, 3);
  const hasMore = safeItems.length > 3;

  const getStatusColor = () => {
    switch (status) {
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      default: return '';
    }
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}min ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}hr ago`;
      return date.toLocaleDateString();
    } catch {
      return timeStr;
    }
  };

  return (
    <View className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-visible">

      {/* 1. Header Section */}
      <View className="p-4 flex-row justify-between items-start bg-gray-50/50">
        <View className="flex-1 mr-2">
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>#{order_number}</Text>
          <Text className="text-gray-500 text-xs mt-1 font-medium">
            {formatTime(time)} •{' '}
            <Text className={`font-bold ${(paymentMode || '').toLowerCase().includes('cash') ? 'text-orange-500' : 'text-green-600'
              }`}>
              {paymentMode || 'Cash on Delivery'}
            </Text>
          </Text>
        </View>

        <View className="mt-1 mr-1">
          {status === 'pending' ? (
            <PulseBadge />
          ) : (
            <View className={`px-3 py-1 rounded-full border ${getStatusColor()}`}>
              <Text className={`font-bold text-xs uppercase tracking-wide`}>
                {status}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="h-[1px] bg-gray-100 mx-4" />

      {/* 2. Content Section */}
      <View className="p-4">
        {isImageOrder ? (
          <View>
            {/* 👇 This entire box is now clickable */}
            <TouchableOpacity
              onPress={handleExpand}
              activeOpacity={0.7}
              disabled={isExpanding}
              className="flex-row items-center bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300 mb-3"
            >
              {isExpanding ? (
                <ActivityIndicator size="small" color="#16A34A" style={{ marginRight: 12 }} />
              ) : (
                <Text className="text-2xl mr-3">📄</Text>
              )}
              <View>
                <Text className="text-gray-900 font-bold text-sm">Handwritten List</Text>
                <Text className="text-gray-400 text-xs">{isExpanding ? 'Loading...' : 'Tap to view full details'}</Text>
              </View>
            </TouchableOpacity>

            <View className="items-end">
              <TouchableOpacity
                onPress={handleExpand}
                disabled={isExpanding}
                className={`border px-4 py-2 rounded-xl flex-row items-center ${isExpanding ? 'bg-green-100 border-green-300' : 'bg-green-50 border-green-200'}`}
              >
                {isExpanding ? (
                  <ActivityIndicator size="small" color="#15803D" style={{ marginRight: 6 }} />
                ) : null}
                <Text className="font-bold text-green-700 text-sm">{isExpanding ? 'Loading...' : 'Expand ↘'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-row">
            <View className="flex-1 space-y-3">
              {previewItems.map((item, index) => (
                <View key={item.id || index} className="flex-row items-center">
                  <View className="h-2 w-2 rounded-full bg-green-400 mr-2" />
                  <Text className="text-gray-700 text-base flex-1">
                    {item.product?.name || 'Unknown Item'} <Text className="font-bold text-gray-900">x{item.quantity}</Text>
                  </Text>
                </View>
              ))}
              {hasMore && <Text className="text-gray-400 pl-4 font-bold text-lg tracking-widest">. . .</Text>}
            </View>

            <View className="justify-end pl-2">
              <TouchableOpacity
                onPress={handleExpand}
                disabled={isExpanding}
                className={`border px-4 py-2 rounded-xl flex-row items-center ${isExpanding ? 'bg-green-100 border-green-300' : 'bg-green-50 border-green-200'}`}
              >
                {isExpanding && (
                  <ActivityIndicator size="small" color="#15803D" style={{ marginRight: 6 }} />
                )}
                <Text className="font-bold text-green-700 text-sm">{isExpanding ? 'Loading...' : 'Expand ↘'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 3. Total & Actions Section */}
      <View className="p-4 bg-gray-50 border-t border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-500 font-semibold">Total Bill</Text>
          <Text className="text-xl font-bold text-gray-900">₹{total}</Text>
        </View>

        {status === 'pending' ? (
          <View className="flex-row justify-between">
            <TouchableOpacity onPress={onReject} className="w-[48%] bg-white border border-red-100 py-3 rounded-xl items-center shadow-sm">
              <Text className="text-red-600 font-bold">Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onAccept} className="w-[48%] bg-green-600 py-3 rounded-xl items-center shadow-lg shadow-green-200">
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