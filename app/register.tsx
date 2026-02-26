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
  
  // Store actions
  const { setPhoneNumber, setVerifyPurpose, setShopId, setOnboardingStep } = useAuthStore();
  
  // --- FORM STATE ---
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [referral, setReferral] = useState('');
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleRegister = async () => {
    // 1. VALIDATION
    let newErrors: { [key: string]: string } = {};
    
    if (shopName.trim().length < 3) newErrors.shopName = "Shop name is too short";
    if (ownerName.trim().length < 3) newErrors.ownerName = "Please enter full name";
    if (mobile.length !== 10) newErrors.mobile = "Enter valid 10-digit number";
    if (email && !email.includes('@')) newErrors.email = "Invalid email address";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 2. CALL API → POST /api/v1/shops/register
    setIsLoading(true);
    setApiError('');

    try {
      const response = await shopService.registerShop({
        shop_name: shopName.trim(),
        owner_name: ownerName.trim(),
        phone: mobile,
        email: email || undefined,
        referral_code: referral || undefined,
      });

      const { shop_id, onboarding_step } = response.data;

      // 3. SAVE TO STORE
      setPhoneNumber(mobile);
      setShopId(shop_id);
      setOnboardingStep(onboarding_step);
      setVerifyPurpose('register');

      // 4. NAVIGATE TO VERIFY
      router.push('/verify');
    } catch (err) {
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
          
          {/* --- HEADER --- */}
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
              Create your business profile to start selling online.
            </Text>
          </View>

          {/* --- API ERROR BANNER --- */}
          {apiError ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <Text className="text-red-700 font-medium text-sm">{apiError}</Text>
            </View>
          ) : null}

          {/* --- FORM FIELDS --- */}
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
              label="Shopkeeper Owner Name"
              placeholder="e.g. Kiran Kumar"
              value={ownerName}
              onChangeText={(text) => { setOwnerName(text); if (errors.ownerName) setErrors(prev => ({...prev, ownerName: ''})); }}
              error={errors.ownerName}
              autoCapitalize="words"
            />

            <Input 
              label="Mobile Number"
              placeholder="98765 43210"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={(text) => { setMobile(text); if (errors.mobile) setErrors(prev => ({...prev, mobile: ''})); }}
              error={errors.mobile}
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

            {/* Growth Hack: Referral Code */}
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
                    Continue
                  </Text>
                )}
              </TouchableOpacity>
            </View>

          </View>

          {/* --- FOOTER --- */}
          <View className="mt-8 items-center">
            <Text className="text-gray-400 text-xs text-center px-6">
              By registering, you agree to allow Smart Kirana to send WhatsApp notifications for orders.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}