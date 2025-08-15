import { api } from "encore.dev/api";
import { crmDB } from "./db";
import type { Deal } from "./types";

export interface CreateDealRequest {
  name: string;
  accountId: number;
  contactId?: number;
  stage?: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  amount: number;
  probability?: number;
  expectedCloseDate?: Date;
  ownerId: number;
  source?: string;
  description?: string;
  nextStep?: string;
}

// Creates a new deal.
export const createDeal = api<CreateDealRequest, Deal>(
  { expose: true, method: "POST", path: "/crm/deals" },
  async (req) => {
    const deal = await crmDB.queryRow<Deal>`
      INSERT INTO deals (
        name, account_id, contact_id, stage, amount, probability,
        expected_close_date, owner_id, source, description, next_step
      )
      VALUES (
        ${req.name}, ${req.accountId}, ${req.contactId}, 
        ${req.stage || 'prospecting'}, ${req.amount}, ${req.probability || 0},
        ${req.expectedCloseDate}, ${req.ownerId}, ${req.source},
        ${req.description}, ${req.nextStep}
      )
      RETURNING 
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
    `;

    return deal!;
  }
);
