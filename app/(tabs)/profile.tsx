import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/core/store';
import { SettingsRow } from '@/src/components/SettingsRow';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, phoneNumber } = useAuthStore();
  
  // Local State for Toggles
  const [isShopOpen, setShopOpen] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to exit?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: () => {
            logout();
            router.replace('/'); // Go back to Login
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        
        {/* 1. Profile Header Card */}
        <View className="bg-white p-6 mb-6 flex-row items-center shadow-sm">
          <View className="h-20 w-20 bg-green-100 rounded-full items-center justify-center mr-5 border-2 border-white shadow-sm">
            <Text className="text-4xl">👤</Text>
            {/* If you had a real image: <Image source={{ uri: '...' }} className="h-20 w-20 rounded-full" /> */}
          </View>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Sai Kirana & General</Text>
            <Text className="text-gray-500">+91 {phoneNumber || '98765 43210'}</Text>
            <View className="bg-green-100 self-start px-2 py-1 rounded mt-2">
              <Text className="text-green-700 text-xs font-bold">VERIFIED PARTNER</Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1">
          
          {/* Section: Shop Status */}
          <Text className="px-6 mb-2 text-gray-500 font-bold text-xs uppercase">Store Controls</Text>
          <View className="bg-white mb-6 border-t border-b border-gray-100">
            <SettingsRow 
              icon="🟢" 
              label="Accepting Orders" 
              isSwitch 
              enabled={isShopOpen} 
              onToggle={() => setShopOpen(!isShopOpen)} 
            />
          </View>

          {/* Section: App Settings */}
          <Text className="px-6 mb-2 text-gray-500 font-bold text-xs uppercase">Preferences</Text>
          <View className="bg-white mb-6 border-t border-b border-gray-100">
            <SettingsRow 
              icon="🔊" 
              label="Order Sound" 
              isSwitch 
              enabled={soundEnabled} 
              onToggle={() => setSoundEnabled(!soundEnabled)} 
            />
            <SettingsRow 
              icon="🖨️" 
              label="Printer Settings" 
              value="Not Connected"
              onPress={() => alert('Printer setup coming soon!')}
            />
            <SettingsRow 
              icon="🗣️" 
              label="App Language" 
              value="English" 
              onPress={() => alert('Language options coming soon')}
            />
          </View>

          {/* Section: Danger Zone */}
          <View className="bg-white mt-4 border-t border-b border-gray-100">
            <SettingsRow 
              icon="🚪" 
              label="Logout" 
              isDestructive 
              onPress={handleLogout} 
            />
          </View>
          
          <Text className="text-center text-gray-400 text-xs mt-8 mb-10">
            Smart Kirana App v1.0.0
          </Text>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}