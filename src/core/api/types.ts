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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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
  agentCode: string;
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
}

// ─── Shop Types ──────────────────────────────────────────

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email?: string;
  address: string;
  latitude: number;
  longitude: number;
  shopImage?: string;
  ownerImage?: string;
  isOnline: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface RegisterShopRequest {
  shopName: string;
  ownerName: string;
  phone: string;
  email?: string;
  referralCode?: string;
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
