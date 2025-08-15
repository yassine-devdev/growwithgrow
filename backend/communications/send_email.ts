import { api } from "encore.dev/api";
import { communicationsDB } from "./db";
import type { Email } from "./types";

export interface SendEmailRequest {
  senderId: number;
  recipientIds: number[];
  ccIds?: number[];
  bccIds?: number[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: string[];
  threadId?: number;
  replyToId?: number;
}

// Sends a new email.
export const sendEmail = api<SendEmailRequest, Email>(
  { expose: true, method: "POST", path: "/communications/emails" },
  async (req) => {
    const email = await communicationsDB.queryRow<Email>`
      INSERT INTO emails (
        sender_id, recipient_ids, cc_ids, bcc_ids, subject, body,
        html_body, attachments, thread_id, reply_to_id, status, sent_at
      )
      VALUES (
        ${req.senderId}, ${req.recipientIds}, ${req.ccIds}, ${req.bccIds},
        ${req.subject}, ${req.body}, ${req.htmlBody}, ${req.attachments},
        ${req.threadId}, ${req.replyToId}, 'sent', NOW()
      )
      RETURNING 
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
    `;

    return email!;
  }
);
