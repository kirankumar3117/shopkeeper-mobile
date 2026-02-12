import React from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';

interface ShopHeaderProps {
  title: string;
  isStoreOnline: boolean;
  onToggleStore: (value: boolean) => void;
  notificationCount?: number;
  onNotificationPress?: () => void;
}

export function ShopHeader({
  title,
  isStoreOnline,
  onToggleStore,
  notificationCount = 0,
  onNotificationPress,
}: ShopHeaderProps) {
  return (
    <View className="px-6 py-4 bg-white border-b border-gray-100 shadow-sm z-10">
      
      {/* Top Row: Title + Notification Bell */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-3xl font-bold text-gray-900">{title}</Text>
          <Text className="text-gray-400 text-xs font-medium uppercase tracking-widest mt-1">
            {new Date().toDateString()}
          </Text>
        </View>

        {/* Notification Bell */}
        <TouchableOpacity
          onPress={onNotificationPress}
          activeOpacity={0.7}
          className="relative h-12 w-12 bg-gray-50 rounded-full items-center justify-center border border-gray-100"
        >
          <Text className="text-2xl">🔔</Text>
          {notificationCount > 0 && (
            <View className="absolute top-0 right-0 bg-red-500 h-5 w-5 rounded-full items-center justify-center border-2 border-white">
              <Text className="text-white text-[10px] font-bold">
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Store Control Panel */}
      <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
        <View className="flex-row items-center">
          <View className={`h-3 w-3 rounded-full mr-2 ${isStoreOnline ? 'bg-green-500 shadow-green-500 shadow-sm' : 'bg-red-400'}`} />
          <Text className={`font-bold ${isStoreOnline ? 'text-green-700' : 'text-red-500'}`}>
            {isStoreOnline ? 'Accepting Orders' : 'Store is Closed'}
          </Text>
        </View>

        <Switch
          value={isStoreOnline}
          onValueChange={onToggleStore}
          trackColor={{ false: '#FEE2E2', true: '#DCFCE7' }}
          thumbColor={isStoreOnline ? '#16A34A' : '#EF4444'}
          ios_backgroundColor="#FEE2E2"
        />
      </View>
    </View>
  );
}