import { api } from "encore.dev/api";
import { aiDB } from "./db";
import { OpenRouterClient } from "./openrouter_client";
import { OllamaClient } from "./ollama_client";
import type { ChatRequest, ChatResponse, Message } from "./types";

export interface ChatAPIRequest {
  conversationId?: number;
  message: string;
  model?: string;
  provider?: 'openrouter' | 'ollama';
  temperature?: number;
  maxTokens?: number;
  userId: number;
  schoolId?: number;
  contextType?: 'general' | 'academic' | 'administrative' | 'support';
}

export interface ChatAPIResponse {
  response: string;
  conversationId: number;
  model: string;
  provider: string;
  tokensUsed: number;
  cost: number;
}

// Sends a chat message and gets AI response.
export const chat = api<ChatAPIRequest, ChatAPIResponse>(
  { expose: true, method: "POST", path: "/ai/chat" },
  async (req) => {
    let conversationId = req.conversationId;
    
    // Create new conversation if not provided
    if (!conversationId) {
      const conversation = await aiDB.queryRow<{ id: number }>`
        INSERT INTO conversations (user_id, context_type, school_id, title)
        VALUES (${req.userId}, ${req.contextType || 'general'}, ${req.schoolId}, 'New Conversation')
        RETURNING id
      `;
      conversationId = conversation!.id;
    }

    // Get conversation history
    const messages = await aiDB.queryAll<Message>`
      SELECT role, content
      FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
      LIMIT 20
    `;

    // Add user message to history
    await aiDB.exec`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (${conversationId}, 'user', ${req.message})
    `;

    // Prepare chat request
    const chatMessages = [
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
      { role: 'user' as const, content: req.message }
    ];

    const chatRequest: ChatRequest = {
      messages: chatMessages,
      model: req.model,
      provider: req.provider || 'openrouter',
      temperature: req.temperature,
      maxTokens: req.maxTokens
    };

    // Get AI response
    let response: ChatResponse;
    if (chatRequest.provider === 'ollama') {
      const ollamaClient = new OllamaClient();
      response = await ollamaClient.chat(chatRequest);
    } else {
      const openRouterClient = new OpenRouterClient();
      response = await openRouterClient.chat(chatRequest);
    }

    // Save assistant response
    await aiDB.exec`
      INSERT INTO messages (conversation_id, role, content, metadata)
      VALUES (${conversationId}, 'assistant', ${response.content}, ${JSON.stringify({
        model: response.model,
        provider: response.provider,
        tokensUsed: response.tokensUsed,
        cost: response.cost
      })})
    `;

    // Log usage
    await aiDB.exec`
      INSERT INTO ai_usage (user_id, model_name, provider, tokens_used, cost, request_type, school_id)
      VALUES (${req.userId}, ${response.model}, ${response.provider}, ${response.tokensUsed}, ${response.cost}, 'chat', ${req.schoolId})
    `;

    // Update conversation title if it's the first exchange
    if (messages.length === 0) {
      const title = req.message.length > 50 ? req.message.substring(0, 47) + "..." : req.message;
      await aiDB.exec`
        UPDATE conversations 
        SET title = ${title}, updated_at = NOW()
        WHERE id = ${conversationId}
      `;
    }

    return {
      response: response.content,
      conversationId,
      model: response.model,
      provider: response.provider,
      tokensUsed: response.tokensUsed,
      cost: response.cost
    };
  }
);
