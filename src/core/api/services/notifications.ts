/**
 * Notifications Service
 * Push notifications inbox management for merchants.
 */

import { apiClient } from '../client';
import type {
    ApiResponse,
    Notification,
    PaginatedResponse,
} from '../types';

const NOTIFICATIONS_BASE = '/notifications';

export const notificationsService = {
  /**
   * Get total unread count (e.g., for badge on tab bar)
   * GET /notifications/unread-count
   */
  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>(`${NOTIFICATIONS_BASE}/unread-count`),

  /**
   * List all notifications
   * GET /notifications/
   */
  getNotifications: () =>
    apiClient.get<PaginatedResponse<Notification>>(`${NOTIFICATIONS_BASE}/`),

  /**
   * Mark a specific notification as read
   * PATCH /notifications/{notification_id}/read
   */
  markAsRead: (id: string) =>
    apiClient.patch<ApiResponse<Notification>>(`${NOTIFICATIONS_BASE}/${id}/read`),

  /**
   * Mark all notifications as read
   * PATCH /notifications/read-all
   */
  markAllRead: () =>
    apiClient.patch<ApiResponse<{ updated: number }>>(`${NOTIFICATIONS_BASE}/read-all`),
};
