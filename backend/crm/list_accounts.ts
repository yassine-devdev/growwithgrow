import { api } from "encore.dev/api";
import { crmDB } from "./db";
import type { Account } from "./types";

export interface ListAccountsRequest {
  accountType?: string;
  status?: string;
  accountManagerId?: number;
  limit?: number;
  offset?: number;
}

export interface ListAccountsResponse {
  accounts: Account[];
  total: number;
}

// Retrieves a list of accounts with optional filtering.
export const listAccounts = api<ListAccountsRequest, ListAccountsResponse>(
  { expose: true, method: "GET", path: "/crm/accounts" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.accountType) {
      whereClause += ` AND account_type = $${paramIndex}`;
      params.push(req.accountType);
      paramIndex++;
    }

    if (req.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    if (req.accountManagerId) {
      whereClause += ` AND account_manager_id = $${paramIndex}`;
      params.push(req.accountManagerId);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM accounts
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        name,
        account_type as "accountType",
        industry,
        size,
        annual_revenue as "annualRevenue",
        website,
        phone,
        email,
        address,
        city,
        state,
        country,
        postal_code as "postalCode",
        primary_contact_id as "primaryContactId",
        account_manager_id as "accountManagerId",
        status,
        tags,
        notes,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM accounts
      ${whereClause}
      ORDER BY name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await crmDB.queryRow<{ total: number }>(countQuery, ...params);
    const accounts = await crmDB.queryAll<Account>(dataQuery, ...params, limit, offset);

    return {
      accounts,
      total: countResult?.total || 0
    };
  }
);
