import { api, APIError } from "encore.dev/api";
import { supportDB } from "./db";
import type { Ticket, TicketReply } from "./types";

export interface GetTicketRequest {
  id: number;
}

export interface GetTicketResponse {
  ticket: Ticket;
  replies: TicketReply[];
}

// Retrieves a specific ticket with its replies.
export const getTicket = api<GetTicketRequest, GetTicketResponse>(
  { expose: true, method: "GET", path: "/support/tickets/:id" },
  async (req) => {
    const ticket = await supportDB.queryRow<Ticket>`
      SELECT 
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
      FROM tickets
      WHERE id = ${req.id}
    `;

    if (!ticket) {
      throw APIError.notFound("Ticket not found");
    }

    const replies = await supportDB.queryAll<TicketReply>`
      SELECT 
        id,
        ticket_id as "ticketId",
        user_id as "userId",
        content,
        attachments,
        is_internal_note as "isInternalNote",
        created_at as "createdAt"
      FROM ticket_replies
      WHERE ticket_id = ${req.id}
      ORDER BY created_at ASC
    `;

    return {
      ticket,
      replies
    };
  }
);
