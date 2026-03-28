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
  data?: T[];
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

export interface ShopDashboardResponse {
  shop_name: string;
  mobile: string;
  total_earnings: number;
  today_earnings: number;
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

export interface MasterProduct {
  id: string;
  name: string;
  brand?: string;
  category_id?: string;
  subcategory_id?: string;
  image_url?: string;
  barcode?: string;
  created_at?: string;
}

export interface ProductRequest {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface InventoryItem {
  id: string; // inventory_id
  product_id: string;
  name: string; // derived from master
  price: number;
  unit: string;
  stock: number;
  image_url?: string;
}

export interface AddToInventoryRequest {
  product_id: string;
  price: number;
  stock: number;
}

export interface UpdateInventoryRequest {
  price?: number;
  stock?: number;
}

export interface CreateProductRequestPayload {
  name: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  // images can be handled via FormData if needed, omitting here for JSON
}

// ─── Order Types ─────────────────────────────────────────

export interface OrderProduct {
  id: string;
  name: string;
  image_url?: string;
  unit?: string;
  mrp?: number;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time_of_order: number;
  special_instructions?: string | null;
  product: OrderProduct;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'rejected';
export type OrderType = 'instant' | 'pre_order' | 'list' | 'image';

export interface Order {
  id: string;
  order_number?: string;
  customer_id: string;
  customer_phone?: string;
  shop_id: string;
  status: OrderStatus;
  total_amount: number;
  order_type: OrderType;
  items: OrderItem[];
  list_image_urls?: string[] | null;
  order_notes?: string | null;
  scheduled_pickup_time?: string;
  estimated_preparation_minutes?: number | null;
  created_at?: string;
}

export interface MerchantOrdersResponse {
  data: Order[];
  total_count: number;
  total_pages: number;
  current_page: number;
}

export interface UpdateOrderRequest {
  status: OrderStatus;
  estimated_preparation_minutes?: number;
  total_amount?: number;
  comment?: string;
  order_notes?: string;
}

// ─── Notifications & WebSockets ──────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
  read_at?: string;
}

export interface WebSocketMessage {
  type: string;
  order_id?: string;
  customer_name?: string;
  total_amount?: number;
  item_count?: number;
  [key: string]: any;
}

// ─── Generic Hook State ──────────────────────────────────

export interface ApiHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
