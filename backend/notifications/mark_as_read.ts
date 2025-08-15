import { api, APIError } from "encore.dev/api";
import { notificationsDB } from "./db";

export interface MarkAsReadRequest {
  notificationId: number;
  userId: number;
}

// Marks a notification as read.
export const markAsRead = api<MarkAsReadRequest, void>(
  { expose: true, method: "PUT", path: "/notifications/:notificationId/read" },
  async (req) => {
    const result = await notificationsDB.queryRow`
      UPDATE notifications 
      SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
      WHERE id = ${req.notificationId} AND user_id = ${req.userId}
      RETURNING id
    `;

    if (!result) {
      throw APIError.notFound("Notification not found");
    }
  }
);
