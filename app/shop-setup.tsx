import { shopService } from '@/src/core/api/services/shop';
import { ApiError } from '@/src/core/api/types';
import { useAuthStore } from '@/src/core/store';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShopSetupScreen() {
  const router = useRouter();
  const { setOnboardingStep } = useAuthStore();
  
  // Images
  const [shopImage, setShopImage] = useState<string | null>(null);
  const [ownerImage, setOwnerImage] = useState<string | null>(null);
  
  // Location State
  const [locationAddress, setLocationAddress] = useState('Fetching location...');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [apiError, setApiError] = useState('');

  // 1. AUTO-FETCH LOCATION ON MOUNT
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationAddress('Permission denied - Enable Location');
          return;
        }

        setLocationAddress('Fetching precise location...');

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

        setCoords({
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });

        // Get readable address
        let address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

        if (address.length > 0) {
          const loc = address[0];
          const street = loc.street || loc.name || '';
          const city = loc.city || loc.district || '';
          const region = loc.region || '';
          
          setLocationAddress(`${street ? street + ', ' : ''}${city}, ${region}`);
        } else {
          setLocationAddress(`${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`);
        }
      } catch (error) {
        setLocationAddress('Unable to fetch location. Try moving outdoors.');
      }
    })();
  }, []);

  // 2. IMAGE PICKER
  const pickImage = async (setImage: (uri: string) => void) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Gallery access is needed.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, 
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // 3. SUBMIT → POST /api/v1/shops/setup
  const handleVerifyAndSave = async () => {
    if (!coords) {
      Alert.alert("Location Missing", "Please wait for location to update, or try again outdoors.");
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      await shopService.setupShop({
        latitude: coords.lat,
        longitude: coords.lng,
        address: locationAddress,
        shopImageUri: shopImage || undefined,
        ownerImageUri: ownerImage || undefined,
      });

      // Mark onboarding as complete in store
      setOnboardingStep('completed');

      // Show success popup
      setShowSuccessPopup(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
        Alert.alert("Setup Failed", err.message);
      } else {
        setApiError('Something went wrong. Please try again.');
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        <ScrollView className="px-6 pt-4" showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="mr-4 p-2 bg-white rounded-full items-center justify-center h-10 w-10"
              style={styles.smallShadow}
            >
              <Text className="text-xl">←</Text>
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-900">Shop Details</Text>
              <Text className="text-gray-500">Final Step — Setup Location & Photos</Text>
            </View>
          </View>

          {/* --- API ERROR BANNER --- */}
          {apiError ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <Text className="text-red-700 font-medium text-sm">{apiError}</Text>
            </View>
          ) : null}

          {/* --- READ-ONLY LOCATION INPUT --- */}
          <Text className="font-semibold text-gray-700 mb-2">Current Shop Location</Text>
          <View className="flex-row items-center bg-gray-200 rounded-xl px-4 py-4 mb-6 border border-gray-300">
            <MapPin size={20} color="#4B5563" />
            <TextInput
              value={locationAddress}
              editable={false}
              className="flex-1 ml-3 text-gray-600 font-medium"
            />
            {coords ? (
              <View className="bg-green-500 rounded-full h-2 w-2 ml-2" />
            ) : (
              <ActivityIndicator size="small" color="#9CA3AF" />
            )}
          </View>

          {/* Card 1: Shop Front */}
          <Text className="font-semibold text-gray-700 mb-2">Shop Front Photo</Text>
          <TouchableOpacity 
            onPress={() => pickImage(setShopImage)}
            className="w-full h-48 bg-white rounded-2xl border-2 border-dashed border-green-300 items-center justify-center mb-6 overflow-hidden"
          >
            {shopImage ? (
              <Image source={{ uri: shopImage }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <Text className="text-4xl mb-2">🏪</Text>
                <Text className="text-green-600 font-medium">Upload Shop Photo</Text>
                <Text className="text-gray-400 text-xs mt-1">(Optional)</Text>
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
              <Image source={{ uri: ownerImage }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <Text className="text-4xl mb-2">👤</Text>
                <Text className="text-green-600 font-medium">Upload Your Photo</Text>
                <Text className="text-gray-400 text-xs mt-1">(Optional)</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleVerifyAndSave}
            className={`w-full py-4 rounded-xl items-center mb-10 ${isLoading || !coords ? 'bg-green-400' : 'bg-green-600'}`}
            style={styles.btnShadow}
            activeOpacity={0.8}
            disabled={isLoading || !coords}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {coords ? 'Save & Go Live' : 'Waiting for Location...'}
              </Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      {/* --- SUCCESS MODAL --- */}
      <Modal visible={showSuccessPopup} transparent animationType="fade">
        
        {/* BACKGROUND LAYER */}
        {Platform.OS === 'ios' ? (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)' }]} />
        )}

        <View className="flex-1 justify-center items-center px-6">
          <View 
            className="bg-white p-8 rounded-3xl w-full items-center"
            style={styles.cardShadow}
          >
            <View className="h-16 w-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">✅</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</Text>
            <Text className="text-gray-500 text-center mb-6 leading-5">
              Your shop is now registered and live on Kart Mithra. Start receiving orders!
            </Text>
            
            <TouchableOpacity 
              onPress={() => {
                setShowSuccessPopup(false);
                router.replace('/(tabs)/orders');
              }}
              className="w-full bg-gray-900 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-lg">Start Selling →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// --- SAFE STYLES ---
const styles = StyleSheet.create({
  smallShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  btnShadow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  }
});