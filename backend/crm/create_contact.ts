import { api } from "encore.dev/api";
import { crmDB } from "./db";
import type { Contact } from "./types";

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  contactType: 'lead' | 'customer' | 'partner' | 'vendor';
  source?: string;
  tags?: string[];
  notes?: string;
}

// Creates a new contact.
export const createContact = api<CreateContactRequest, Contact>(
  { expose: true, method: "POST", path: "/crm/contacts" },
  async (req) => {
    const contact = await crmDB.queryRow<Contact>`
      INSERT INTO contacts (
        first_name, last_name, email, phone, company, job_title,
        address, city, state, country, postal_code, contact_type,
        source, tags, notes
      )
      VALUES (
        ${req.firstName}, ${req.lastName}, ${req.email}, ${req.phone},
        ${req.company}, ${req.jobTitle}, ${req.address}, ${req.city},
        ${req.state}, ${req.country}, ${req.postalCode}, ${req.contactType},
        ${req.source}, ${req.tags}, ${req.notes}
      )
      RETURNING 
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
    `;

    return contact!;
  }
);
