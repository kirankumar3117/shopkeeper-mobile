/**
 * API Layer — Barrel Exports
 * 
 * Usage:
 *   import { apiClient, authService, inventoryService, ordersService, shopService } from '@/src/core/api';
 *   import type { Product, Order, ApiError } from '@/src/core/api';
 */

// Core
export { apiClient } from './client';
export { API_CONFIG } from './config';
export * from './tokenStorage';

// Services
export { authService } from './services/auth';
export { inventoryService } from './services/inventory';
export { ordersService } from './services/orders';
export { shopService } from './services/shop';

// Types (re-export everything)
export * from './types';
