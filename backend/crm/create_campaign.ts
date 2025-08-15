import { api } from "encore.dev/api";
import { crmDB } from "./db";
import type { Campaign } from "./types";

export interface CreateCampaignRequest {
  name: string;
  campaignType: 'email' | 'sms' | 'social' | 'webinar' | 'event' | 'direct_mail';
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  targetAudience?: string;
  description?: string;
  goals?: string;
  ownerId: number;
  metrics?: any;
}

// Creates a new campaign.
export const createCampaign = api<CreateCampaignRequest, Campaign>(
  { expose: true, method: "POST", path: "/crm/campaigns" },
  async (req) => {
    const campaign = await crmDB.queryRow<Campaign>`
      INSERT INTO campaigns (
        name, campaign_type, status, start_date, end_date, budget,
        target_audience, description, goals, owner_id, metrics
      )
      VALUES (
        ${req.name}, ${req.campaignType}, ${req.status || 'draft'}, ${req.startDate},
        ${req.endDate}, ${req.budget}, ${req.targetAudience}, ${req.description},
        ${req.goals}, ${req.ownerId}, ${req.metrics}
      )
      RETURNING 
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
    `;

    return campaign!;
  }
);
