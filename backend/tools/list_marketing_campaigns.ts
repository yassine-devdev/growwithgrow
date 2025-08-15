import { api } from "encore.dev/api";
import { toolsDB } from "./db";
import type { MarketingCampaign } from "./types";

export interface ListMarketingCampaignsRequest {
  campaignType?: string;
  status?: string;
  schoolId?: number;
  limit?: number;
  offset?: number;
}

export interface ListMarketingCampaignsResponse {
  campaigns: MarketingCampaign[];
  total: number;
}

// Retrieves a list of marketing campaigns.
export const listMarketingCampaigns = api<ListMarketingCampaignsRequest, ListMarketingCampaignsResponse>(
  { expose: true, method: "GET", path: "/tools/marketing/campaigns" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
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

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM marketing_campaigns
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        name,
        description,
        campaign_type as "campaignType",
        status,
        target_audience as "targetAudience",
        content,
        settings,
        metrics,
        budget,
        start_date as "startDate",
        end_date as "endDate",
        created_by as "createdBy",
        school_id as "schoolId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM marketing_campaigns
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await toolsDB.queryRow<{ total: number }>(countQuery, ...params);
    const campaigns = await toolsDB.queryAll<MarketingCampaign>(dataQuery, ...params, limit, offset);

    return {
      campaigns,
      total: countResult?.total || 0
    };
  }
);
