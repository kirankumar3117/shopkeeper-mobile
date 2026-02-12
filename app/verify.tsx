import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/core/store';

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams(); // Get the number passed from Login
  const { login } = useAuthStore();
  
  const [mode, setMode] = useState<'otp' | 'agent'>('agent'); // Toggle State
  const [code, setCode] = useState('AGENT007');
  const [error, setError] = useState('');

  const switchMode = (newMode: 'otp' | 'agent') => {
    setMode(newMode);
    setCode('');
    setError('');
  };

  const handleVerify = () => {
    setError('');

    if (mode === 'otp') {
      // 1. Validate OTP (Simulate '1234')
      if (code === '1234') {
        login(); // Update Store
        router.push('/shop-setup');
      } else {
        setError('Invalid OTP. Try 1234');
      }
    } else {
      // 2. Validate Agent Code (Simulate 'AGENT007')
      if (code.toUpperCase() === 'AGENT007') {
        login(); // Update Store
        router.push('/shop-setup');
      } else {
        setError('Invalid Agent Code. Ask your agent.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 pt-10">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Text className="text-xl text-gray-600">← Change Number</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-900 mb-2">
          {mode === 'otp' ? 'Enter OTP' : 'Agent Verification'}
        </Text>
        
        <Text className="text-gray-500 mb-8">
          {mode === 'otp' 
            ? `We sent a code to +91 ${phone || '******'}` 
            : 'Enter the unique code provided by your field agent.'}
        </Text>

        {/* The Toggle Switch */}
        <View className="flex-row bg-gray-100 p-1 rounded-xl mb-8">
          <TouchableOpacity 
            
            className={`flex-1 py-3 rounded-lg items-center ${mode === 'otp' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`font-bold ${mode === 'otp' ? 'text-green-600' : 'text-gray-500'}`}>SMS OTP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
           
            className={`flex-1 py-3 rounded-lg items-center ${mode === 'agent' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`font-bold ${mode === 'agent' ? 'text-green-600' : 'text-gray-500'}`}>Agent Code</Text>
          </TouchableOpacity>
        </View>

        {/* Input Field */}
        <TextInput 
        key={mode}
          className={`w-full bg-gray-50 border rounded-xl p-5 text-center text-2xl tracking-widest font-bold ${
            error ? 'border-red-500 bg-red-50' : 'border-green-500 bg-white'
          }`}
          placeholder={mode === 'otp' ? "• • • •" : "AGENT CODE"}
          keyboardType={mode === 'otp' ? "number-pad" : "default"}
          maxLength={mode === 'otp' ? 4 : 10}
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        
        {error ? <Text className="text-red-500 text-center mt-4">{error}</Text> : null}

        {/* Action Button */}
        <TouchableOpacity 
          onPress={handleVerify}
          className="w-full bg-green-600 py-4 rounded-xl items-center mt-8 shadow-lg shadow-green-200"
        >
          <Text className="text-white font-bold text-lg">
            {mode === 'otp' ? 'Verify OTP' : 'Verify Agent'}
          </Text>
        </TouchableOpacity>

        {/* Resend Link (Only for OTP) */}
        {mode === 'otp' && (
          <TouchableOpacity className="mt-6 items-center">
            <Text className="text-gray-500">Didn't receive code? <Text className="text-green-600 font-bold">Resend</Text></Text>
          </TouchableOpacity>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}