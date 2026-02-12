import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView, TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function ZoomableImage({ uri }: { uri: string }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else if (scale.value > 5) {
        scale.value = withTiming(5);
        savedScale.value = 5;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withTiming(2.5);
        savedScale.value = 2.5;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, animatedStyle]}>
        <Image
          source={{ uri }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.8 }}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'image'>('list');

  // State for the "Zoomed In" Modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // MOCK DATA: 3 Dummy Paper Slips
  const paperSlips = [
    'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', // Handwritten Note
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', // Notebook page
    'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', // Receipt
  ];

  const fullItems = [
    { name: 'Aashirvaad Atta', qty: '5kg', price: '245' },
    { name: 'Freedom Oil', qty: '2L', price: '220' },
    { name: 'Tata Salt', qty: '3 pkts', price: '84' },
    { name: 'Maggi Noodles', qty: '4 pcs', price: '56' },
    { name: 'Red Label Tea', qty: '250g', price: '140' },
  ];

  const closeModal = useCallback(() => setSelectedImage(null), []);

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">

        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-100 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-lg font-bold text-gray-900">Order Details</Text>
            <Text className="text-green-600 font-bold text-sm">{id}</Text>
          </View>
          <View className="w-10" />
        </View>

        {/* View Toggle */}
        <View className="flex-row justify-center space-x-4 py-6">
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`px-6 py-2 rounded-full border ${
              viewMode === 'list' ? 'bg-black border-black' : 'bg-white border-gray-200'
            }`}
          >
            <Text className={viewMode === 'list' ? 'text-white font-bold' : 'text-gray-600'}>
              Item List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('image')}
            className={`px-6 py-2 rounded-full border ${
              viewMode === 'image' ? 'bg-black border-black' : 'bg-white border-gray-200'
            }`}
          >
            <Text className={viewMode === 'image' ? 'text-white font-bold' : 'text-gray-600'}>
              Paper Slips ({paperSlips.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <ScrollView className="flex-1 px-6">
          {viewMode === 'list' ? (
            // LIST VIEW
            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              {fullItems.map((item, index) => (
                <View key={index} className="flex-row justify-between py-3 border-b border-gray-200 last:border-0">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-gray-400 font-bold mr-3">{index + 1}.</Text>
                    <Text className="text-lg text-gray-800 font-medium">{item.name}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-gray-900">{item.qty}</Text>
                    <Text className="text-xs text-gray-500">₹{item.price}</Text>
                  </View>
                </View>
              ))}
              <View className="mt-4 pt-4 border-t border-gray-300 flex-row justify-between items-center">
                <Text className="text-gray-600 font-bold">Total Bill Amount</Text>
                <Text className="text-2xl font-bold text-green-700">₹745.00</Text>
              </View>
            </View>
          ) : (
            // IMAGE VIEW (Multiple Slips)
            <View className="pb-10">
              <Text className="text-gray-500 mb-4 text-center">Tap any slip to zoom in 🔍</Text>

              {paperSlips.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(img)}
                  activeOpacity={0.9}
                  className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <View className="bg-gray-100 p-2 border-b border-gray-200 flex-row justify-between">
                    <Text className="font-bold text-gray-500">Slip #{index + 1}</Text>
                    <Text className="text-xs text-gray-400">Uploaded 2m ago</Text>
                  </View>
                  <Image
                    source={{ uri: img }}
                    style={{ width: '100%', height: 250 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* ZOOM MODAL (Pinch-to-Zoom + Pan + Double-Tap) */}
        <Modal
          visible={!!selectedImage}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>

            {/* Close Button (Floating on top) — uses gesture-handler TouchableOpacity for iOS */}
            <SafeAreaView style={{ position: 'absolute', top: 16, right: 16, zIndex: 50 }}>
              <GHTouchableOpacity
                onPress={closeModal}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  padding: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>✕ Close</Text>
              </GHTouchableOpacity>
            </SafeAreaView>

            {/* Zoomable Image */}
            {selectedImage && <ZoomableImage uri={selectedImage} />}

            {/* Helper Text */}
            <View style={{ position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' }}>
              <Text style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 13,
                backgroundColor: 'rgba(0,0,0,0.4)',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
              }}>
                Pinch to Zoom • Double-tap to Toggle • Drag to Pan
              </Text>
            </View>

          </GestureHandlerRootView>
        </Modal>

      </SafeAreaView>
    </View>
  );
}