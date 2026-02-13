import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet // Added for stable shadows
  ,

  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/core/store';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, phoneNumber, verifyPurpose } = useAuthStore();
  
  const isRegistration = verifyPurpose === 'register';

  const [mode, setMode] = useState('otp'); 
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const switchMode = (newMode: 'otp' | 'agent') => {
    Keyboard.dismiss(); 
    const timer = setTimeout(() => {
      setMode(newMode);
      setCode(''); 
      setError('');
    }, 100);
    return () => clearTimeout(timer); 
  };

  const handleSuccess = () => {
    login();
    if (isRegistration) {
      router.replace('/shop-setup');
    } else {
      router.replace('/(tabs)/orders');
    }
  };

  const handleVerify = () => {
    setError('');
    const cleanCode = code.trim();

    if (mode === 'otp') {
      if (cleanCode === '1234') handleSuccess();
      else setError('Invalid OTP. Try 1234');
    } else {
      if (cleanCode.toUpperCase() === 'AGENT007') handleSuccess();
      else setError('Invalid Agent Code.');
    }
  };

  return (
    <View 
      className="flex-1 bg-white" 
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6"
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mb-8 flex-row items-center mt-2"
        >
          <ArrowLeft size={24} color="#4B5563" />
          <Text className="text-lg text-gray-600 ml-2">Change Number</Text>
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'otp' ? 'Enter OTP' : 'Agent Code'}
          </Text>
          <Text className="text-gray-500 text-base leading-6">
            {mode === 'otp' 
              ? `We sent a 4-digit code to +91 ${phoneNumber || '******'}` 
              : 'Enter the unique code provided by your field agent to activate your account.'}
          </Text>
        </View>

        {isRegistration && (
          <View className="flex-row bg-gray-100 p-1 rounded-xl mb-8">
            <TouchableOpacity 
              onPress={() => switchMode('otp')}
              className={`flex-1 py-3 rounded-lg items-center ${mode === 'otp' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-bold ${mode === 'otp' ? 'text-green-600' : 'text-gray-500'}`}>SMS OTP</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => switchMode('agent')}
              className={`flex-1 py-3 rounded-lg items-center ${mode === 'agent' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-bold ${mode === 'agent' ? 'text-green-600' : 'text-gray-500'}`}>Agent Code</Text>
            </TouchableOpacity>
          </View>
        )}

        <TextInput 
          className={`w-full bg-gray-50 border rounded-xl p-5 text-center text-2xl tracking-widest font-bold ${
            error ? 'border-red-500 bg-red-50' : 'border-green-500 bg-white'
          }`}
          placeholder={mode === 'otp' ? "• • • •" : "AGENT CODE"}
          placeholderTextColor="#9CA3AF"
          keyboardType={mode === 'otp' ? "number-pad" : "default"} 
          maxLength={mode === 'otp' ? 4 : 10}
          value={code}
          onChangeText={(text) => {
            setCode(text);
            if(error) setError('');
          }}
          autoCapitalize="characters"
        />
        
        {error ? (
          <Text className="text-red-500 text-center mt-4 font-medium">{error}</Text> 
        ) : null}

        <TouchableOpacity 
          onPress={handleVerify}
          // Removed shadow classes from className and added style below
          className="w-full bg-green-600 py-4 rounded-xl items-center mt-8"
          activeOpacity={0.8}
          style={styles.btnShadow} 
        >
          <Text className="text-white font-bold text-lg">
            {mode === 'otp' ? 'Verify & Login' : 'Verify Agent'}
          </Text>
        </TouchableOpacity>

        {mode === 'otp' && (
          <TouchableOpacity className="mt-6 items-center p-2">
            <Text className="text-gray-500">
              Didn't receive code? <Text className="text-green-600 font-bold">Resend</Text>
            </Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

// Fixed styling to avoid NativeWind shadow parsing bug
const styles = StyleSheet.create({
  btnShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});