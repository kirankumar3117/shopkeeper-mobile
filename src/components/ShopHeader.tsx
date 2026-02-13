import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
// 1. Import the specific icons you need
import { Store } from 'lucide-react-native';

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
  
  const dateString = new Date().toDateString().toUpperCase();

  return (
    <View className="flex-row justify-between items-center px-5 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
      
      {/* 1. Left Side: Title & Date */}
      <View className="flex-1">
        <Text className="text-xl font-extrabold text-gray-900 tracking-tight">
          {title}
        </Text>
        <Text className="text-gray-400 text-[10px] font-bold tracking-widest mt-0.5">
          {dateString}
        </Text>
      </View>

      {/* 2. Right Side: Controls */}
      <View className="flex-row items-center space-x-3">
        
        {/* === CUSTOM "PILL" TOGGLE === */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => onToggleStore(!isStoreOnline)}
        >
          <View className={`w-28 h-9 rounded-full flex-row items-center px-1 border transition-all ${
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

             {/* The Knob (Now with a Store Icon inside!) */}
             <View className={`h-7 w-7 bg-white rounded-full shadow-sm items-center justify-center ${
               isStoreOnline ? 'ml-auto' : 'mr-auto' 
             }`}>
                {/* Tiny icon inside the knob for polish */}
                <Store size={14} color={isStoreOnline ? '#16A34A' : '#9CA3AF'} />
             </View>
          </View>
        </TouchableOpacity>

        {/* === NOTIFICATION BELL (Lucide Icon) === */}
        {/* Uncomment this when you are ready to use notifications */}
        {/* <TouchableOpacity
          onPress={onNotificationPress}
          activeOpacity={0.7}
          className="relative h-10 w-10 bg-gray-50 rounded-full items-center justify-center border border-gray-200"
        >
          <Bell size={20} color="#374151" /> 
          
          {notificationCount > 0 && (
            <View className="absolute top-0 right-0 bg-red-500 h-4 w-4 rounded-full items-center justify-center border border-white">
              <Text className="text-white text-[9px] font-bold">
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>  */}
       

      </View>
    </View>
  );
}