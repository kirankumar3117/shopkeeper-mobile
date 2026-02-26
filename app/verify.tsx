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
  
  // Read from Store
  const { 
    login, 
    setVerificationMethod, 
    setOnboardingStep,
    setToken: storeSetToken,
    setUser,
    phoneNumber, 
    verifyPurpose, 
    verificationMethod 
  } = useAuthStore();

  const isRegistration = verifyPurpose === 'register';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Stable Switcher
  const switchMode = (newMode: 'otp' | 'agent') => {
    Keyboard.dismiss(); 
    const timer = setTimeout(() => {
      setVerificationMethod(newMode);
      setCode(''); 
      setError('');
    }, 100);
    return () => clearTimeout(timer); 
  };

  const handleSuccess = (onboardingStep: string) => {
    login();
    
    // Navigate based on onboarding progress
    if (onboardingStep === 'verified') {
      // Step 2 done → go to shop setup (Step 3)
      router.replace('/shop-setup');
    } else if (onboardingStep === 'completed') {
      // Fully onboarded → go to main app
      router.replace('/(tabs)/orders');
    } else {
      // Fallback: registration flow → shop setup
      if (isRegistration) {
        router.replace('/shop-setup');
      } else {
        router.replace('/(tabs)/orders');
      }
    }
  };

  const handleVerify = async () => {
    setError('');
    const cleanCode = code.trim();

    if (!cleanCode) {
      setError(verificationMethod === 'otp' ? 'Please enter the OTP' : 'Please enter the Agent Code');
      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (verificationMethod === 'otp') {
        // POST /api/v1/auth/verify-otp
        response = await authService.verifyOtp(phoneNumber, cleanCode);
      } else {
        // POST /api/v1/auth/verify-agent  
        response = await authService.verifyAgentCode(phoneNumber, cleanCode);
      }

      const { tokens, user, onboarding_step } = response.data;

      // 1. Store tokens securely
      await setToken(tokens.access_token);
      await setRefreshToken(tokens.refresh_token);

      // 2. Update Zustand store
      storeSetToken(tokens.access_token);
      setUser(user);
      setOnboardingStep(onboarding_step);

      // 3. Navigate based on onboarding progress
      handleSuccess(onboarding_step);
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
          <Text className="text-lg text-gray-600 ml-2">Change Number</Text>
        </TouchableOpacity>

        {/* Title Section */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            {verificationMethod === 'otp' ? 'Enter OTP' : 'Agent Code'}
          </Text>
          <Text className="text-gray-500 text-base leading-6">
            {verificationMethod === 'otp' 
              ? `We sent a 4-digit code to +91 ${phoneNumber || '******'}` 
              : 'Enter the unique code provided by your field agent to activate your account.'}
          </Text>
        </View>

        {/* Toggle Switch (Registration Only) */}
        {isRegistration && (
          <View className="flex-row bg-gray-100 p-1 rounded-xl mb-8">
            <TouchableOpacity 
              onPress={() => switchMode('agent')}
              className="flex-1 py-3 rounded-lg items-center"
              style={verificationMethod === 'agent' ? styles.activeTab : null}
            >
              <Text className={`font-bold ${verificationMethod === 'agent' ? 'text-green-600' : 'text-gray-500'}`}>
                Agent Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => switchMode('otp')}
              className="flex-1 py-3 rounded-lg items-center"
              style={verificationMethod === 'otp' ? styles.activeTab : null}
            >
              <Text className={`font-bold ${verificationMethod === 'otp' ? 'text-green-600' : 'text-gray-500'}`}>
                SMS OTP
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Field */}
        <TextInput 
          key={verificationMethod}
          className={`w-full bg-gray-50 border rounded-xl p-5 text-center text-2xl tracking-widest font-bold ${
            error ? 'border-red-500 bg-red-50' : 'border-green-500 bg-white'
          }`}
          placeholder={verificationMethod === 'otp' ? "• • • •" : "AGENT CODE"}
          placeholderTextColor="#9CA3AF"
          keyboardType={verificationMethod === 'otp' ? "number-pad" : "default"} 
          maxLength={verificationMethod === 'otp' ? 4 : 20}
          value={code}
          onChangeText={(text) => {
            setCode(text);
            if(error) setError('');
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
              {verificationMethod === 'otp' ? 'Verify & Login' : 'Verify Agent'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend Link (OTP only) */}
        {verificationMethod === 'otp' && !isLoading && (
          <TouchableOpacity 
            className="mt-6 items-center p-2"
            onPress={async () => {
              try {
                await authService.sendOtp(phoneNumber);
              } catch {}
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

// --- SAFE STYLES (Bypasses NativeWind Bug) ---
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