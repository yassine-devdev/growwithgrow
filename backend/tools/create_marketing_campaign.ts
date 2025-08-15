import { api } from "encore.dev/api";
import { toolsDB } from "./db";
import type { MarketingCampaign } from "./types";

export interface CreateMarketingCampaignRequest {
  name: string;
  description?: string;
  campaignType: 'email' | 'sms' | 'social' | 'seo' | 'ads' | 'content';
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetAudience?: any;
  content?: any;
  settings?: any;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  createdBy: number;
  schoolId?: number;
}

// Creates a new marketing campaign.
export const createMarketingCampaign = api<CreateMarketingCampaignRequest, MarketingCampaign>(
  { expose: true, method: "POST", path: "/tools/marketing/campaigns" },
  async (req) => {
    const campaign = await toolsDB.queryRow<MarketingCampaign>`
      INSERT INTO marketing_campaigns (
        name, description, campaign_type, status, target_audience, content,
        settings, budget, start_date, end_date, created_by, school_id
      )
      VALUES (
        ${req.name}, ${req.description}, ${req.campaignType}, ${req.status || 'draft'},
        ${req.targetAudience}, ${req.content}, ${req.settings}, ${req.budget},
        ${req.startDate}, ${req.endDate}, ${req.createdBy}, ${req.schoolId}
      )
      RETURNING 
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
    `;

    return campaign!;
  }
);
