import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/core/store';
import '../global.css';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Only run this if layout has mounted and segments are available
    if (!segments) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inTabsGroup) {
      // Redirect to phone entry if not logged in
      router.replace('/');
    } else if (isAuthenticated && !inTabsGroup && segments[0] !== 'shop-setup' && segments[0] !== 'order-details') {
      // Redirect to orders dashboard if logged in but not in tabs, shop-setup, or order-details
      router.replace('/(tabs)/orders');
    }
  }, [isAuthenticated, segments]);

  return (
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
  );
}