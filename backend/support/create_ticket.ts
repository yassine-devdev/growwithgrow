import { api } from "encore.dev/api";
import { supportDB } from "./db";
import type { Ticket } from "./types";

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  createdBy: number;
  schoolId?: number;
}

// Creates a new support ticket.
export const createTicket = api<CreateTicketRequest, Ticket>(
  { expose: true, method: "POST", path: "/support/tickets" },
  async (req) => {
    const ticket = await supportDB.queryRow<Ticket>`
      INSERT INTO tickets (
        subject, description, priority, category, created_by, school_id
      )
      VALUES (
        ${req.subject}, ${req.description}, ${req.priority || 'normal'},
        ${req.category}, ${req.createdBy}, ${req.schoolId}
      )
      RETURNING 
        id,
        subject,
        description,
        status,
        priority,
        category,
        created_by as "createdBy",
        assigned_to as "assignedTo",
        school_id as "schoolId",
        created_at as "createdAt",
        updated_at as "updatedAt",
        resolved_at as "resolvedAt"
    `;

    return ticket!;
  }
);
