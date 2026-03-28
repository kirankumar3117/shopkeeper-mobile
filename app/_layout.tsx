import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/core/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Wait for the layout to mount completely
    const timeout = setTimeout(() => setIsNavigationReady(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Only run this if layout has mounted, segments are available, and auth is checked
    if (!segments || !isNavigationReady) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inTabsGroup) {
      // Redirect to phone entry if not logged in
      setTimeout(() => router.replace('/'), 0);
    } else if (isAuthenticated && !inTabsGroup && segments[0] !== 'shop-setup' && segments[0] !== 'order-details') {
      // Redirect to orders dashboard if logged in but not in tabs, shop-setup, or order-details
      setTimeout(() => router.replace('/(tabs)/orders'), 0);
    }
  }, [isAuthenticated, segments, isNavigationReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="set-pin" />
        <Stack.Screen name="login" />
        <Stack.Screen name="shop-setup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="order-details/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}