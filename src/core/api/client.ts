/**
 * API Client
 * Lightweight HTTP client wrapping fetch() with:
 * - Automatic auth header injection
 * - Timeout support
 * - Centralized error handling
 * - Request/response logging in dev mode
 */

import { API_CONFIG } from './config';
import { getToken } from './tokenStorage';
import { ApiError } from './types';

// ─── Types ───────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  /** Additional headers to merge with defaults */
  headers?: Record<string, string>;
  /** Skip automatic Bearer token injection */
  skipAuth?: boolean;
  /** Custom timeout in ms (overrides API_CONFIG.TIMEOUT) */
  timeout?: number;
  /** AbortSignal for manual cancellation */
  signal?: AbortSignal;
}

// ─── Core Request Function ───────────────────────────────

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  // Build headers
  const headers: Record<string, string> = {
    ...API_CONFIG.HEADERS,
    ...options.headers,
  };

  // Inject auth token unless explicitly skipped
  if (!options.skipAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeout ?? API_CONFIG.TIMEOUT
  );

  // Dev logging
  if (__DEV__) {
    console.log(`🌐 [${method}] ${endpoint}`, body ? JSON.stringify(body).slice(0, 200) : '');
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: options.signal ?? controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response
    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Dev logging
    if (__DEV__) {
      const emoji = response.ok ? '✅' : '❌';
      console.log(`${emoji} [${response.status}] ${endpoint}`,
        typeof data === 'object' ? JSON.stringify(data).slice(0, 300) : data
      );
    }

    // Handle error responses
    if (!response.ok) {
      // FastAPI validation errors return `detail` as an array of objects,
      // e.g. [{ loc: [...], msg: "...", type: "..." }]
      // Naively doing `data?.detail` would produce "[Object Object]"
      let errorMessage: string;
      if (typeof data?.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data?.detail)) {
        // Extract the human-readable msg from each validation error
        errorMessage = data.detail
          .map((e: any) => e?.msg ?? JSON.stringify(e))
          .join(', ');
      } else if (typeof data?.message === 'string') {
        errorMessage = data.message;
      } else {
        errorMessage = `Request failed with status ${response.status}`;
      }

      throw new ApiError(
        errorMessage,
        response.status,
        data?.code,
        data?.details
      );
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle abort/timeout
    if (error?.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. Check your internet connection.',
        0,
        'TIMEOUT'
      );
    }

    // Handle network errors
    throw new ApiError(
      'Unable to connect to server. Please check your network.',
      0,
      'NETWORK_ERROR'
    );
  }
}

// ─── Multipart Upload ────────────────────────────────────

/**
 * Upload FormData (for images, files, etc.)
 * Does NOT set Content-Type — fetch auto-sets it with boundary.
 */
async function upload<T>(
  endpoint: string,
  formData: FormData,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...options.headers,
  };
  // Do NOT set Content-Type for FormData — fetch handles the multipart boundary

  if (!options.skipAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeout ?? 30_000 // 30s for uploads
  );

  if (__DEV__) {
    console.log(`📤 [UPLOAD] ${endpoint}`);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal: options.signal ?? controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data?.message || 'Upload failed',
        response.status,
        data?.code
      );
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) throw error;
    throw new ApiError('Upload failed. Check your connection.', 0, 'UPLOAD_ERROR');
  }
}

// ─── Public API ──────────────────────────────────────────

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>('GET', endpoint, undefined, options),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', endpoint, body, options),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', endpoint, body, options),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', endpoint, body, options),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>('DELETE', endpoint, undefined, options),

  upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
    upload<T>(endpoint, formData, options),
};
