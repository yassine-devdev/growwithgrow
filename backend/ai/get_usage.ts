import { api } from "encore.dev/api";
import { aiDB } from "./db";
import type { AIUsage } from "./types";

export interface GetUsageRequest {
  userId?: number;
  schoolId?: number;
  provider?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface GetUsageResponse {
  usage: AIUsage[];
  total: number;
  totalTokens: number;
  totalCost: number;
}

// Retrieves AI usage statistics.
export const getUsage = api<GetUsageRequest, GetUsageResponse>(
  { expose: true, method: "GET", path: "/ai/usage" },
  async (req) => {
    const limit = req.limit || 100;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.userId) {
      whereClause += ` AND user_id = $${paramIndex}`;
      params.push(req.userId);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.provider) {
      whereClause += ` AND provider = $${paramIndex}`;
      params.push(req.provider);
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

    const countQuery = `
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(tokens_used), 0) as total_tokens,
        COALESCE(SUM(cost), 0) as total_cost
      FROM ai_usage
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        user_id as "userId",
        model_name as "modelName",
        provider,
        tokens_used as "tokensUsed",
        cost,
        request_type as "requestType",
        school_id as "schoolId",
        created_at as "createdAt"
      FROM ai_usage
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await aiDB.queryRow<{ total: number; total_tokens: number; total_cost: number }>(countQuery, ...params);
    const usage = await aiDB.queryAll<AIUsage>(dataQuery, ...params, limit, offset);

    return {
      usage,
      total: countResult?.total || 0,
      totalTokens: countResult?.total_tokens || 0,
      totalCost: countResult?.total_cost || 0
    };
  }
);
