import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css'; // Import global CSS for NativeWind

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* This tells the app: "The first screen is index.tsx (Login)" */}
        <Stack.Screen name="index" /> 
        <Stack.Screen name="shop-setup" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}