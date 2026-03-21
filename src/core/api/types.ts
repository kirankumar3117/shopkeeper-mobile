/**
 * API Types & Interfaces
 * All shared TypeScript types for the API layer.
 */

// ─── Generic API Response Wrappers ───────────────────────

/** Standard API success response */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/** Custom API error */
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Check if this is a network/connection error */
  get isNetworkError(): boolean {
    return this.status === 0;
  }

  /** Check if token is expired / unauthorized */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Check if request was forbidden */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** Check if resource was not found */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** Check if this is a server error */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

// ─── Auth Types ──────────────────────────────────────────

export type OnboardingStep = 'registered' | 'verified' | 'pin_set' | 'completed';

/** Possible statuses returned by check-status */
export type ShopStatus = 'new_user' | 'registered' | 'verified' | 'pin_set' | 'active';

/** Response from POST /auth/check-status */
export interface CheckStatusResponse {
  status: ShopStatus;
  shop_id: string | null;
  shop_name: string | null;
  phone: string;
}

/** Request for POST /auth/login-pin */
export interface LoginWithPinRequest {
  phone_number: string;
  password: string;
}

/** Request for POST /auth/set-pin */
export interface SetPinRequest {
  pin: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface VerifyAgentCodeRequest {
  phone: string;
  agent_code: string;
}

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: 'shopkeeper' | 'agent' | 'admin';
  isVerified: boolean;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  onboarding_step: OnboardingStep;
}

// ─── Shop Types ──────────────────────────────────────────

export interface Shop {
  id: string;
  shop_name: string;
  owner_name: string;
  phone: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  shop_image_url?: string;
  owner_image_url?: string;
  is_online: boolean;
  is_verified: boolean;
  is_onboarded: boolean;
  onboarding_step: OnboardingStep;
  created_at: string;
  updated_at?: string;
}

export interface RegisterShopRequest {
  shop_name: string;
  owner_name: string;
  phone: string;
  email?: string;
  referral_code?: string;
}

export interface RegisterShopResponse {
  shop_id: string;
  phone: string;
  onboarding_step: OnboardingStep;
}

export interface ShopSetupRequest {
  latitude: number;
  longitude: number;
  address: string;
  // Images are sent as FormData, not JSON
}

// ─── Product / Inventory Types ───────────────────────────

export interface Product {
  id: number;
  name: string;
  variant: string;
  price: number;
  stock: boolean;
  category?: string;
  imageUrl?: string;
  barcode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  variant: string;
  price: number;
  stock?: boolean;
  category?: string;
}

export interface UpdateProductRequest {
  name?: string;
  variant?: string;
  price?: number;
  stock?: boolean;
  category?: string;
}

export interface BulkUpdateProductsRequest {
  products: Array<{
    id: number;
    price?: number;
    stock?: boolean;
  }>;
}

// ─── Order Types ─────────────────────────────────────────

export interface OrderItem {
  id: number;
  name: string;
  qty: string;
  price: number;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed';
export type OrderType = 'list' | 'image';

export interface Order {
  id: string;
  status: OrderStatus;
  time: string;
  payment: string;
  total: string;
  type: OrderType;
  items: OrderItem[];
  imageUrl?: string;
  customerName?: string;
  customerPhone?: string;
  scheduledPickup?: string;
  createdAt?: string;
}

export interface AcceptOrderRequest {
  total?: string;
}

export interface RejectOrderRequest {
  reason?: string;
}

// ─── Generic Hook State ──────────────────────────────────

export interface ApiHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
