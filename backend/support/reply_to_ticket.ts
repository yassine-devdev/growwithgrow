import { api, APIError } from "encore.dev/api";
import { supportDB } from "./db";
import type { TicketReply } from "./types";

export interface ReplyToTicketRequest {
  ticketId: number;
  userId: number;
  content: string;
  attachments?: string[];
  isInternalNote?: boolean;
}

// Adds a reply to a support ticket.
export const replyToTicket = api<ReplyToTicketRequest, TicketReply>(
  { expose: true, method: "POST", path: "/support/tickets/:ticketId/replies" },
  async (req) => {
    const ticket = await supportDB.queryRow`
      SELECT id, status FROM tickets WHERE id = ${req.ticketId}
    `;

    if (!ticket) {
      throw APIError.notFound("Ticket not found");
    }

    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      throw APIError.failedPrecondition("Cannot reply to a closed or resolved ticket");
    }

    const reply = await supportDB.queryRow<TicketReply>`
      INSERT INTO ticket_replies (
        ticket_id, user_id, content, attachments, is_internal_note
      )
      VALUES (
        ${req.ticketId}, ${req.userId}, ${req.content},
        ${req.attachments}, ${req.isInternalNote || false}
      )
      RETURNING 
        id,
        ticket_id as "ticketId",
        user_id as "userId",
        content,
        attachments,
        is_internal_note as "isInternalNote",
        created_at as "createdAt"
    `;

    // Update ticket's updated_at timestamp
    await supportDB.exec`
      UPDATE tickets SET updated_at = NOW() WHERE id = ${req.ticketId}
    `;

    return reply!;
  }
);
