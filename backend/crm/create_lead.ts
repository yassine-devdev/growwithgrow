import { api } from "encore.dev/api";
import { crmDB } from "./db";
import type { Lead } from "./types";

export interface CreateLeadRequest {
  contactId: number;
  status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  score?: number;
  source?: string;
  campaign?: string;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: Date;
  assignedTo?: number;
  notes?: string;
}

// Creates a new lead.
export const createLead = api<CreateLeadRequest, Lead>(
  { expose: true, method: "POST", path: "/crm/leads" },
  async (req) => {
    const lead = await crmDB.queryRow<Lead>`
      INSERT INTO leads (
        contact_id, status, score, source, campaign, estimated_value,
        probability, expected_close_date, assigned_to, notes
      )
      VALUES (
        ${req.contactId}, ${req.status || 'new'}, ${req.score || 0},
        ${req.source}, ${req.campaign}, ${req.estimatedValue},
        ${req.probability || 0}, ${req.expectedCloseDate}, ${req.assignedTo},
        ${req.notes}
      )
      RETURNING 
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
    `;

    return lead!;
  }
);
