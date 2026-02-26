/**
 * Auth Service
 * Handles all authentication-related API calls.
 */

import { apiClient } from '../client';
import type {
  ApiResponse,
  AuthResponse,
  CheckStatusResponse,
  LoginRequest,
  LoginWithPinRequest,
  SetPinRequest,
  VerifyAgentCodeRequest,
  VerifyOtpRequest,
} from '../types';

const AUTH_BASE = '/auth';

export const authService = {
  /**
   * Send OTP to a phone number
   * POST /auth/send-otp
   */
  sendOtp: (phone: string) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      `${AUTH_BASE}/send-otp`,
      { phone } as LoginRequest,
      { skipAuth: true }
    ),

  /**
   * Verify OTP and get auth tokens
   * POST /auth/verify-otp
   */
  verifyOtp: (phone: string, otp: string) =>
    apiClient.post<ApiResponse<AuthResponse>>(
      `${AUTH_BASE}/verify-otp`,
      { phone, otp } as VerifyOtpRequest,
      { skipAuth: true }
    ),

  /**
   * Verify using field agent code
   * POST /auth/verify-agent
   */
  verifyAgentCode: (phone: string, agentCode: string) =>
    apiClient.post<ApiResponse<AuthResponse>>(
      `${AUTH_BASE}/verify-agent`,
      { phone, agent_code: agentCode } as VerifyAgentCodeRequest,
      { skipAuth: true }
    ),

  /**
   * Refresh the access token using the refresh token
   * POST /auth/refresh
   */
  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>(
      `${AUTH_BASE}/refresh`,
      { refresh_token: refreshToken },
      { skipAuth: true }
    ),

  /**
   * Check phone number status for progressive onboarding
   * POST /auth/check-status
   */
  checkStatus: (phone: string) =>
    apiClient.post<ApiResponse<CheckStatusResponse>>(
      `${AUTH_BASE}/check-status`,
      { phone } as LoginRequest,
      { skipAuth: true }
    ),

  /**
   * Login with PIN (returning users)
   * POST /auth/login-pin
   */
  loginWithPin: (phone: string, pin: string) =>
    apiClient.post<ApiResponse<AuthResponse>>(
      `${AUTH_BASE}/login-pin`,
      { phone, pin } as LoginWithPinRequest,
      { skipAuth: true }
    ),

  /**
   * Set 4-digit PIN after verification (requires auth)
   * POST /auth/set-pin
   */
  setPin: (pin: string) =>
    apiClient.post<ApiResponse<{ message: string; onboarding_step: string }>>(
      `${AUTH_BASE}/set-pin`,
      { pin } as SetPinRequest,
    ),
};
