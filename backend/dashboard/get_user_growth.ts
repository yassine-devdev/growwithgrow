import { api } from "encore.dev/api";
import { dashboardDB } from "./db";
import type { UserGrowth } from "./types";

export interface GetUserGrowthRequest {
  schoolId?: number;
  startDate?: Date;
  endDate?: Date;
  userType?: string;
}

export interface GetUserGrowthResponse {
  userGrowth: UserGrowth[];
}

// Retrieves user growth data for the dashboard.
export const getUserGrowth = api<GetUserGrowthRequest, GetUserGrowthResponse>(
  { expose: true, method: "GET", path: "/dashboard/user-growth" },
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
      whereClause += ` AND date >= $${paramIndex}`;
      params.push(req.startDate);
      paramIndex++;
    }

    if (req.endDate) {
      whereClause += ` AND date <= $${paramIndex}`;
      params.push(req.endDate);
      paramIndex++;
    }

    if (req.userType) {
      whereClause += ` AND user_type = $${paramIndex}`;
      params.push(req.userType);
      paramIndex++;
    }

    const query = `
      SELECT 
        id,
        date,
        new_users as "newUsers",
        active_users as "activeUsers",
        total_users as "totalUsers",
        user_type as "userType",
        school_id as "schoolId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM user_growth
      ${whereClause}
      ORDER BY date ASC
    `;

    const userGrowth = await dashboardDB.queryAll<UserGrowth>(query, ...params);

    return { userGrowth };
  }
);
