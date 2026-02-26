import { Input } from '@/src/components/ui/Input';
import { shopService } from '@/src/core/api/services/shop';
import { ApiError } from '@/src/core/api/types';
import { useAuthStore } from '@/src/core/store';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { phoneNumber, setShopId, setOnboardingStep } = useAuthStore();
  
  // Form state (phone comes from store — user entered it on index screen)
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [referral, setReferral] = useState('');
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleRegister = async () => {
    // 1. Validate
    let newErrors: { [key: string]: string } = {};
    if (shopName.trim().length < 3) newErrors.shopName = "Shop name is too short";
    if (ownerName.trim().length < 3) newErrors.ownerName = "Please enter full name";
    if (email && !email.includes('@')) newErrors.email = "Invalid email address";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Guard: phone must be present in store (set by index screen)
    if (!phoneNumber || phoneNumber.trim().length !== 10) {
      setApiError('Session expired. Please go back and enter your phone number again.');
      return;
    }

    // 2. Call API → POST /api/v1/shops/register
    setIsLoading(true);
    setApiError('');
    console.log('📱 Registering with phone:', phoneNumber);

    try {
      const response = await shopService.registerShop({
        shop_name: shopName.trim(),
        owner_name: ownerName.trim(),
        phone: phoneNumber,
        email: email || undefined,
        referral_code: referral || undefined,
      });

      const { shop_id, onboarding_step } = response.data;

      // 3. Save to store
      setShopId(shop_id);
      setOnboardingStep(onboarding_step);

      // 4. Navigate to verification (Step 2)
      router.push('/verify');
    } catch (err) {
      console.log(err);
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError('Something went wrong. Please try again.');
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
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Header */}
          <View className="mt-4 mb-8">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="h-10 w-10 bg-gray-100 rounded-full items-center justify-center mb-4"
            >
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>
            
            <Text className="text-3xl font-extrabold text-gray-900">
              Setup Your Shop
            </Text>
            <Text className="text-gray-500 mt-2 text-base">
              Tell us about your business. Your number{' '}
              <Text className="font-bold text-gray-700">+91 {phoneNumber}</Text>
              {' '}is already linked.
            </Text>
          </View>

          {/* API Error Banner */}
          {apiError ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <Text className="text-red-700 font-medium text-sm">{apiError}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View className="space-y-5">
            
            <Input 
              label="Shop Name"
              placeholder="e.g. Sri Lakshmi Kirana"
              value={shopName}
              onChangeText={(text) => { setShopName(text); if (errors.shopName) setErrors(prev => ({...prev, shopName: ''})); }}
              error={errors.shopName}
              autoCapitalize="words"
            />

            <Input 
              label="Owner Name"
              placeholder="e.g. Kiran Kumar"
              value={ownerName}
              onChangeText={(text) => { setOwnerName(text); if (errors.ownerName) setErrors(prev => ({...prev, ownerName: ''})); }}
              error={errors.ownerName}
              autoCapitalize="words"
            />

            <Input 
              label="Email Address (Optional)"
              placeholder="shop@gmail.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              autoCapitalize="none"
            />

            <Input 
              label="Referral / Agent Code (Optional)"
              placeholder="e.g. AGENT2026"
              value={referral}
              onChangeText={setReferral}
              autoCapitalize="characters"
            />

            <View className="mt-4">
              <TouchableOpacity 
                onPress={handleRegister}
                activeOpacity={0.8}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl items-center shadow-lg shadow-green-200 ${isLoading ? 'bg-green-400' : 'bg-green-600'}`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg tracking-wide">
                    Register & Continue
                  </Text>
                )}
              </TouchableOpacity>
            </View>

          </View>

          {/* Footer */}
          <View className="mt-8 items-center">
            <Text className="text-gray-400 text-xs text-center px-6">
              By registering, you agree to receive order notifications via WhatsApp.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}