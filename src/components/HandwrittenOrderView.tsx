import React, { useState } from 'react';
import { Dimensions, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { FileText, ZoomIn } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HandwrittenProps {
  imageUri: string;
  total: string;
  onUpdateTotal: (val: string) => void;
  status: string;
}

export function HandwrittenOrderView({ imageUri, total, onUpdateTotal, status }: HandwrittenProps) {
  const [isZoomVisible, setZoomVisible] = useState(false);

  return (
    <View>
      {/* 1. Image Card */}
      <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <View className="flex-row items-center mb-4">
          <FileText size={20} color="#16A34A" />
          <Text className="ml-2 font-bold text-gray-700">Handwritten Note</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => setZoomVisible(true)}
          activeOpacity={0.9}
          className="h-64 bg-gray-100 rounded-xl overflow-hidden border border-gray-300 relative justify-center items-center"
        >
          <Image source={{ uri: imageUri }} className="w-full h-full opacity-90" resizeMode="cover" />
          <View className="absolute bg-black/60 px-4 py-2 rounded-full flex-row items-center">
            <ZoomIn size={16} color="white" />
            <Text className="text-white font-bold ml-2 text-xs">Tap to Zoom</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 2. Total Amount Input */}
      <View className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <Text className="font-bold text-gray-500 text-xs uppercase mb-2 tracking-widest">
          {status === 'ready' ? 'Final Collection Amount' : 'Total Bill Amount'}
        </Text>
        <View className={`flex-row items-center border-b-2 pb-2 ${
          status === 'pending' ? 'border-green-500' : 'border-gray-300'
        }`}>
          <Text className="text-3xl font-bold text-gray-900 mr-2">₹</Text>
          <TextInput 
            value={total}
            onChangeText={onUpdateTotal}
            placeholder="0.00"
            keyboardType="numeric"
            editable={true} 
            className="flex-1 text-4xl font-bold text-gray-900"
          />
        </View>
        <Text className="text-gray-400 text-xs mt-2">
          {status === 'pending' ? 'Check prices manually and enter total.' : 'Update this if the final bill changed.'}
        </Text>
      </View>

      {/* Zoom Modal */}
      <Modal visible={isZoomVisible} transparent animationType="fade">
         <GestureHandlerRootView style={{ flex: 1 }}>
            <ZoomableImage uri={imageUri} onClose={() => setZoomVisible(false)} />
         </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

// --- Helper Zoom Component (Internal) ---
function ZoomableImage({ uri, onClose }: { uri: string, onClose: () => void }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => { scale.value = savedScale.value * e.scale; })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      } else {
        savedScale.value = scale.value;
      }
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pinch, pan);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }] }));

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 50, right: 20, zIndex: 100, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>✕ Close</Text>
      </TouchableOpacity>
      <GestureDetector gesture={composed}>
        <Animated.View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Image source={{ uri }} style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.8 }} resizeMode="contain" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}