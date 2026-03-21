import { authService } from '@/src/core/api/services/auth';
import { setRefreshToken, setToken } from '@/src/core/api/tokenStorage';
import { ApiError } from '@/src/core/api/types';
import { useAuthStore } from '@/src/core/store';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { 
    phoneNumber,
    login,
    setToken: storeSetToken,
    setUser,
    setOnboardingStep,
  } = useAuthStore();

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (pin.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return
    }

    setIsLoading(true);
    setError('');

    try {
      // POST /api/v1/auth/login-pin
      const response = await authService.loginWithPin(phoneNumber, pin);
      const { tokens, user, onboarding_step } = response.data;

      // Store tokens
      await setToken(tokens.access_token);
      await setRefreshToken(tokens.refresh_token);

      // Update store
      storeSetToken(tokens.access_token);
      setUser(user);
      setOnboardingStep(onboarding_step);
      login();

      // Navigate to dashboard
      router.replace('/(tabs)/orders');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
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

        {/* Branding */}
        <View className="items-center mb-8">
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={{ width: 80, height: 80, borderRadius: 16 }}
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-gray-900 mt-4">
            Welcome Back!
          </Text>
          <Text className="text-gray-500 text-base mt-1">
            +91 {phoneNumber}
          </Text>
        </View>

        {/* PIN Input */}
        <View className="items-center mb-4">
          <View className="h-12 w-12 bg-green-100 rounded-full items-center justify-center mb-4">
            <Lock size={22} color="#16A34A" />
          </View>
          <Text className="text-gray-700 font-semibold mb-4">Enter your 4-digit PIN</Text>
        </View>

        <TextInput
          className={`w-full bg-gray-50 border rounded-xl p-5 text-center text-3xl tracking-[20px] font-bold ${
            error ? 'border-red-500 bg-red-50' : 'border-green-500 bg-white'
          }`}
          placeholder="• • • •"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={4}
          value={pin}
          onChangeText={(text) => {
            setPin(text);
            if (error) setError('');
          }}
          secureTextEntry
          autoFocus
          editable={!isLoading}
        />

        {/* PIN dots */}
        <View className="flex-row justify-center mt-6 space-x-4">
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              className={`h-3 w-3 rounded-full mx-2 ${
                pin.length > i ? 'bg-green-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>

        {error ? (
          <Text className="text-red-500 text-center mt-4 font-medium">{error}</Text> 
        ) : null}

        {/* Login Button */}
        <TouchableOpacity 
          onPress={handleLogin}
          className={`w-full py-4 rounded-xl items-center mt-8 ${isLoading ? 'bg-green-400' : 'bg-green-600'}`}
          activeOpacity={0.8}
          disabled={isLoading || pin.length !== 4}
          style={styles.shadow} 
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Login
            </Text>
          )}
        </TouchableOpacity>

        {/* Forgot PIN */}
        <TouchableOpacity 
          className="mt-6 items-center p-2"
          onPress={() => {
            // TODO: Implement forgot PIN flow (resend OTP → reset PIN)
          }}
        >
          <Text className="text-gray-500">
            Forgot PIN? <Text className="text-green-600 font-bold">Reset via OTP</Text>
          </Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  }
});
