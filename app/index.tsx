import { Input } from '@/src/components/ui/Input';
import { authService } from '@/src/core/api/services/auth';
import { ApiError } from '@/src/core/api/types';
import { useAuthStore } from '@/src/core/store';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PhoneEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { setPhoneNumber, setShopStatus, setShopId } = useAuthStore();
  
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [register, setRegister] = useState(false);

  const handleContinue = async () => {
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call check-status endpoint
      const response = await authService.checkStatus(mobile);
      const { status, shop_id } = response.data;

      // Save to store
      setPhoneNumber(mobile);
      setShopStatus(status);
      if (shop_id) setShopId(shop_id);

      // Dynamic routing based on status
      switch (status) {
        case 'new_user':
          router.push('/register');
          break;
        case 'registered':
          router.push('/verify');
          break;
        case 'verified':
          router.push('/set-pin');
          break;
        case 'pin_set':
          router.push('/shop-setup');
          break;
        case 'active':
          router.push('/login');
          break;
        default:
          router.push('/register');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to connect. Please check your network.');
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
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              {/* --- BRANDING --- */}
              <View className="items-center mb-10">
                <View className="mb-6 shadow-md shadow-green-100">
                  <Image 
                    source={require('@/assets/images/icon.png')} 
                    style={{ width: 100, height: 100, borderRadius: 20 }}
                    resizeMode="contain"
                  />
                </View>
                
                <Text className="text-3xl font-bold text-gray-900">
                  Kart Mithra
                </Text>
                <Text className="text-green-600 font-bold text-sm uppercase tracking-widest mt-1">
                  Partner App
                </Text>
              </View>

              {/* --- PHONE FORM --- */}
              <View className="space-y-6">
                <View>
                  <Input 
                    label="Mobile Number"
                    placeholder="98765 43210"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={mobile}
                    onChangeText={(text) => {
                      setMobile(text);
                      if (error) setError('');
                    }}
                    error={error}
                  />
                </View>

                <TouchableOpacity 
                  onPress={handleContinue}
                  activeOpacity={0.8}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-xl items-center shadow-lg shadow-green-200 mt-4 ${
                    isLoading ? 'bg-green-400' : 'bg-green-600'
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-lg">
                      {register ? "Register" : "Login"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* --- FOOTER --- */}
              <View className="mt-12 items-center flex-row justify-center">
               <Text className="text-gray-500">{!register ? "New to Kart Mithra? " : "Already have an account? "} </Text>
                <TouchableOpacity onPress={() => {
                  if (mobile.length === 10) setPhoneNumber(mobile);
                  setRegister(!register);

                }}>
                  <Text className="text-green-700 font-bold">{
                    register ? "Login" : "Register Shop"
                    }</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}