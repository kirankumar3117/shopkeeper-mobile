/**
 * API Configuration
 * Central place for all API-related constants.
 * 
 * In development (__DEV__), points to your local FastAPI server.
 * In production, points to the deployed backend URL.
 */

// const DEV_BASE_URL = 'http://192.168.55.104:8000/api/v1';
const DEV_BASE_URL = 'http://localhost:8000/api/v1';
const PROD_BASE_URL = 'https://api.kartmithra.com/api/v1'; // Update when deployed

export const API_CONFIG = {
  /** Root URL for all API requests */
  BASE_URL: __DEV__ ? DEV_BASE_URL : PROD_BASE_URL,

  /** Request timeout in milliseconds (15 seconds) */
  TIMEOUT: 15_000,

  /** Default headers sent with every request */
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Platform': 'mobile',
    'X-App-Version': '1.0.0',
  } as Record<string, string>,
};
