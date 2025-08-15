import { api } from "encore.dev/api";
import { crmDB } from "./db";
import type { Account } from "./types";

export interface CreateAccountRequest {
  name: string;
  accountType: 'school' | 'district' | 'organization' | 'individual';
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  annualRevenue?: number;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  primaryContactId?: number;
  accountManagerId?: number;
  status?: 'active' | 'inactive' | 'prospect' | 'customer';
  tags?: string[];
  notes?: string;
}

// Creates a new account.
export const createAccount = api<CreateAccountRequest, Account>(
  { expose: true, method: "POST", path: "/crm/accounts" },
  async (req) => {
    const account = await crmDB.queryRow<Account>`
      INSERT INTO accounts (
        name, account_type, industry, size, annual_revenue, website, phone, email,
        address, city, state, country, postal_code, primary_contact_id,
        account_manager_id, status, tags, notes
      )
      VALUES (
        ${req.name}, ${req.accountType}, ${req.industry}, ${req.size}, ${req.annualRevenue},
        ${req.website}, ${req.phone}, ${req.email}, ${req.address}, ${req.city},
        ${req.state}, ${req.country}, ${req.postalCode}, ${req.primaryContactId},
        ${req.accountManagerId}, ${req.status || 'active'}, ${req.tags}, ${req.notes}
      )
      RETURNING 
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
    `;

    return account!;
  }
);
