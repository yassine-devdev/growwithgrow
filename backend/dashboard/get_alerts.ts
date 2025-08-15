import { api } from "encore.dev/api";
import { dashboardDB } from "./db";
import type { Alert } from "./types";

export interface GetAlertsRequest {
  schoolId?: number;
  userId?: number;
  severity?: string;
  category?: string;
  isRead?: boolean;
  isResolved?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetAlertsResponse {
  alerts: Alert[];
  total: number;
}

// Retrieves alerts for the dashboard.
export const getAlerts = api<GetAlertsRequest, GetAlertsResponse>(
  { expose: true, method: "GET", path: "/dashboard/alerts" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.userId) {
      whereClause += ` AND user_id = $${paramIndex}`;
      params.push(req.userId);
      paramIndex++;
    }

    if (req.severity) {
      whereClause += ` AND severity = $${paramIndex}`;
      params.push(req.severity);
      paramIndex++;
    }

    if (req.category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(req.category);
      paramIndex++;
    }

    if (req.isRead !== undefined) {
      whereClause += ` AND is_read = $${paramIndex}`;
      params.push(req.isRead);
      paramIndex++;
    }

    if (req.isResolved !== undefined) {
      whereClause += ` AND is_resolved = $${paramIndex}`;
      params.push(req.isResolved);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM alerts
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
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
      FROM alerts
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await dashboardDB.queryRow<{ total: number }>(countQuery, ...params);
    const alerts = await dashboardDB.queryAll<Alert>(dataQuery, ...params, limit, offset);

    return {
      alerts,
      total: countResult?.total || 0
    };
  }
);
