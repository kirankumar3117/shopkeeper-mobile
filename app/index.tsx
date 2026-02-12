import { Input } from '@/src/components/ui/Input';
import { useAuthStore } from '@/src/core/store';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { setPhoneNumber } = useAuthStore(); // Access the Brain
  
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  const handleSendOTP = () => {
    // 1. Basic Validation
    if (mobile.length < 10) {
      setError('Please enter a valid 10-digit number');
      return;
    }

    // 2. Save to Store
    setPhoneNumber(mobile);
    setError('');

    // 3. Navigate to Shop Setup (Simulating OTP success)
    router.push({ pathname: '/verify', params: { phone: mobile } });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        
        {/* Header Logo */}
        <View className="items-center mb-12">
          <View className="h-24 w-24 bg-green-100 rounded-full items-center justify-center mb-6 shadow-sm">
            <Text className="text-5xl">🏪</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900">Smart Kirana</Text>
          <Text className="text-gray-500 mt-2 text-lg">Partner App</Text>
        </View>

        {/* The Form */}
        <View>
          <Input 
            label="Mobile Number"
            placeholder="98765 4****"
            keyboardType="phone-pad"
            maxLength={10}
            value={mobile}
            onChangeText={setMobile}
            error={error}
          />

          <TouchableOpacity 
            onPress={handleSendOTP}
            activeOpacity={0.8}
            className="w-full bg-green-600 py-4 rounded-xl items-center mt-6 shadow-lg shadow-green-200"
          >
            <Text className="text-white font-bold text-lg">Send OTP</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-10 flex-row justify-center">
          <Text className="text-gray-500">New Shopkeeper? </Text>
          <TouchableOpacity>
            <Text className="text-green-600 font-bold">Register Here</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}