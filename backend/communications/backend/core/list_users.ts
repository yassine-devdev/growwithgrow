import { api } from "encore.dev/api";
import { coreDB } from "./db";
import type { User } from "./types";

export interface ListUsersRequest {
  limit?: number;
  offset?: number;
  role?: string;
  schoolId?: number;
}

export interface ListUsersResponse {
  users: User[];
  total: number;
}

// Retrieves a list of users with optional filtering.
export const listUsers = api<ListUsersRequest, ListUsersResponse>(
  { expose: true, method: "GET", path: "/users" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE u.is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.role) {
      whereClause += ` AND u.role = $${paramIndex}`;
      params.push(req.role);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM user_schools us 
        WHERE us.user_id = u.id AND us.school_id = $${paramIndex} AND us.is_active = TRUE
      )`;
      params.push(req.schoolId);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        u.id,
        u.email,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.role,
        u.avatar_url as "avatarUrl",
        u.phone,
        u.date_of_birth as "dateOfBirth",
        u.address,
        u.city,
        u.state,
        u.country,
        u.postal_code as "postalCode",
        u.is_active as "isActive",
        u.created_at as "createdAt",
        u.updated_at as "updatedAt"
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await coreDB.queryRow<{ total: number }>(countQuery, ...params);
    const users = await coreDB.queryAll<User>(dataQuery, ...params, limit, offset);

    return {
      users,
      total: countResult?.total || 0
    };
  }
);
