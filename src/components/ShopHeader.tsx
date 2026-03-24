import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Store } from 'lucide-react-native';

interface ShopHeaderProps {
  title: string;
  isStoreOnline: boolean;
  isToggling?: boolean;
  onToggleStore: (value: boolean) => void;
  notificationCount?: number;
  onNotificationPress?: () => void;
}

export function ShopHeader({
  title,
  isStoreOnline,
  isToggling = false,
  onToggleStore,
  notificationCount = 0,
  onNotificationPress,
}: ShopHeaderProps) {

  const dateString = new Date().toDateString().toUpperCase();

  return (
    <View className="flex-row justify-between items-center px-5 py-3 bg-white border-b border-gray-200 shadow-sm z-10">

      {/* Left Side: Title & Date */}
      <View className="flex-1">
        <Text className="text-xl font-extrabold text-gray-900 tracking-tight">
          {title}
        </Text>
        <Text className="text-gray-400 text-[10px] font-bold tracking-widest mt-0.5">
          {dateString}
        </Text>
      </View>

      {/* Right Side: Online/Offline Toggle */}
      <View className="flex-row items-center space-x-3">

        {isToggling ? (
          /* Loading state — show while API call is in flight */
          <View className="w-28 h-9 rounded-full bg-gray-100 border border-gray-200 flex-row items-center justify-center space-x-2">
            <ActivityIndicator size="small" color={isStoreOnline ? '#16A34A' : '#6B7280'} />
            <Text className="text-[10px] font-bold text-gray-500 tracking-widest">
              {isStoreOnline ? 'GOING ON...' : 'GOING OFF...'}
            </Text>
          </View>
        ) : (
          /* Normal pill toggle */
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onToggleStore(!isStoreOnline)}
          >
            <View className={`w-28 h-9 rounded-full flex-row items-center px-1 border ${
              isStoreOnline
                ? 'bg-green-500 border-green-600'
                : 'bg-gray-200 border-gray-300'
            }`}>

              {/* Text Label */}
              <Text className={`absolute w-full text-center text-[10px] font-bold tracking-widest ${
                isStoreOnline ? 'text-white pr-6' : 'text-gray-500 pl-6'
              }`}>
                {isStoreOnline ? 'ONLINE' : 'OFFLINE'}
              </Text>

              {/* Knob with Store Icon */}
              <View className={`h-7 w-7 bg-white rounded-full shadow-sm items-center justify-center ${
                isStoreOnline ? 'ml-auto' : 'mr-auto'
              }`}>
                <Store size={14} color={isStoreOnline ? '#16A34A' : '#9CA3AF'} />
              </View>
            </View>
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
}