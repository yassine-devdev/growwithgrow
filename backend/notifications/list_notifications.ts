import { api } from "encore.dev/api";
import { notificationsDB } from "./db";
import type { Notification } from "./types";

export interface ListNotificationsRequest {
  userId: number;
  notificationType?: string;
  isRead?: boolean;
  priority?: string;
  schoolId?: number;
  limit?: number;
  offset?: number;
}

export interface ListNotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

// Retrieves notifications for a user.
export const listNotifications = api<ListNotificationsRequest, ListNotificationsResponse>(
  { expose: true, method: "GET", path: "/notifications" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())";
    const params: any[] = [req.userId];
    let paramIndex = 2;

    if (req.notificationType) {
      whereClause += ` AND notification_type = $${paramIndex}`;
      params.push(req.notificationType);
      paramIndex++;
    }

    if (req.isRead !== undefined) {
      whereClause += ` AND is_read = $${paramIndex}`;
      params.push(req.isRead);
      paramIndex++;
    }

    if (req.priority) {
      whereClause += ` AND priority = $${paramIndex}`;
      params.push(req.priority);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM notifications
      ${whereClause}
    `;

    const unreadCountQuery = `
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = $1 AND is_read = FALSE AND (expires_at IS NULL OR expires_at > NOW())
    `;

    const dataQuery = `
      SELECT 
        id,
        user_id as "userId",
        title,
        message,
        notification_type as "notificationType",
        priority,
        data,
        is_read as "isRead",
        read_at as "readAt",
        action_url as "actionUrl",
        school_id as "schoolId",
        class_id as "classId",
        expires_at as "expiresAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM notifications
      ${whereClause}
      ORDER BY priority DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await notificationsDB.queryRow<{ total: number }>(countQuery, ...params);
    const unreadResult = await notificationsDB.queryRow<{ unread_count: number }>(unreadCountQuery, req.userId);
    const notifications = await notificationsDB.queryAll<Notification>(dataQuery, ...params, limit, offset);

    return {
      notifications,
      total: countResult?.total || 0,
      unreadCount: unreadResult?.unread_count || 0
    };
  }
);
