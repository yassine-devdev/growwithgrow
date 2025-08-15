import { api } from "encore.dev/api";
import { dashboardDB } from "./db";
import type { Alert } from "./types";

export interface CreateAlertRequest {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  schoolId?: number;
  userId?: number;
}

// Creates a new alert.
export const createAlert = api<CreateAlertRequest, Alert>(
  { expose: true, method: "POST", path: "/dashboard/alerts" },
  async (req) => {
    const alert = await dashboardDB.queryRow<Alert>`
      INSERT INTO alerts (
        title, message, severity, category, school_id, user_id
      )
      VALUES (
        ${req.title}, ${req.message}, ${req.severity}, ${req.category},
        ${req.schoolId}, ${req.userId}
      )
      RETURNING 
        id,
        title,
        message,
        severity,
        category,
        is_read as "isRead",
        is_resolved as "isResolved",
        school_id as "schoolId",
        user_id as "userId",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return alert!;
  }
);
