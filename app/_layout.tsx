import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="set-pin" />
      <Stack.Screen name="login" />
      <Stack.Screen name="shop-setup" />
    </Stack>
  );
}