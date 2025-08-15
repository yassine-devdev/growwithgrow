import { api } from "encore.dev/api";
import { dashboardDB } from "./db";
import type { KPI } from "./types";

export interface GetKPIsRequest {
  schoolId?: number;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface GetKPIsResponse {
  kpis: KPI[];
}

// Retrieves KPIs for the dashboard.
export const getKPIs = api<GetKPIsRequest, GetKPIsResponse>(
  { expose: true, method: "GET", path: "/dashboard/kpis" },
  async (req) => {
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(req.category);
      paramIndex++;
    }

    if (req.startDate) {
      whereClause += ` AND period_start >= $${paramIndex}`;
      params.push(req.startDate);
      paramIndex++;
    }

    if (req.endDate) {
      whereClause += ` AND period_end <= $${paramIndex}`;
      params.push(req.endDate);
      paramIndex++;
    }

    const query = `
      SELECT 
        id,
        name,
        value,
        unit,
        category,
        description,
        target_value as "targetValue",
        trend,
        period_start as "periodStart",
        period_end as "periodEnd",
        school_id as "schoolId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM kpis
      ${whereClause}
      ORDER BY category, name
    `;

    const kpis = await dashboardDB.queryAll<KPI>(query, ...params);

    return { kpis };
  }
);
