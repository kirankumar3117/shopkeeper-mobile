/**
 * Token Storage
 * Securely persists JWT tokens using expo-secure-store (native)
 * or falls back to in-memory storage (web).
 */

import { Platform } from 'react-native';

const TOKEN_KEY = 'kartmithra_auth_token';
const REFRESH_TOKEN_KEY = 'kartmithra_refresh_token';

// In-memory fallback for web or when SecureStore is unavailable
let memoryToken: string | null = null;
let memoryRefreshToken: string | null = null;

/**
 * Dynamically import SecureStore only on native platforms.
 * This avoids crashes on web where SecureStore isn't available.
 */
const getSecureStore = async () => {
  if (Platform.OS === 'web') return null;
  try {
    return await import('expo-secure-store');
  } catch {
    return null;
  }
};

// ─── Access Token ────────────────────────────────────────

export const getToken = async (): Promise<string | null> => {
  const SecureStore = await getSecureStore();
  if (SecureStore) {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }
  return memoryToken;
};

export const setToken = async (token: string): Promise<void> => {
  const SecureStore = await getSecureStore();
  if (SecureStore) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
  memoryToken = token;
};

export const removeToken = async (): Promise<void> => {
  const SecureStore = await getSecureStore();
  if (SecureStore) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
  memoryToken = null;
};

// ─── Refresh Token ───────────────────────────────────────

export const getRefreshToken = async (): Promise<string | null> => {
  const SecureStore = await getSecureStore();
  if (SecureStore) {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }
  return memoryRefreshToken;
};

export const setRefreshToken = async (token: string): Promise<void> => {
  const SecureStore = await getSecureStore();
  if (SecureStore) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  }
  memoryRefreshToken = token;
};

export const removeRefreshToken = async (): Promise<void> => {
  const SecureStore = await getSecureStore();
  if (SecureStore) {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
  memoryRefreshToken = null;
};

// ─── Clear All Tokens ────────────────────────────────────

export const clearAllTokens = async (): Promise<void> => {
  await removeToken();
  await removeRefreshToken();
};
