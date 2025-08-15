import { api } from "encore.dev/api";
import { gamificationDB } from "./db";
import type { LeaderboardEntry } from "./types";

export interface GetLeaderboardRequest {
  leaderboardId?: number;
  metricType?: 'points' | 'achievements' | 'assignments' | 'attendance';
  timePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  schoolId?: number;
  classId?: number;
  gradeLevel?: string;
  limit?: number;
}

export interface GetLeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
}

// Retrieves leaderboard data.
export const getLeaderboard = api<GetLeaderboardRequest, GetLeaderboardResponse>(
  { expose: true, method: "GET", path: "/gamification/leaderboard" },
  async (req) => {
    const limit = req.limit || 50;
    const metricType = req.metricType || 'points';
    const timePeriod = req.timePeriod || 'all_time';

    let timeFilter = "";
    if (timePeriod !== 'all_time') {
      const now = new Date();
      let startDate: Date;
      
      switch (timePeriod) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      timeFilter = `AND awarded_at >= '${startDate.toISOString()}'`;
    }

    let query = "";
    const params: any[] = [];
    let paramIndex = 1;

    if (metricType === 'points') {
      query = `
        SELECT 
          u.id as "userId",
          CONCAT(u.first_name, ' ', u.last_name) as "userName",
          u.avatar_url as "userAvatar",
          COALESCE(SUM(up.points), 0) as score,
          ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(up.points), 0) DESC) as rank
        FROM users u
        LEFT JOIN user_points up ON u.id = up.user_id ${timeFilter}
        WHERE u.is_active = TRUE
      `;
    } else if (metricType === 'achievements') {
      query = `
        SELECT 
          u.id as "userId",
          CONCAT(u.first_name, ' ', u.last_name) as "userName",
          u.avatar_url as "userAvatar",
          COUNT(ua.id) as score,
          ROW_NUMBER() OVER (ORDER BY COUNT(ua.id) DESC) as rank
        FROM users u
        LEFT JOIN user_achievements ua ON u.id = ua.user_id
        WHERE u.is_active = TRUE
      `;
    }

    if (req.schoolId) {
      query += ` AND EXISTS (
        SELECT 1 FROM user_schools us 
        WHERE us.user_id = u.id AND us.school_id = $${paramIndex} AND us.is_active = TRUE
      )`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.classId) {
      query += ` AND EXISTS (
        SELECT 1 FROM enrollments e 
        WHERE e.student_id = u.id AND e.class_id = $${paramIndex} AND e.is_active = TRUE
      )`;
      params.push(req.classId);
      paramIndex++;
    }

    query += `
      GROUP BY u.id, u.first_name, u.last_name, u.avatar_url
      HAVING COALESCE(SUM(up.points), 0) > 0 OR COUNT(ua.id) > 0
      ORDER BY score DESC
      LIMIT $${paramIndex}
    `;

    const entries = await gamificationDB.queryAll<LeaderboardEntry>(query, ...params, limit);

    return {
      entries,
      total: entries.length
    };
  }
);
