import { api } from "encore.dev/api";
import { communicationsDB } from "./db";
import type { Email } from "./types";

export interface ListEmailsRequest {
  userId: number;
  folder?: 'inbox' | 'sent' | 'drafts' | 'spam' | 'archive';
  isRead?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListEmailsResponse {
  emails: Email[];
  total: number;
}

// Retrieves a list of emails for a user.
export const listEmails = api<ListEmailsRequest, ListEmailsResponse>(
  { expose: true, method: "GET", path: "/communications/emails" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.folder === 'inbox') {
      whereClause += ` AND $${paramIndex} = ANY(recipient_ids) AND status = 'delivered'`;
      params.push(req.userId);
      paramIndex++;
    } else if (req.folder === 'sent') {
      whereClause += ` AND sender_id = $${paramIndex} AND status = 'sent'`;
      params.push(req.userId);
      paramIndex++;
    } else if (req.folder === 'drafts') {
      whereClause += ` AND sender_id = $${paramIndex} AND status = 'draft'`;
      params.push(req.userId);
      paramIndex++;
    } else if (req.folder === 'spam') {
      whereClause += ` AND $${paramIndex} = ANY(recipient_ids) AND status = 'delivered'`;
      params.push(req.userId);
      paramIndex++;
    } else {
      whereClause += ` AND ($${paramIndex} = ANY(recipient_ids) OR sender_id = $${paramIndex + 1})`;
      params.push(req.userId, req.userId);
      paramIndex += 2;
    }

    if (req.isRead !== undefined) {
      whereClause += ` AND is_read = $${paramIndex}`;
      params.push(req.isRead);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM emails
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        sender_id as "senderId",
        recipient_ids as "recipientIds",
        cc_ids as "ccIds",
        bcc_ids as "bccIds",
        subject,
        body,
        html_body as "htmlBody",
        attachments,
        status,
        sent_at as "sentAt",
        delivered_at as "deliveredAt",
        is_read as "isRead",
        read_at as "readAt",
        thread_id as "threadId",
        reply_to_id as "replyToId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM emails
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await communicationsDB.queryRow<{ total: number }>(countQuery, ...params);
    const emails = await communicationsDB.queryAll<Email>(dataQuery, ...params, limit, offset);

    return {
      emails,
      total: countResult?.total || 0
    };
  }
);
