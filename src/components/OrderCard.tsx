import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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

// --- 1. The "Sonar Alarm" Badge Component ---
const PulseBadge = () => {
  // Animation Values
  const pulse = useSharedValue(0);     // For the expanding waves
  const wiggle = useSharedValue(0);    // For the "Flip/Shake" effect

  useEffect(() => {
    // 1. The Wave Animation (Continuous Loop)
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    // 2. The "Flip/Wiggle" Animation (Rapid shaking like a bell)
    wiggle.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 100 }), // Tilt Left
        withTiming(5, { duration: 100 }),  // Tilt Right
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 100 }),
        withDelay(1000, withTiming(0, { duration: 0 })) // Wait a bit before shaking again
      ),
      -1,
      true
    );
  }, []);

  // Style for the First Wave Ring
  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 2.5]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.8, 0]),
  }));

  // Style for the Second Wave Ring (Delayed)
  const wave2Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 2]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.5, 0]),
  }));

  // Style for the Badge itself (The Wiggle)
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${wiggle.value}deg` }]
  }));

  return (
    <View className="relative items-center justify-center w-16 h-8">
      {/* Wave 1 (Outer) */}
      <Animated.View 
        className="absolute w-full h-full rounded-full border-2 border-yellow-400"
        style={wave1Style}
      />
      {/* Wave 2 (Inner) */}
      <Animated.View 
        className="absolute w-full h-full rounded-full border-2 border-yellow-500"
        style={wave2Style}
      />
      
      {/* The Actual Badge (Wiggling) */}
      <Animated.View 
        style={badgeStyle}
        className="px-4 py-1.5 rounded-full bg-yellow-400 shadow-sm z-10"
      >
        <Text className="font-bold text-xs uppercase tracking-wider text-black">
          NEW!
        </Text>
      </Animated.View>
    </View>
  );
};

// --- 2. Main Component ---
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
  
  const isImageOrder = items.length === 0;
  const previewItems = items.slice(0, 3);
  const hasMore = items.length > 3;

  const getStatusColor = () => {
    switch(status) {
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      default: return ''; 
    }
  };

  return (
    <View className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-visible">
      
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

        {/* STATUS BADGE LOGIC */}
        <View className="mt-1 mr-1"> 
          {status === 'new' ? (
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
             <View className="flex-row items-center bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300 mb-3">
               <Text className="text-2xl mr-3">📄</Text>
               <View>
                 <Text className="text-gray-900 font-bold text-sm">Handwritten List</Text>
                 <Text className="text-gray-400 text-xs">Tap expand to view</Text>
               </View>
             </View>
             <View className="items-end">
                <TouchableOpacity 
                  onPress={onExpand}
                  className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl"
                >
                  <Text className="font-bold text-green-700 text-sm">Expand ↘</Text>
                </TouchableOpacity>
             </View>
          </View>
        ) : (
          <View className="flex-row">
            <View className="flex-1 space-y-3">
              {previewItems.map((item, index) => (
                <View key={index} className="flex-row items-center">
                  <View className="h-2 w-2 rounded-full bg-green-400 mr-2" />
                  <Text className="text-gray-700 text-base flex-1">
                    {item.name} <Text className="font-bold text-gray-900">x{item.qty}</Text>
                  </Text>
                </View>
              ))}
              {hasMore && <Text className="text-gray-400 pl-4 font-bold text-lg tracking-widest">. . .</Text>}
            </View>

            {hasMore && (
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
        )}
      </View>

      {/* 3. Total & Actions Section */}
      <View className="p-4 bg-gray-50 border-t border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-500 font-semibold">Total Bill</Text>
          <Text className="text-xl font-bold text-gray-900">₹{total}</Text>
        </View>

        {status === 'new' ? (
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