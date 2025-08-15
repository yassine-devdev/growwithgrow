import { api } from "encore.dev/api";
import { notificationsDB } from "./db";
import type { Notification } from "./types";

export interface CreateNotificationRequest {
  userId: number;
  title: string;
  message: string;
  notificationType: 'info' | 'success' | 'warning' | 'error' | 'assignment' | 'grade' | 'announcement' | 'reminder';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  data?: any;
  actionUrl?: string;
  schoolId?: number;
  classId?: number;
  expiresAt?: Date;
}

// Creates a new notification.
export const createNotification = api<CreateNotificationRequest, Notification>(
  { expose: true, method: "POST", path: "/notifications" },
  async (req) => {
    const notification = await notificationsDB.queryRow<Notification>`
      INSERT INTO notifications (
        user_id, title, message, notification_type, priority, data,
        action_url, school_id, class_id, expires_at
      )
      VALUES (
        ${req.userId}, ${req.title}, ${req.message}, ${req.notificationType},
        ${req.priority || 'normal'}, ${req.data}, ${req.actionUrl},
        ${req.schoolId}, ${req.classId}, ${req.expiresAt}
      )
      RETURNING 
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
    `;

    return notification!;
  }
);
