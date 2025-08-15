import { api } from "encore.dev/api";
import { notificationsDB } from "./db";
import type { NotificationPreference } from "./types";

export interface UpdatePreferencesRequest {
  userId: number;
  notificationType: string;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  inAppEnabled?: boolean;
}

// Updates notification preferences for a user.
export const updatePreferences = api<UpdatePreferencesRequest, NotificationPreference>(
  { expose: true, method: "PUT", path: "/notifications/preferences" },
  async (req) => {
    const preference = await notificationsDB.queryRow<NotificationPreference>`
      INSERT INTO notification_preferences (
        user_id, notification_type, email_enabled, push_enabled, sms_enabled, in_app_enabled
      )
      VALUES (
        ${req.userId}, ${req.notificationType}, ${req.emailEnabled},
        ${req.pushEnabled}, ${req.smsEnabled}, ${req.inAppEnabled}
      )
      ON CONFLICT (user_id, notification_type) 
      DO UPDATE SET 
        email_enabled = COALESCE(EXCLUDED.email_enabled, notification_preferences.email_enabled),
        push_enabled = COALESCE(EXCLUDED.push_enabled, notification_preferences.push_enabled),
        sms_enabled = COALESCE(EXCLUDED.sms_enabled, notification_preferences.sms_enabled),
        in_app_enabled = COALESCE(EXCLUDED.in_app_enabled, notification_preferences.in_app_enabled),
        updated_at = NOW()
      RETURNING 
        id,
        user_id as "userId",
        notification_type as "notificationType",
        email_enabled as "emailEnabled",
        push_enabled as "pushEnabled",
        sms_enabled as "smsEnabled",
        in_app_enabled as "inAppEnabled",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return preference!;
  }
);
