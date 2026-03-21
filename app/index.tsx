import { Input } from '@/src/components/ui/Input';
import { useAuthStore } from '@/src/core/store';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
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
  
  const { setPhoneNumber } = useAuthStore();
  
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [register, setRegister] = useState(false);

  const handleContinue = async () => {
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (register) {
      // Redirect to registration website
      // Using a placeholder link for now until user provides the real one
      Linking.openURL('https://example.com/register');
      return;
    }

    setError('');
    setPhoneNumber(mobile);
    router.push('/login');
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
                  className="w-full py-4 rounded-xl items-center shadow-lg shadow-green-200 mt-4 bg-green-600"
                >
                  <Text className="text-white font-bold text-lg">
                    {register ? "Register" : "Login"}
                  </Text>
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