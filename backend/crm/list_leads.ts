import { api } from "encore.dev/api";
import { crmDB } from "./db";
import type { Lead } from "./types";

export interface ListLeadsRequest {
  status?: string;
  assignedTo?: number;
  minScore?: number;
  limit?: number;
  offset?: number;
}

export interface ListLeadsResponse {
  leads: Lead[];
  total: number;
}

// Retrieves a list of leads with optional filtering.
export const listLeads = api<ListLeadsRequest, ListLeadsResponse>(
  { expose: true, method: "GET", path: "/crm/leads" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    if (req.assignedTo) {
      whereClause += ` AND assigned_to = $${paramIndex}`;
      params.push(req.assignedTo);
      paramIndex++;
    }

    if (req.minScore) {
      whereClause += ` AND score >= $${paramIndex}`;
      params.push(req.minScore);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM leads
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        contact_id as "contactId",
        status,
        score,
        source,
        campaign,
        estimated_value as "estimatedValue",
        probability,
        expected_close_date as "expectedCloseDate",
        assigned_to as "assignedTo",
        last_activity_date as "lastActivityDate",
        notes,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM leads
      ${whereClause}
      ORDER BY score DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await crmDB.queryRow<{ total: number }>(countQuery, ...params);
    const leads = await crmDB.queryAll<Lead>(dataQuery, ...params, limit, offset);

    return {
      leads,
      total: countResult?.total || 0
    };
  }
);
