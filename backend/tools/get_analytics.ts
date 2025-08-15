import { api } from "encore.dev/api";
import { toolsDB } from "./db";
import type { AnalyticsData } from "./types";

export interface GetAnalyticsRequest {
  metricName?: string;
  source?: string;
  schoolId?: number;
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'day' | 'week' | 'month';
  limit?: number;
  offset?: number;
}

export interface GetAnalyticsResponse {
  data: AnalyticsData[];
  total: number;
  aggregated: Array<{
    period: string;
    value: number;
  }>;
}

// Retrieves analytics data.
export const getAnalytics = api<GetAnalyticsRequest, GetAnalyticsResponse>(
  { expose: true, method: "GET", path: "/tools/analytics" },
  async (req) => {
    const limit = req.limit || 100;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.metricName) {
      whereClause += ` AND metric_name = $${paramIndex}`;
      params.push(req.metricName);
      paramIndex++;
    }

    if (req.source) {
      whereClause += ` AND source = $${paramIndex}`;
      params.push(req.source);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.startDate) {
      whereClause += ` AND date >= $${paramIndex}`;
      params.push(req.startDate);
      paramIndex++;
    }

    if (req.endDate) {
      whereClause += ` AND date <= $${paramIndex}`;
      params.push(req.endDate);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM analytics_data
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        metric_name as "metricName",
        metric_value as "metricValue",
        dimensions,
        date,
        hour,
        source,
        school_id as "schoolId",
        created_at as "createdAt"
      FROM analytics_data
      ${whereClause}
      ORDER BY date DESC, hour DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Aggregated query based on groupBy
    let groupByClause = "date";
    if (req.groupBy === 'week') {
      groupByClause = "DATE_TRUNC('week', date)";
    } else if (req.groupBy === 'month') {
      groupByClause = "DATE_TRUNC('month', date)";
    }

    const aggregatedQuery = `
      SELECT 
        ${groupByClause} as period,
        SUM(metric_value) as value
      FROM analytics_data
      ${whereClause}
      GROUP BY ${groupByClause}
      ORDER BY period DESC
      LIMIT 30
    `;

    const countResult = await toolsDB.queryRow<{ total: number }>(countQuery, ...params.slice(0, paramIndex - 2));
    const data = await toolsDB.queryAll<AnalyticsData>(dataQuery, ...params, limit, offset);
    const aggregated = await toolsDB.queryAll<{ period: Date; value: number }>(aggregatedQuery, ...params.slice(0, paramIndex - 2));

    return {
      data,
      total: countResult?.total || 0,
      aggregated: aggregated.map(item => ({
        period: item.period.toISOString().split('T')[0],
        value: item.value
      }))
    };
  }
);
