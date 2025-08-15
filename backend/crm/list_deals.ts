import { api } from "encore.dev/api";
import { crmDB } from "./db";
import type { Deal } from "./types";

export interface ListDealsRequest {
  stage?: string;
  ownerId?: number;
  accountId?: number;
  limit?: number;
  offset?: number;
}

export interface ListDealsResponse {
  deals: Deal[];
  total: number;
}

// Retrieves a list of deals with optional filtering.
export const listDeals = api<ListDealsRequest, ListDealsResponse>(
  { expose: true, method: "GET", path: "/crm/deals" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.stage) {
      whereClause += ` AND stage = $${paramIndex}`;
      params.push(req.stage);
      paramIndex++;
    }

    if (req.ownerId) {
      whereClause += ` AND owner_id = $${paramIndex}`;
      params.push(req.ownerId);
      paramIndex++;
    }

    if (req.accountId) {
      whereClause += ` AND account_id = $${paramIndex}`;
      params.push(req.accountId);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM deals
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        name,
        account_id as "accountId",
        contact_id as "contactId",
        stage,
        amount,
        probability,
        expected_close_date as "expectedCloseDate",
        actual_close_date as "actualCloseDate",
        owner_id as "ownerId",
        source,
        description,
        next_step as "nextStep",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM deals
      ${whereClause}
      ORDER BY expected_close_date ASC, amount DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await crmDB.queryRow<{ total: number }>(countQuery, ...params);
    const deals = await crmDB.queryAll<Deal>(dataQuery, ...params, limit, offset);

    return {
      deals,
      total: countResult?.total || 0
    };
  }
);
