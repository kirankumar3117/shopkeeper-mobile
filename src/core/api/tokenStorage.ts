/**
 * Token Storage
 * Persists JWT tokens in memory for now.
 * 
 * When running a production build (not Expo Go), you can swap
 * this to use expo-secure-store for encrypted storage.
 * Expo Go does not support native SecureStore — so we use
 * a simple in-memory store that survives the app session.
 */

const TOKEN_KEY = 'kartmithra_auth_token';
const REFRESH_TOKEN_KEY = 'kartmithra_refresh_token';

// In-memory token store (works everywhere — Expo Go, iOS, Android, Web)
let memoryToken: string | null = null;
let memoryRefreshToken: string | null = null;

// ─── Access Token ────────────────────────────────────────

export const getToken = async (): Promise<string | null> => {
  return memoryToken;
};

export const setToken = async (token: string): Promise<void> => {
  memoryToken = token;
};

export const removeToken = async (): Promise<void> => {
  memoryToken = null;
};

// ─── Refresh Token ───────────────────────────────────────

export const getRefreshToken = async (): Promise<string | null> => {
  return memoryRefreshToken;
};

export const setRefreshToken = async (token: string): Promise<void> => {
  memoryRefreshToken = token;
};

export const removeRefreshToken = async (): Promise<void> => {
  memoryRefreshToken = null;
};

// ─── Clear All Tokens ────────────────────────────────────

export const clearAllTokens = async (): Promise<void> => {
  memoryToken = null;
  memoryRefreshToken = null;
};
