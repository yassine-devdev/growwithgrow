import { api } from "encore.dev/api";
import { aiDB } from "./db";
import type { Conversation } from "./types";

export interface ListConversationsRequest {
  userId: number;
  contextType?: string;
  schoolId?: number;
  limit?: number;
  offset?: number;
}

export interface ListConversationsResponse {
  conversations: Conversation[];
  total: number;
}

// Retrieves a list of conversations for a user.
export const listConversations = api<ListConversationsRequest, ListConversationsResponse>(
  { expose: true, method: "GET", path: "/ai/conversations" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE user_id = $1 AND is_active = TRUE";
    const params: any[] = [req.userId];
    let paramIndex = 2;

    if (req.contextType) {
      whereClause += ` AND context_type = $${paramIndex}`;
      params.push(req.contextType);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM conversations
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        user_id as "userId",
        title,
        context_type as "contextType",
        school_id as "schoolId",
        class_id as "classId",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM conversations
      ${whereClause}
      ORDER BY updated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await aiDB.queryRow<{ total: number }>(countQuery, ...params);
    const conversations = await aiDB.queryAll<Conversation>(dataQuery, ...params, limit, offset);

    return {
      conversations,
      total: countResult?.total || 0
    };
  }
);
