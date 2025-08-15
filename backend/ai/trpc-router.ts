import { z } from 'zod';
import { router, protectedProcedure, teacherProcedure, adminProcedure } from '../trpc/router';
import { PaginationSchema } from '../shared/types';
import { aiDB } from './db';
import { OpenRouterClient } from './openrouter_client';
import { OllamaClient } from './ollama_client';

// Zod schemas for AI operations
const MessageSchema = z.object({
  id: z.number(),
  conversationId: z.number(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  metadata: z.any().optional(),
  createdAt: z.string(),
});

const ConversationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string().optional(),
  contextType: z.enum(['general', 'academic', 'administrative', 'support']),
  schoolId: z.number().optional(),
  classId: z.number().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PromptSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  promptText: z.string(),
  category: z.string(),
  variables: z.array(z.string()).optional(),
  isSystem: z.boolean(),
  isActive: z.boolean(),
  createdBy: z.number(),
  usageCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const AIUsageSchema = z.object({
  id: z.number(),
  userId: z.number(),
  modelName: z.string(),
  provider: z.enum(['openrouter', 'ollama', 'gemini']),
  tokensUsed: z.number(),
  cost: z.number(),
  requestType: z.enum(['chat', 'completion', 'embedding']),
  schoolId: z.number().optional(),
  createdAt: z.string(),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1),
  conversationId: z.number().optional(),
  provider: z.enum(['openrouter', 'ollama', 'gemini']).default('openrouter'),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
  systemPrompt: z.string().optional(),
  contextType: z.enum(['general', 'academic', 'administrative', 'support']).default('general'),
});

const CreateConversationInputSchema = z.object({
  title: z.string().optional(),
  contextType: z.enum(['general', 'academic', 'administrative', 'support']).default('general'),
  schoolId: z.number().optional(),
  classId: z.number().optional(),
});

const CreatePromptInputSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  promptText: z.string().min(1),
  category: z.string().min(1).max(100),
  variables: z.array(z.string()).optional(),
  isSystem: z.boolean().default(false),
});

const UpdatePromptInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  promptText: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
  variables: z.array(z.string()).optional(),
  isSystem: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// AI clients
const openRouterClient = new OpenRouterClient();
const ollamaClient = new OllamaClient();

