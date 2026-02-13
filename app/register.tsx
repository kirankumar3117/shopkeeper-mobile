import { Input } from '@/src/components/ui/Input';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// 1. Import the Store
import { useAuthStore } from '@/src/core/store';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
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
  
  // 2. Get the actions from the Store
  const { setPhoneNumber, setVerifyPurpose } = useAuthStore();
  
  // --- FORM STATE ---
  const [shopName, setShopName] = useState('Sai Ganesh & Generals');
  const [ownerName, setOwnerName] = useState('Sai Ganesh');
  const [mobile, setMobile] = useState('7585896585');
  const [email, setEmail] = useState('sai@gmail.com');
  const [referral, setReferral] = useState('');
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleRegister = () => {
    // 1. VALIDATION LOGIC
    let newErrors: { [key: string]: string } = {};
    
    if (shopName.trim().length < 3) newErrors.shopName = "Shop name is too short";
    if (ownerName.trim().length < 3) newErrors.ownerName = "Please enter full name";
    if (mobile.length !== 10) newErrors.mobile = "Enter valid 10-digit number";
    
    // Email is optional, but if entered, validate simple format
    if (email && !email.includes('@')) newErrors.email = "Invalid email address";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 2. SUCCESS -> UPDATE STORE & NAVIGATE
    // We save data to the global store so VerifyScreen can read it safely
    setPhoneNumber(mobile);
    setVerifyPurpose('register'); // <--- Critical: Tell store we are registering

    // 3. Navigate (No params needed anymore!)
    router.push('/verify');
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

          {/* --- FORM FIELDS --- */}
          <View className="space-y-5">
            
            <Input 
              label="Shop Name"
              placeholder="e.g. Sri Lakshmi Kirana"
              value={shopName}
              onChangeText={setShopName}
              error={errors.shopName}
              autoCapitalize="words"
            />

            <Input 
              label="Shopkeeper Owner Name"
              placeholder="e.g. Kiran Kumar"
              value={ownerName}
              onChangeText={setOwnerName}
              error={errors.ownerName}
              autoCapitalize="words"
            />

            <Input 
              label="Mobile Number"
              placeholder="98765 43210"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
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
                className="w-full bg-green-600 py-4 rounded-xl items-center shadow-lg shadow-green-200"
              >
                <Text className="text-white font-bold text-lg tracking-wide">
                  Continue
                </Text>
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