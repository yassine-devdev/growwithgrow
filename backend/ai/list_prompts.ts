import { api } from "encore.dev/api";
import { aiDB } from "./db";
import type { Prompt } from "./types";

export interface ListPromptsRequest {
  category?: string;
  isSystem?: boolean;
  createdBy?: number;
  limit?: number;
  offset?: number;
}

export interface ListPromptsResponse {
  prompts: Prompt[];
  total: number;
}

// Retrieves a list of prompts.
export const listPrompts = api<ListPromptsRequest, ListPromptsResponse>(
  { expose: true, method: "GET", path: "/ai/prompts" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(req.category);
      paramIndex++;
    }

    if (req.isSystem !== undefined) {
      whereClause += ` AND is_system = $${paramIndex}`;
      params.push(req.isSystem);
      paramIndex++;
    }

    if (req.createdBy) {
      whereClause += ` AND created_by = $${paramIndex}`;
      params.push(req.createdBy);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM prompts
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        name,
        description,
        prompt_text as "promptText",
        category,
        variables,
        is_system as "isSystem",
        is_active as "isActive",
        created_by as "createdBy",
        usage_count as "usageCount",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM prompts
      ${whereClause}
      ORDER BY usage_count DESC, name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await aiDB.queryRow<{ total: number }>(countQuery, ...params);
    const prompts = await aiDB.queryAll<Prompt>(dataQuery, ...params, limit, offset);

    return {
      prompts,
      total: countResult?.total || 0
    };
  }
);
