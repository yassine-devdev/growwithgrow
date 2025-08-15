import { api, APIError } from "encore.dev/api";
import { aiDB } from "./db";
import type { Conversation, Message } from "./types";

export interface GetConversationRequest {
  id: number;
  userId: number;
}

export interface GetConversationResponse {
  conversation: Conversation;
  messages: Message[];
}

// Retrieves a specific conversation with its messages.
export const getConversation = api<GetConversationRequest, GetConversationResponse>(
  { expose: true, method: "GET", path: "/ai/conversations/:id" },
  async (req) => {
    const conversation = await aiDB.queryRow<Conversation>`
      SELECT 
        id,
        user_id as "userId",
        title,
        context_type as "contextType",
        school_id as "schoolId",
        class_id as "classId",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM conversations
      WHERE id = ${req.id} AND user_id = ${req.userId} AND is_active = TRUE
    `;

    if (!conversation) {
      throw APIError.notFound("Conversation not found");
    }

    const messages = await aiDB.queryAll<Message>`
      SELECT 
        id,
        conversation_id as "conversationId",
        role,
        content,
        metadata,
        created_at as "createdAt"
      FROM messages
      WHERE conversation_id = ${req.id}
      ORDER BY created_at ASC
    `;

    return {
      conversation,
      messages
    };
  }
);