// AI router implementation
export const aiRouter = router({
  // Chat operations
  chat: protectedProcedure
    .input(ChatRequestSchema)
    .output(z.object({
      response: z.string(),
      provider: z.string(),
      model: z.string(),
      tokensUsed: z.number(),
      cost: z.number(),
      conversationId: z.number(),
      messageId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      let conversationId = input.conversationId;
      
      // Create conversation if not provided
      if (!conversationId) {
        const createConvQuery = `
          INSERT INTO conversations (user_id, title, context_type, school_id, class_id, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
          RETURNING id
        `;
        
        const convResult = await aiDB.queryRow<{ id: number }>(createConvQuery,
          ctx.user.id,
          input.message.substring(0, 50) + '...',
          input.contextType,
          input.schoolId,
          input.classId
        );
        
        if (!convResult) {
          throw new Error('Failed to create conversation');
        }
        
        conversationId = convResult.id;
      }

      // Get conversation history for context
      const historyQuery = `
        SELECT role, content 
        FROM messages 
        WHERE conversation_id = $1 
        ORDER BY created_at ASC 
        LIMIT 20
      `;
      
      const history = await aiDB.queryAll<{ role: string; content: string }>(historyQuery, conversationId);
      
      // Build messages array
      const messages = [...history];
      
      // Add system prompt if provided
      if (input.systemPrompt) {
        messages.unshift({ role: 'system', content: input.systemPrompt });
      }
      
      // Add user message
      messages.push({ role: 'user', content: input.message });

      // Save user message
      const userMessageQuery = `
        INSERT INTO messages (conversation_id, role, content, created_at)
        VALUES ($1, 'user', $2, NOW())
        RETURNING id
      `;
      
      await aiDB.queryRow(userMessageQuery, conversationId, input.message);

      let response;
      let provider = input.provider;
      
      try {
        // Try primary provider
        if (provider === 'openrouter') {
          response = await openRouterClient.chat({
            messages: messages as any,
            model: input.model,
            temperature: input.temperature,
            maxTokens: input.maxTokens,
          });
        } else if (provider === 'ollama') {
          response = await ollamaClient.chat({
            messages: messages as any,
            model: input.model,
            temperature: input.temperature,
            maxTokens: input.maxTokens,
          });
        } else if (provider === 'gemini') {
          // Gemini implementation would go here
          // For now, fallback to OpenRouter
          response = await openRouterClient.chat({
            messages: messages as any,
            model: input.model || 'openai/gpt-3.5-turbo',
            temperature: input.temperature,
            maxTokens: input.maxTokens,
          });
          provider = 'openrouter';
        } else {
          throw new Error('Unsupported provider');
        }
      } catch (error) {
        console.error(`Primary provider ${provider} failed:`, error);
        
        // Fallback to OpenRouter if primary fails
        if (provider !== 'openrouter') {
          try {
            response = await openRouterClient.chat({
              messages: messages as any,
              model: 'openai/gpt-3.5-turbo',
              temperature: input.temperature,
              maxTokens: input.maxTokens,
            });
            provider = 'openrouter';
          } catch (fallbackError) {
            throw new Error(`All providers failed. Last error: ${fallbackError}`);
          }
        } else {
          throw error;
        }
      }

      // Save assistant message
      const assistantMessageQuery = `
        INSERT INTO messages (conversation_id, role, content, metadata, created_at)
        VALUES ($1, 'assistant', $2, $3, NOW())
        RETURNING id
      `;
      
      const messageResult = await aiDB.queryRow<{ id: number }>(assistantMessageQuery,
        conversationId,
        response.content,
        JSON.stringify({
          model: response.model,
          provider: response.provider,
          tokensUsed: response.tokensUsed,
          cost: response.cost,
        })
      );

      // Record usage
      const usageQuery = `
        INSERT INTO ai_usage (user_id, model_name, provider, tokens_used, cost, request_type, school_id, created_at)
        VALUES ($1, $2, $3, $4, $5, 'chat', $6, NOW())
      `;
      
      await aiDB.exec(usageQuery,
        ctx.user.id,
        response.model,
        response.provider,
        response.tokensUsed,
        response.cost,
        input.schoolId
      );

      return {
        response: response.content,
        provider: response.provider,
        model: response.model,
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        conversationId,
        messageId: messageResult?.id || 0,
      };
    }),

  // Conversation management
  conversations: router({
    // List conversations
    list: protectedProcedure
      .input(z.object({
        contextType: z.enum(['general', 'academic', 'administrative', 'support']).optional(),
        schoolId: z.number().optional(),
        classId: z.number().optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        conversations: z.array(ConversationSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE c.user_id = $1 AND c.is_active = TRUE";
        const params: any[] = [ctx.user.id];
        let paramIndex = 2;

        if (input.contextType) {
          whereClause += ` AND c.context_type = $${paramIndex}`;
          params.push(input.contextType);
          paramIndex++;
        }

        if (input.schoolId) {
          whereClause += ` AND c.school_id = $${paramIndex}`;
          params.push(input.schoolId);
          paramIndex++;
        }

        if (input.classId) {
          whereClause += ` AND c.class_id = $${paramIndex}`;
          params.push(input.classId);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM conversations c ${whereClause}`;
        const countResult = await aiDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            c.id,
            c.user_id as "userId",
            c.title,
            c.context_type as "contextType",
            c.school_id as "schoolId",
            c.class_id as "classId",
            c.is_active as "isActive",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt"
          FROM conversations c
          ${whereClause}
          ORDER BY c.updated_at DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const conversations = await aiDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          conversations: conversations.map(conv => ({
            ...conv,
            createdAt: conv.createdAt.toISOString(),
            updatedAt: conv.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Get conversation with messages
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .output(z.object({
        conversation: ConversationSchema,
        messages: z.array(MessageSchema),
      }))
      .query(async ({ input, ctx }) => {
        // Get conversation
        const convQuery = `
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
          WHERE id = $1 AND user_id = $2 AND is_active = TRUE
        `;

        const conversation = await aiDB.queryRow<any>(convQuery, input.id, ctx.user.id);

        if (!conversation) {
          throw new Error('Conversation not found');
        }

        // Get messages
        const messagesQuery = `
          SELECT 
            id,
            conversation_id as "conversationId",
            role,
            content,
            metadata,
            created_at as "createdAt"
          FROM messages
          WHERE conversation_id = $1
          ORDER BY created_at ASC
        `;

        const messages = await aiDB.queryAll<any>(messagesQuery, input.id);

        return {
          conversation: {
            ...conversation,
            createdAt: conversation.createdAt.toISOString(),
            updatedAt: conversation.updatedAt.toISOString(),
          },
          messages: messages.map(msg => ({
            ...msg,
            createdAt: msg.createdAt.toISOString(),
          })),
        };
      }),

    // Create conversation
    create: protectedProcedure
      .input(CreateConversationInputSchema)
      .output(ConversationSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO conversations (user_id, title, context_type, school_id, class_id, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
          RETURNING 
            id,
            user_id as "userId",
            title,
            context_type as "contextType",
            school_id as "schoolId",
            class_id as "classId",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const conversation = await aiDB.queryRow<any>(query,
          ctx.user.id,
          input.title,
          input.contextType,
          input.schoolId,
          input.classId
        );

        if (!conversation) {
          throw new Error('Failed to create conversation');
        }

        return {
          ...conversation,
          createdAt: conversation.createdAt.toISOString(),
          updatedAt: conversation.updatedAt.toISOString(),
        };
      }),

    // Delete conversation
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .output(z.object({ success: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const query = `
          UPDATE conversations 
          SET is_active = false, updated_at = NOW()
          WHERE id = $1 AND user_id = $2
        `;

        await aiDB.exec(query, input.id, ctx.user.id);

        return { success: true };
      }),
  }),

  // Prompt management
  prompts: router({
    // List prompts
    list: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        isSystem: z.boolean().optional(),
        search: z.string().optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        prompts: z.array(PromptSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE p.is_active = TRUE AND (p.is_system = TRUE OR p.created_by = $1)";
        const params: any[] = [ctx.user.id];
        let paramIndex = 2;

        if (input.category) {
          whereClause += ` AND p.category = $${paramIndex}`;
          params.push(input.category);
          paramIndex++;
        }

        if (input.isSystem !== undefined) {
          whereClause += ` AND p.is_system = $${paramIndex}`;
          params.push(input.isSystem);
          paramIndex++;
        }

        if (input.search) {
          whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
          params.push(`%${input.search}%`);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM prompts p ${whereClause}`;
        const countResult = await aiDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            p.id,
            p.name,
            p.description,
            p.prompt_text as "promptText",
            p.category,
            p.variables,
            p.is_system as "isSystem",
            p.is_active as "isActive",
            p.created_by as "createdBy",
            p.usage_count as "usageCount",
            p.created_at as "createdAt",
            p.updated_at as "updatedAt"
          FROM prompts p
          ${whereClause}
          ORDER BY p.usage_count DESC, p.name
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const prompts = await aiDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          prompts: prompts.map(prompt => ({
            ...prompt,
            createdAt: prompt.createdAt.toISOString(),
            updatedAt: prompt.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Get prompt by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .output(PromptSchema)
      .query(async ({ input, ctx }) => {
        const query = `
          SELECT 
            id,
            name,
            description,
            prompt_text as "promptText",
            category,
            variables,
            is_system as "isSystem",
            is_active as "isActive",
            created_by as "createdBy",
            usage_count as "usageCount",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM prompts
          WHERE id = $1 AND is_active = TRUE AND (is_system = TRUE OR created_by = $2)
        `;

        const prompt = await aiDB.queryRow<any>(query, input.id, ctx.user.id);

        if (!prompt) {
          throw new Error('Prompt not found');
        }

        return {
          ...prompt,
          createdAt: prompt.createdAt.toISOString(),
          updatedAt: prompt.updatedAt.toISOString(),
        };
      }),

    // Create prompt
    create: protectedProcedure
      .input(CreatePromptInputSchema)
      .output(PromptSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO prompts (
            name, description, prompt_text, category, variables, is_system,
            is_active, created_by, usage_count, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, true, $7, 0, NOW(), NOW())
          RETURNING 
            id,
            name,
            description,
            prompt_text as "promptText",
            category,
            variables,
            is_system as "isSystem",
            is_active as "isActive",
            created_by as "createdBy",
            usage_count as "usageCount",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const prompt = await aiDB.queryRow<any>(query,
          input.name,
          input.description,
          input.promptText,
          input.category,
          input.variables ? JSON.stringify(input.variables) : null,
          input.isSystem,
          ctx.user.id
        );

        if (!prompt) {
          throw new Error('Failed to create prompt');
        }

        return {
          ...prompt,
          createdAt: prompt.createdAt.toISOString(),
          updatedAt: prompt.updatedAt.toISOString(),
        };
      }),

    // Update prompt
    update: protectedProcedure
      .input(UpdatePromptInputSchema)
      .output(PromptSchema)
      .mutation(async ({ input, ctx }) => {
        // Check ownership
        const ownershipQuery = `SELECT created_by FROM prompts WHERE id = $1 AND is_active = TRUE`;
        const ownership = await aiDB.queryRow<{ created_by: number }>(ownershipQuery, input.id);
        
        if (!ownership || (ownership.created_by !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new Error('Unauthorized to update this prompt');
        }

        const updateFields: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        // Build dynamic update query
        Object.entries(input).forEach(([key, value]) => {
          if (key !== 'id' && value !== undefined) {
            const dbField = key === 'promptText' ? 'prompt_text' :
                           key === 'isSystem' ? 'is_system' :
                           key === 'isActive' ? 'is_active' : key;
            
            updateFields.push(`${dbField} = $${paramIndex}`);
            params.push(key === 'variables' && Array.isArray(value) ? JSON.stringify(value) : value);
            paramIndex++;
          }
        });

        if (updateFields.length === 0) {
          throw new Error('No fields to update');
        }

        updateFields.push(`updated_at = NOW()`);
        params.push(input.id);

        const query = `
          UPDATE prompts 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING 
            id,
            name,
            description,
            prompt_text as "promptText",
            category,
            variables,
            is_system as "isSystem",
            is_active as "isActive",
            created_by as "createdBy",
            usage_count as "usageCount",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const prompt = await aiDB.queryRow<any>(query, ...params);

        if (!prompt) {
          throw new Error('Prompt not found or update failed');
        }

        return {
          ...prompt,
          createdAt: prompt.createdAt.toISOString(),
          updatedAt: prompt.updatedAt.toISOString(),
        };
      }),
  }),

  // Model and provider management
  models: router({
    // List available models
    list: protectedProcedure
      .input(z.object({
        provider: z.enum(['openrouter', 'ollama', 'all']).default('all'),
      }))
      .output(z.object({
        models: z.array(z.object({
          id: z.string(),
          name: z.string(),
          provider: z.string(),
          pricing: z.any().optional(),
        })),
      }))
      .query(async ({ input }) => {
        const models: any[] = [];

        if (input.provider === 'openrouter' || input.provider === 'all') {
          try {
            const openRouterModels = await openRouterClient.listModels();
            models.push(...openRouterModels.map(model => ({
              ...model,
              provider: 'openrouter',
            })));
          } catch (error) {
            console.error('Failed to fetch OpenRouter models:', error);
          }
        }

        if (input.provider === 'ollama' || input.provider === 'all') {
          try {
            const ollamaModels = await ollamaClient.listModels();
            models.push(...ollamaModels.map(model => ({
              ...model,
              provider: 'ollama',
            })));
          } catch (error) {
            console.error('Failed to fetch Ollama models:', error);
          }
        }

        return { models };
      }),

    // Get provider status
    status: protectedProcedure
      .output(z.object({
        providers: z.array(z.object({
          name: z.string(),
          status: z.enum(['online', 'offline', 'error']),
          responseTime: z.number(),
          lastChecked: z.string(),
          modelCount: z.number(),
        })),
      }))
      .query(async () => {
        const providers = [];
        const now = new Date();

        // Check OpenRouter
        try {
          const start = Date.now();
          await openRouterClient.listModels();
          const responseTime = Date.now() - start;
          
          providers.push({
            name: 'openrouter',
            status: 'online' as const,
            responseTime,
            lastChecked: now.toISOString(),
            modelCount: 50, // Approximate
          });
        } catch (error) {
          providers.push({
            name: 'openrouter',
            status: 'error' as const,
            responseTime: 0,
            lastChecked: now.toISOString(),
            modelCount: 0,
          });
        }

        // Check Ollama
        try {
          const start = Date.now();
          const models = await ollamaClient.listModels();
          const responseTime = Date.now() - start;
          
          providers.push({
            name: 'ollama',
            status: 'online' as const,
            responseTime,
            lastChecked: now.toISOString(),
            modelCount: models.length,
          });
        } catch (error) {
          providers.push({
            name: 'ollama',
            status: 'offline' as const,
            responseTime: 0,
            lastChecked: now.toISOString(),
            modelCount: 0,
          });
        }

        // Gemini status (placeholder)
        providers.push({
          name: 'gemini',
          status: 'offline' as const,
          responseTime: 0,
          lastChecked: now.toISOString(),
          modelCount: 0,
        });

        return { providers };
      }),
  }),

  // Usage analytics
  usage: router({
    // Get usage statistics
    stats: protectedProcedure
      .input(z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        provider: z.enum(['openrouter', 'ollama', 'gemini']).optional(),
        schoolId: z.number().optional(),
      }))
      .output(z.object({
        totalRequests: z.number(),
        totalTokens: z.number(),
        totalCost: z.number(),
        byProvider: z.array(z.object({
          provider: z.string(),
          requests: z.number(),
          tokens: z.number(),
          cost: z.number(),
        })),
        byDay: z.array(z.object({
          date: z.string(),
          requests: z.number(),
          tokens: z.number(),
          cost: z.number(),
        })),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE user_id = $1";
        const params: any[] = [ctx.user.id];
        let paramIndex = 2;

        if (input.startDate) {
          whereClause += ` AND created_at >= $${paramIndex}`;
          params.push(input.startDate);
          paramIndex++;
        }

        if (input.endDate) {
          whereClause += ` AND created_at <= $${paramIndex}`;
          params.push(input.endDate);
          paramIndex++;
        }

        if (input.provider) {
          whereClause += ` AND provider = $${paramIndex}`;
          params.push(input.provider);
          paramIndex++;
        }

        if (input.schoolId) {
          whereClause += ` AND school_id = $${paramIndex}`;
          params.push(input.schoolId);
          paramIndex++;
        }

        // Get total stats
        const totalQuery = `
          SELECT 
            COUNT(*) as total_requests,
            SUM(tokens_used) as total_tokens,
            SUM(cost) as total_cost
          FROM ai_usage
          ${whereClause}
        `;

        const totalStats = await aiDB.queryRow<{
          total_requests: number;
          total_tokens: number;
          total_cost: number;
        }>(totalQuery, ...params);

        // Get stats by provider
        const providerQuery = `
          SELECT 
            provider,
            COUNT(*) as requests,
            SUM(tokens_used) as tokens,
            SUM(cost) as cost
          FROM ai_usage
          ${whereClause}
          GROUP BY provider
          ORDER BY requests DESC
        `;

        const providerStats = await aiDB.queryAll<{
          provider: string;
          requests: number;
          tokens: number;
          cost: number;
        }>(providerQuery, ...params);

        // Get stats by day
        const dayQuery = `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as requests,
            SUM(tokens_used) as tokens,
            SUM(cost) as cost
          FROM ai_usage
          ${whereClause}
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 30
        `;

        const dayStats = await aiDB.queryAll<{
          date: Date;
          requests: number;
          tokens: number;
          cost: number;
        }>(dayQuery, ...params);

        return {
          totalRequests: totalStats?.total_requests || 0,
          totalTokens: totalStats?.total_tokens || 0,
          totalCost: totalStats?.total_cost || 0,
          byProvider: providerStats,
          byDay: dayStats.map(stat => ({
            ...stat,
            date: stat.date.toISOString().split('T')[0],
          })),
        };
      }),

    // Get detailed usage history
    history: protectedProcedure
      .input(z.object({
        provider: z.enum(['openrouter', 'ollama', 'gemini']).optional(),
        requestType: z.enum(['chat', 'completion', 'embedding']).optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        usage: z.array(AIUsageSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE user_id = $1";
        const params: any[] = [ctx.user.id];
        let paramIndex = 2;

        if (input.provider) {
          whereClause += ` AND provider = $${paramIndex}`;
          params.push(input.provider);
          paramIndex++;
        }

        if (input.requestType) {
          whereClause += ` AND request_type = $${paramIndex}`;
          params.push(input.requestType);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM ai_usage ${whereClause}`;
        const countResult = await aiDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            id,
            user_id as "userId",
            model_name as "modelName",
            provider,
            tokens_used as "tokensUsed",
            cost,
            request_type as "requestType",
            school_id as "schoolId",
            created_at as "createdAt"
          FROM ai_usage
          ${whereClause}
          ORDER BY created_at DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const usage = await aiDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          usage: usage.map(u => ({
            ...u,
            createdAt: u.createdAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),
  }),
});