import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShopSetupScreen() {
  const router = useRouter();
  const [shopImage, setShopImage] = useState<string | null>(null);
  const [ownerImage, setOwnerImage] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const pickImage = async (setImage: (uri: string) => void) => {
    // 1. Request Permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("We need permission to access your photos!");
      return;
    }

    // 2. Open Gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Compressed for speed
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        <ScrollView className="px-6 pt-4">
          
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-white rounded-full shadow-sm">
              <Text className="text-xl">←</Text>
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-900">Shop Images</Text>
              <Text className="text-gray-500">Step 2 of 3</Text>
            </View>
          </View>

          {/* Card 1: Shop Front */}
          <Text className="font-semibold text-gray-700 mb-2">Shop Front Photo</Text>
          <TouchableOpacity 
            onPress={() => pickImage(setShopImage)}
            className="w-full h-48 bg-white rounded-2xl border-2 border-dashed border-green-300 items-center justify-center mb-6 overflow-hidden"
          >
            {shopImage ? (
              <Image source={{ uri: shopImage }} className="w-full h-full" />
            ) : (
              <View className="items-center">
                <Text className="text-4xl mb-2">🏪</Text>
                <Text className="text-green-600 font-medium">Upload Shop Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Card 2: Owner Selfie */}
          <Text className="font-semibold text-gray-700 mb-2">Your Profile Photo</Text>
          <TouchableOpacity 
            onPress={() => pickImage(setOwnerImage)}
            className="w-full h-48 bg-white rounded-2xl border-2 border-dashed border-green-300 items-center justify-center mb-8 overflow-hidden"
          >
            {ownerImage ? (
              <Image source={{ uri: ownerImage }} className="w-full h-full" />
            ) : (
              <View className="items-center">
                <Text className="text-4xl mb-2">👤</Text>
                <Text className="text-green-600 font-medium">Upload Your Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={() => setShowPopup(true)}
            className="w-full bg-green-600 py-4 rounded-xl items-center shadow-lg shadow-green-200 mb-10"
          >
            <Text className="text-white font-bold text-lg">Verify & Save</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      {/* THE BLUR POPUP */}
      {showPopup && (
        <BlurView 
          intensity={40} 
          className="absolute top-0 bottom-0 left-0 right-0 justify-center items-center z-50 px-6"
        >
          <View className="bg-white p-8 rounded-3xl w-full items-center shadow-2xl">
            <View className="h-16 w-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">✅</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Success!</Text>
            <Text className="text-gray-500 text-center mb-6">
              Your shop details have been uploaded. We are verifying them now.
            </Text>
            
            <TouchableOpacity 
  onPress={() => {
    setShowPopup(false);
    router.replace('/(tabs)/orders'); // <--- CRITICAL: Use replace so they can't go back
  }}
  className="w-full bg-gray-900 py-4 rounded-xl items-center"
>
  <Text className="text-white font-bold text-lg">Awesome</Text>
</TouchableOpacity>
          </View>
        </BlurView>
      )}
    </View>
  );
}