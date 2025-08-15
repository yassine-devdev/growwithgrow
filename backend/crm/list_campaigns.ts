import { api } from "encore.dev/api";
import { crmDB } from "./db";
import type { Campaign } from "./types";

export interface ListCampaignsRequest {
  campaignType?: string;
  status?: string;
  ownerId?: number;
  limit?: number;
  offset?: number;
}

export interface ListCampaignsResponse {
  campaigns: Campaign[];
  total: number;
}

// Retrieves a list of campaigns with optional filtering.
export const listCampaigns = api<ListCampaignsRequest, ListCampaignsResponse>(
  { expose: true, method: "GET", path: "/crm/campaigns" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.campaignType) {
      whereClause += ` AND campaign_type = $${paramIndex}`;
      params.push(req.campaignType);
      paramIndex++;
    }

    if (req.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    if (req.ownerId) {
      whereClause += ` AND owner_id = $${paramIndex}`;
      params.push(req.ownerId);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM campaigns
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        name,
        campaign_type as "campaignType",
        status,
        start_date as "startDate",
        end_date as "endDate",
        budget,
        target_audience as "targetAudience",
        description,
        goals,
        owner_id as "ownerId",
        metrics,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM campaigns
      ${whereClause}
      ORDER BY start_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await crmDB.queryRow<{ total: number }>(countQuery, ...params);
    const campaigns = await crmDB.queryAll<Campaign>(dataQuery, ...params, limit, offset);

    return {
      campaigns,
      total: countResult?.total || 0
    };
  }
);
