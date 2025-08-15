import { api } from "encore.dev/api";
import { toolsDB } from "./db";
import type { Report } from "./types";

export interface ListReportsRequest {
  reportType?: string;
  isPublic?: boolean;
  schoolId?: number;
  createdBy?: number;
  limit?: number;
  offset?: number;
}

export interface ListReportsResponse {
  reports: Report[];
  total: number;
}

// Retrieves a list of reports.
export const listReports = api<ListReportsRequest, ListReportsResponse>(
  { expose: true, method: "GET", path: "/tools/reports" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.reportType) {
      whereClause += ` AND report_type = $${paramIndex}`;
      params.push(req.reportType);
      paramIndex++;
    }

    if (req.isPublic !== undefined) {
      whereClause += ` AND is_public = $${paramIndex}`;
      params.push(req.isPublic);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.createdBy) {
      whereClause += ` AND created_by = $${paramIndex}`;
      params.push(req.createdBy);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM reports
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        name,
        description,
        report_type as "reportType",
        query_config as "queryConfig",
        chart_config as "chartConfig",
        filters,
        schedule,
        is_public as "isPublic",
        is_active as "isActive",
        created_by as "createdBy",
        school_id as "schoolId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM reports
      ${whereClause}
      ORDER BY name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await toolsDB.queryRow<{ total: number }>(countQuery, ...params);
    const reports = await toolsDB.queryAll<Report>(dataQuery, ...params, limit, offset);

    return {
      reports,
      total: countResult?.total || 0
    };
  }
);
