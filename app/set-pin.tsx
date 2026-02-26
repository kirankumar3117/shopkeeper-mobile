import { authService } from '@/src/core/api/services/auth';
import { ApiError } from '@/src/core/api/types';
import { useAuthStore } from '@/src/core/store';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SetPinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setOnboardingStep } = useAuthStore();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const confirmRef = useRef<TextInput>(null);

  const handlePinEntry = (text: string) => {
    setError('');
    if (step === 'create') {
      setPin(text);
      if (text.length === 4) {
        // Move to confirm step
        setTimeout(() => {
          setStep('confirm');
          confirmRef.current?.focus();
        }, 200);
      }
    } else {
      setConfirmPin(text);
    }
  };

  const handleSetPin = async () => {
    if (pin !== confirmPin) {
      setError("PINs don't match. Please try again.");
      setConfirmPin('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // POST /api/v1/auth/set-pin
      await authService.setPin(pin);

      // Update store
      setOnboardingStep('pin_set');

      // Navigate to shop setup (final step)
      router.replace('/shop-setup');
    } catch (err) {
      console.log(err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to set PIN. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('create');
    setPin('');
    setConfirmPin('');
    setError('');
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

        {/* Icon */}
        <View className="items-center mb-6">
          <View className="h-16 w-16 bg-green-100 rounded-full items-center justify-center">
            <Lock size={28} color="#16A34A" />
          </View>
        </View>

        {/* Title */}
        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'create' ? 'Create a PIN' : 'Confirm PIN'}
          </Text>
          <Text className="text-gray-500 text-base text-center leading-6">
            {step === 'create' 
              ? 'Set a 4-digit PIN to secure your account. You\'ll use this to log in next time.'
              : 'Enter the same PIN again to confirm.'}
          </Text>
        </View>

        {/* PIN Input */}
        {step === 'create' ? (
          <TextInput
            className={`w-full bg-gray-50 border rounded-xl p-5 text-center text-3xl tracking-[20px] font-bold ${
              error ? 'border-red-500 bg-red-50' : 'border-green-500 bg-white'
            }`}
            placeholder="• • • •"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={4}
            value={pin}
            onChangeText={handlePinEntry}
            secureTextEntry
            autoFocus
          />
        ) : (
          <TextInput
            ref={confirmRef}
            className={`w-full bg-gray-50 border rounded-xl p-5 text-center text-3xl tracking-[20px] font-bold ${
              error ? 'border-red-500 bg-red-50' : 'border-green-500 bg-white'
            }`}
            placeholder="• • • •"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={4}
            value={confirmPin}
            onChangeText={handlePinEntry}
            secureTextEntry
            autoFocus
          />
        )}

        {/* PIN dots indicator */}
        <View className="flex-row justify-center mt-6 space-x-4">
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              className={`h-3 w-3 rounded-full mx-2 ${
                (step === 'create' ? pin : confirmPin).length > i
                  ? 'bg-green-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </View>

        {error ? (
          <Text className="text-red-500 text-center mt-4 font-medium">{error}</Text> 
        ) : null}

        {/* Confirm Button (only in confirm step) */}
        {step === 'confirm' && (
          <TouchableOpacity 
            onPress={handleSetPin}
            className={`w-full py-4 rounded-xl items-center mt-8 ${isLoading ? 'bg-green-400' : 'bg-green-600'}`}
            activeOpacity={0.8}
            disabled={isLoading || confirmPin.length !== 4}
            style={styles.shadow} 
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Set PIN & Continue
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Reset link */}
        {step === 'confirm' && (
          <TouchableOpacity 
            className="mt-4 items-center p-2"
            onPress={handleReset}
          >
            <Text className="text-gray-500">
              Want to change? <Text className="text-green-600 font-bold">Reset PIN</Text>
            </Text>
          </TouchableOpacity>
        )}

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
