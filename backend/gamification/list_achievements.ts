import { api } from "encore.dev/api";
import { gamificationDB } from "./db";
import type { Achievement } from "./types";

export interface ListAchievementsRequest {
  category?: string;
  schoolId?: number;
  userId?: number; // If provided, include user's progress
  limit?: number;
  offset?: number;
}

export interface ListAchievementsResponse {
  achievements: (Achievement & { userProgress?: any; earned?: boolean })[];
  total: number;
}

// Retrieves a list of achievements.
export const listAchievements = api<ListAchievementsRequest, ListAchievementsResponse>(
  { expose: true, method: "GET", path: "/gamification/achievements" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE a.is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.category) {
      whereClause += ` AND a.category = $${paramIndex}`;
      params.push(req.category);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND (a.school_id = $${paramIndex} OR a.school_id IS NULL)`;
      params.push(req.schoolId);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM achievements a
      ${whereClause}
    `;

    let dataQuery = `
      SELECT 
        a.id,
        a.name,
        a.description,
        a.icon_url as "iconUrl",
        a.category,
        a.points,
        a.badge_color as "badgeColor",
        a.criteria,
        a.is_active as "isActive",
        a.school_id as "schoolId",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt"
    `;

    if (req.userId) {
      dataQuery += `,
        ua.progress as "userProgress",
        ua.earned_at IS NOT NULL as "earned"
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $${paramIndex}`;
      params.push(req.userId);
      paramIndex++;
    } else {
      dataQuery += `
      FROM achievements a`;
    }

    dataQuery += `
      ${whereClause}
      ORDER BY a.category, a.points DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await gamificationDB.queryRow<{ total: number }>(countQuery, ...params.slice(0, paramIndex - (req.userId ? 3 : 2)));
    const achievements = await gamificationDB.queryAll<Achievement & { userProgress?: any; earned?: boolean }>(dataQuery, ...params, limit, offset);

    return {
      achievements,
      total: countResult?.total || 0
    };
  }
);
