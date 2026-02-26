/**
 * useAuth — Authentication Hook
 * Wraps authService calls and syncs with authStore + tokenStorage.
 *
 * Usage in Login/Verify screens:
 *   const { sendOtp, verifyOtp, verifyAgent, loading, error } = useAuth();
 */

import { authService } from '@/src/core/api/services/auth';
import { clearAllTokens, setRefreshToken, setToken } from '@/src/core/api/tokenStorage';
import { ApiError } from '@/src/core/api/types';
import { useAuthStore } from '@/src/core/store';
import { useCallback, useState } from 'react';

interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  /** Send OTP to phone number */
  sendOtp: (phone: string) => Promise<boolean>;
  /** Verify OTP and authenticate */
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  /** Verify agent code and authenticate */
  verifyAgent: (phone: string, agentCode: string) => Promise<boolean>;
  /** Clear auth state and tokens */
  handleLogout: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, logout, setPhoneNumber } = useAuthStore();

  const sendOtp = useCallback(async (phone: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await authService.sendOtp(phone);
      setPhoneNumber(phone);
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to send OTP';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setPhoneNumber]);

  const verifyOtp = useCallback(async (phone: string, otp: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyOtp(phone, otp);
      const { tokens } = response.data;

      // Persist tokens securely
      await setToken(tokens.accessToken);
      await setRefreshToken(tokens.refreshToken);

      // Update Zustand store
      login();
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Invalid OTP';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const verifyAgent = useCallback(async (phone: string, agentCode: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyAgentCode(phone, agentCode);
      const { tokens } = response.data;

      await setToken(tokens.accessToken);
      await setRefreshToken(tokens.refreshToken);

      login();
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Invalid Agent Code';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const handleLogout = useCallback(async () => {
    await clearAllTokens();
    logout();
  }, [logout]);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    sendOtp,
    verifyOtp,
    verifyAgent,
    handleLogout,
    clearError,
  };
}
