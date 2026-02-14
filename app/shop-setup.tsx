import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native'; // Clean Icon
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, // Added TextInput
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
  
  // Images
  const [shopImage, setShopImage] = useState<string | null>(null);
  const [ownerImage, setOwnerImage] = useState<string | null>(null);
  
  // Location State
  const [locationAddress, setLocationAddress] = useState('Fetching location...');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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

        // 👇 KEY CHANGE: accuracy: Location.Accuracy.Highest
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest, // Forces GPS (not just WiFi/Cell towers)
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
          // Shows: "Door No 1-2, MG Road, Hyderabad" (More details)
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

  // 3. SUBMIT
  const handleVerifyAndSave = async () => {
    console.log("handleVerifyAndSave", coords);
    // if (!shopImage || !ownerImage) {
    //   Alert.alert("Missing Photos", "Please upload both Shop Front and Profile photos.");
    //   return;
    // }
    // if (!coords) {
    //   Alert.alert("Location Missing", "Please wait for location to update.");
    //   return;
    // }

    setIsLoading(true);

    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessPopup(true);
    }, 1500);
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
              <Text className="text-gray-500">Step 2 of 3</Text>
            </View>
          </View>

          {/* --- NEW: READ-ONLY LOCATION INPUT --- */}
          <Text className="font-semibold text-gray-700 mb-2">Current Shop Location</Text>
          <View className="flex-row items-center bg-gray-200 rounded-xl px-4 py-4 mb-6 border border-gray-300">
            <MapPin size={20} color="#4B5563" />
            <TextInput
              value={locationAddress}
              editable={false} // READ ONLY
              className="flex-1 ml-3 text-gray-600 font-medium"
            />
            {/* Visual indicator that it is locked */}
            <View className="bg-gray-400 rounded-full h-2 w-2 ml-2" />
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
              </View>
            )}
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleVerifyAndSave}
            className="w-full bg-green-600 py-4 rounded-xl items-center mb-10"
            style={styles.btnShadow}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Verify & Save</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      {/* --- SUCCESS MODAL WITH ANDROID FIX --- */}
      <Modal visible={showSuccessPopup} transparent animationType="fade">
        
        {/* BACKGROUND LAYER */}
        {Platform.OS === 'ios' ? (
          // iOS gets the nice Blur
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          // Android gets a DARK DIMMED OVERLAY (Fixes visibility issue)
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
            <Text className="text-2xl font-bold text-gray-900 mb-2">Success!</Text>
            <Text className="text-gray-500 text-center mb-6 leading-5">
              Your shop details and location have been captured.
            </Text>
            
            <TouchableOpacity 
              onPress={() => {
                setShowSuccessPopup(false);
                router.replace('/(tabs)/orders');
              }}
              className="w-full bg-gray-900 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-lg">Awesome</Text>
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