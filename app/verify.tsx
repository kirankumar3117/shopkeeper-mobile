import { authService } from '@/src/core/api/services/auth';
import { setRefreshToken, setToken } from '@/src/core/api/tokenStorage';
import { ApiError } from '@/src/core/api/types';
import { useAuthStore } from '@/src/core/store';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { 
    phoneNumber,
    setToken: storeSetToken,
    setUser,
    setOnboardingStep,
  } = useAuthStore();

  // Default to agent code verification
  const [method, setMethod] = useState<'agent' | 'otp'>('agent');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (newMode: 'otp' | 'agent') => {
    Keyboard.dismiss(); 
    const timer = setTimeout(() => {
      setMethod(newMode);
      setCode(''); 
      setError('');
    }, 100);
    return () => clearTimeout(timer); 
  };

  const handleVerify = async () => {
    setError('');
    const cleanCode = code.trim();

    if (!cleanCode) {
      setError(method === 'otp' ? 'Please enter the OTP' : 'Please enter the Agent Code');
      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (method === 'otp') {
        response = await authService.verifyOtp(phoneNumber, cleanCode);
      } else {
        response = await authService.verifyAgentCode(phoneNumber, cleanCode);
      }

      const { tokens, user, onboarding_step } = response.data;

      // Store tokens
      await setToken(tokens.access_token);
      await setRefreshToken(tokens.refresh_token);

      // Update store
      storeSetToken(tokens.access_token);
      setUser(user);
      setOnboardingStep(onboarding_step);

      // After verification → go to PIN generation
      router.replace('/set-pin');
    } catch (err) {
      console.log(err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
        
        {/* Header */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mb-8 flex-row items-center mt-2"
        >
          <ArrowLeft size={24} color="#4B5563" />
          <Text className="text-lg text-gray-600 ml-2">Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            {method === 'otp' ? 'Enter OTP' : 'Agent Verification'}
          </Text>
          <Text className="text-gray-500 text-base leading-6">
            {method === 'otp' 
              ? `We sent a 4-digit code to +91 ${phoneNumber}` 
              : 'Enter the code from your Kart Mithra field agent to activate your shop.'}
          </Text>
        </View>

        {/* Toggle: Agent Code / OTP */}
        <View className="flex-row bg-gray-100 p-1 rounded-xl mb-8">
          <TouchableOpacity 
            onPress={() => switchMode('agent')}
            className="flex-1 py-3 rounded-lg items-center"
            style={method === 'agent' ? styles.activeTab : null}
          >
            <Text className={`font-bold ${method === 'agent' ? 'text-green-600' : 'text-gray-500'}`}>
              Agent Code
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => switchMode('otp')}
            className="flex-1 py-3 rounded-lg items-center"
            style={method === 'otp' ? styles.activeTab : null}
          >
            <Text className={`font-bold ${method === 'otp' ? 'text-green-600' : 'text-gray-500'}`}>
              SMS OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Code Input */}
        <TextInput 
          key={method}
          className={`w-full bg-gray-50 border rounded-xl p-5 text-center text-2xl tracking-widest font-bold ${
            error ? 'border-red-500 bg-red-50' : 'border-green-500 bg-white'
          }`}
          placeholder={method === 'otp' ? "• • • •" : "AGENT CODE"}
          placeholderTextColor="#9CA3AF"
          keyboardType={method === 'otp' ? "number-pad" : "default"} 
          maxLength={method === 'otp' ? 4 : 20}
          value={code}
          onChangeText={(text) => {
            setCode(text);
            if (error) setError('');
          }}
          autoCapitalize="characters"
          editable={!isLoading}
        />
        
        {error ? (
          <Text className="text-red-500 text-center mt-4 font-medium">{error}</Text> 
        ) : null}

        {/* Verify Button */}
        <TouchableOpacity 
          onPress={handleVerify}
          className={`w-full py-4 rounded-xl items-center mt-8 ${isLoading ? 'bg-green-400' : 'bg-green-600'}`}
          activeOpacity={0.8}
          disabled={isLoading}
          style={styles.shadow} 
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Verify & Continue
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend (OTP only) */}
        {method === 'otp' && !isLoading && (
          <TouchableOpacity 
            className="mt-6 items-center p-2"
            onPress={async () => {
              try { await authService.sendOtp(phoneNumber); } catch {}
            }}
          >
            <Text className="text-gray-500">
              Didn't receive code? <Text className="text-green-600 font-bold">Resend</Text>
            </Text>
          </TouchableOpacity>
        )}

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shadow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  }
});