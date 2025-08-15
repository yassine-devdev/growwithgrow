import { api } from "encore.dev/api";
import { notificationsDB } from "./db";
import type { NotificationPreference } from "./types";

export interface GetPreferencesRequest {
  userId: number;
}

export interface GetPreferencesResponse {
  preferences: NotificationPreference[];
}

// Retrieves notification preferences for a user.
export const getPreferences = api<GetPreferencesRequest, GetPreferencesResponse>(
  { expose: true, method: "GET", path: "/notifications/preferences" },
  async (req) => {
    const preferences = await notificationsDB.queryAll<NotificationPreference>`
      SELECT 
        id,
        user_id as "userId",
        notification_type as "notificationType",
        email_enabled as "emailEnabled",
        push_enabled as "pushEnabled",
        sms_enabled as "smsEnabled",
        in_app_enabled as "inAppEnabled",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM notification_preferences
      WHERE user_id = ${req.userId}
    `;

    return { preferences };
  }
);
