/**
 * Auth Service
 * Handles all authentication-related API calls.
 */

import { apiClient } from '../client';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
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
};
