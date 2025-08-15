import { api } from "encore.dev/api";
import { crmDB } from "./db";
import type { Contact } from "./types";

export interface ListContactsRequest {
  contactType?: string;
  company?: string;
  limit?: number;
  offset?: number;
}

export interface ListContactsResponse {
  contacts: Contact[];
  total: number;
}

// Retrieves a list of contacts with optional filtering.
export const listContacts = api<ListContactsRequest, ListContactsResponse>(
  { expose: true, method: "GET", path: "/crm/contacts" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.contactType) {
      whereClause += ` AND contact_type = $${paramIndex}`;
      params.push(req.contactType);
      paramIndex++;
    }

    if (req.company) {
      whereClause += ` AND LOWER(company) LIKE LOWER($${paramIndex})`;
      params.push(`%${req.company}%`);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM contacts
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        first_name as "firstName",
        last_name as "lastName",
        email,
        phone,
        company,
        job_title as "jobTitle",
        address,
        city,
        state,
        country,
        postal_code as "postalCode",
        contact_type as "contactType",
        source,
        tags,
        notes,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM contacts
      ${whereClause}
      ORDER BY last_name, first_name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await crmDB.queryRow<{ total: number }>(countQuery, ...params);
    const contacts = await crmDB.queryAll<Contact>(dataQuery, ...params, limit, offset);

    return {
      contacts,
      total: countResult?.total || 0
    };
  }
);
