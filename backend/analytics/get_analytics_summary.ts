import { api } from "encore.dev/api";
import { analyticsDB } from "./db";

export interface GetAnalyticsSummaryRequest {
  schoolId?: number;
  startDate?: Date;
  endDate?: Date;
  period?: 'day' | 'week' | 'month';
}

export interface GetAnalyticsSummaryResponse {
  totalPageViews: number;
  totalEvents: number;
  totalSessions: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    url: string;
    views: number;
  }>;
  topEvents: Array<{
    name: string;
    count: number;
  }>;
  deviceBreakdown: Array<{
    deviceType: string;
    count: number;
    percentage: number;
  }>;
}

// Retrieves analytics summary data.
export const getAnalyticsSummary = api<GetAnalyticsSummaryRequest, GetAnalyticsSummaryResponse>(
  { expose: true, method: "GET", path: "/analytics/summary" },
  async (req) => {
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.startDate) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      params.push(req.startDate);
      paramIndex++;
    }

    if (req.endDate) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      params.push(req.endDate);
      paramIndex++;
    }

    // Get basic metrics
    const metricsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM page_views ${whereClause}) as total_page_views,
        (SELECT COUNT(*) FROM events ${whereClause}) as total_events,
        (SELECT COUNT(*) FROM user_sessions ${whereClause}) as total_sessions,
        (SELECT COUNT(DISTINCT user_id) FROM user_sessions ${whereClause} AND user_id IS NOT NULL) as unique_users,
        (SELECT AVG(duration_seconds) FROM user_sessions ${whereClause} AND duration_seconds IS NOT NULL) as avg_session_duration,
        (SELECT AVG(CASE WHEN bounce THEN 1 ELSE 0 END) * 100 FROM user_sessions ${whereClause}) as bounce_rate
    `;

    const metrics = await analyticsDB.queryRow<{
      total_page_views: number;
      total_events: number;
      total_sessions: number;
      unique_users: number;
      avg_session_duration: number;
      bounce_rate: number;
    }>(metricsQuery, ...params.slice(0, paramIndex - 1));

    // Get top pages
    const topPagesQuery = `
      SELECT page_url as url, COUNT(*) as views
      FROM page_views
      ${whereClause}
      GROUP BY page_url
      ORDER BY views DESC
      LIMIT 10
    `;

    const topPages = await analyticsDB.queryAll<{ url: string; views: number }>(
      topPagesQuery, ...params.slice(0, paramIndex - 1)
    );

    // Get top events
    const topEventsQuery = `
      SELECT event_name as name, COUNT(*) as count
      FROM events
      ${whereClause}
      GROUP BY event_name
      ORDER BY count DESC
      LIMIT 10
    `;

    const topEvents = await analyticsDB.queryAll<{ name: string; count: number }>(
      topEventsQuery, ...params.slice(0, paramIndex - 1)
    );

    // Get device breakdown
    const deviceQuery = `
      SELECT 
        device_type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM user_sessions
      ${whereClause} AND device_type IS NOT NULL
      GROUP BY device_type
      ORDER BY count DESC
    `;

    const deviceBreakdown = await analyticsDB.queryAll<{
      device_type: string;
      count: number;
      percentage: number;
    }>(deviceQuery, ...params.slice(0, paramIndex - 1));

    return {
      totalPageViews: metrics?.total_page_views || 0,
      totalEvents: metrics?.total_events || 0,
      totalSessions: metrics?.total_sessions || 0,
      uniqueUsers: metrics?.unique_users || 0,
      averageSessionDuration: metrics?.avg_session_duration || 0,
      bounceRate: metrics?.bounce_rate || 0,
      topPages,
      topEvents,
      deviceBreakdown: deviceBreakdown.map(d => ({
        deviceType: d.device_type,
        count: d.count,
        percentage: d.percentage
      }))
    };
  }
);
