/**
 * Unit tests for legacy AIService
 * Tests backward compatibility and delegation to UnifiedAIService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIService, aiService } from '../../../services/aiService';
import type { AIProvider, AIServiceConfig } from '../../../services/aiService';

describe('AIService (Legacy)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AIService.getInstance();
      const instance2 = AIService.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(AIService);
    });

    it('should export singleton instance', () => {
      expect(aiService).toBeInstanceOf(AIService);
      expect(aiService).toBe(AIService.getInstance());
    });
  });

  describe('chat', () => {
    it('should send chat message with default options', async () => {
      const message = 'Hello, AI!';
      const response = await aiService.chat(message);

      expect(response).toMatchObject({
        response: expect.any(String),
        provider: expect.any(String),
        model: expect.any(String),
        tokensUsed: expect.any(Number),
        cost: expect.any(Number),
      });
    });

    it('should send chat message with custom options', async () => {
      const message = 'Test message';
      const options: AIServiceConfig = {
        provider: 'ollama',
        temperature: 0.8,
        maxTokens: 500,
      };

      const response = await aiService.chat(message, options);

      expect(response.provider).toBe('ollama');
      expect(response.response).toBeTruthy();
    });

    it('should handle system prompts', async () => {
      const message = 'User question';
      const options: AIServiceConfig = {
        systemPrompt: 'You are a helpful assistant.',
      };

      const response = await aiService.chat(message, options);

      expect(response.response).toBeTruthy();
    });
  });

  describe('continueConversation', () => {
    it('should continue existing conversation', async () => {
      const conversationId = 123;
      const message = 'Follow-up question';

      const response = await aiService.continueConversation(conversationId, message);

      expect(response).toMatchObject({
        response: expect.any(String),
        provider: expect.any(String),
        model: expect.any(String),
      });
    });

    it('should handle conversation with options', async () => {
      const conversationId = 456;
      const message = 'Another question';
      const options: AIServiceConfig = {
        provider: 'gemini',
        temperature: 0.5,
      };

      const response = await aiService.continueConversation(conversationId, message, options);

      expect(response.response).toBeTruthy();
    });
  });

  describe('getConversations', () => {
    it('should return empty array (not implemented)', async () => {
      const conversations = await aiService.getConversations();

      expect(conversations).toEqual([]);
    });

    it('should handle options', async () => {
      const conversations = await aiService.getConversations({
        contextType: 'academic',
        limit: 10,
      });

      expect(conversations).toEqual([]);
    });
  });

  describe('getConversation', () => {
    it('should throw not implemented error', async () => {
      await expect(aiService.getConversation(123)).rejects.toThrow('not yet implemented');
    });
  });

  describe('createConversation', () => {
    it('should throw not implemented error', async () => {
      await expect(aiService.createConversation()).rejects.toThrow('not yet implemented');
    });

    it('should handle options', async () => {
      const options = {
        title: 'Test Conversation',
        contextType: 'general' as const,
        schoolId: 1,
      };

      await expect(aiService.createConversation(options)).rejects.toThrow('not yet implemented');
    });
  });

  describe('getAvailableModels', () => {
    it('should return available models', async () => {
      const models = await aiService.getAvailableModels();

      expect(models).toBeInstanceOf(Array);
      expect(models.length).toBeGreaterThan(0);
      expect(models[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        provider: expect.any(String),
        pricing: expect.any(Object),
      });
    });

    it('should return models for specific provider', async () => {
      const models = await aiService.getAvailableModels('openrouter');

      expect(models).toBeInstanceOf(Array);
      models.forEach(model => {
        expect(model.provider).toBe('openrouter');
      });
    });
  });

  describe('getProviderStatus', () => {
    it('should return provider status', async () => {
      const statuses = await aiService.getProviderStatus();

      expect(statuses).toBeInstanceOf(Array);
      expect(statuses.length).toBeGreaterThan(0);
      expect(statuses[0]).toMatchObject({
        name: expect.any(String),
        displayName: expect.any(String),
        status: expect.stringMatching(/^(online|offline|error)$/),
        responseTime: expect.any(Number),
        modelCount: expect.any(Number),
        lastChecked: expect.any(String),
        capabilities: expect.any(Array),
      });
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      const stats = await aiService.getUsageStats();

      expect(stats).toMatchObject({
        totalRequests: expect.any(Number),
        totalTokens: expect.any(Number),
        totalCost: expect.any(Number),
        byProvider: expect.any(Array),
        byDay: expect.any(Array),
      });
    });

    it('should handle filtering options', async () => {
      const stats = await aiService.getUsageStats({
        provider: 'openrouter',
        schoolId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(stats).toBeDefined();
    });
  });

  describe('getPrompts', () => {
    it('should return empty array (not implemented)', async () => {
      const prompts = await aiService.getPrompts();

      expect(prompts).toEqual([]);
    });

    it('should handle search options', async () => {
      const prompts = await aiService.getPrompts({
        category: 'academic',
        search: 'test',
        limit: 10,
      });

      expect(prompts).toEqual([]);
    });
  });

  describe('createPrompt', () => {
    it('should throw not implemented error', async () => {
      const prompt = {
        name: 'Test Prompt',
        promptText: 'Test prompt text',
        category: 'general',
      };

      await expect(aiService.createPrompt(prompt)).rejects.toThrow('not yet implemented');
    });
  });

  describe('testProvider', () => {
    it('should test provider connectivity', async () => {
      const result = await aiService.testProvider('openrouter');

      expect(typeof result).toBe('boolean');
    });

    it('should test all providers', async () => {
      const providers: AIProvider[] = ['openrouter', 'ollama', 'gemini'];
      
      for (const provider of providers) {
        const result = await aiService.testProvider(provider);
        expect(typeof result).toBe('boolean');
      }
    });
  });

  describe('getRecommendedProvider', () => {
    it('should return recommended provider', async () => {
      const provider = await aiService.getRecommendedProvider();

      expect(['openrouter', 'ollama', 'gemini']).toContain(provider);
    });
  });

  describe('smartChat', () => {
    it('should perform smart chat with automatic provider selection', async () => {
      const message = 'Smart chat test';
      const response = await aiService.smartChat(message);

      expect(response).toMatchObject({
        response: expect.any(String),
        provider: expect.any(String),
        model: expect.any(String),
        tokensUsed: expect.any(Number),
        cost: expect.any(Number),
      });
    });

    it('should respect preferred provider', async () => {
      const message = 'Test with preferred provider';
      const options = {
        preferredProvider: 'ollama' as AIProvider,
        temperature: 0.7,
      };

      const response = await aiService.smartChat(message, options);

      expect(response.response).toBeTruthy();
    });

    it('should handle system prompt in smart chat', async () => {
      const message = 'Smart chat with system prompt';
      const options = {
        systemPrompt: 'You are an expert assistant.',
        maxTokens: 1000,
      };

      const response = await aiService.smartChat(message, options);

      expect(response.response).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should handle provider errors gracefully', async () => {
      // Mock error
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Provider error'));

      const response = await aiService.chat('Test message');
      
      // Should handle error gracefully or provide fallback
      expect(response).toBeDefined();
    });

    it('should handle invalid options', async () => {
      const message = 'Test message';
      const invalidOptions = {
        provider: 'invalid-provider' as AIProvider,
        temperature: -1, // Invalid temperature
        maxTokens: -100, // Invalid max tokens
      };

      // Should either handle gracefully or throw meaningful error
      await expect(aiService.chat(message, invalidOptions)).resolves.toBeDefined();
    });
  });

  describe('backward compatibility', () => {
    it('should maintain interface compatibility', () => {
      // Check that all expected methods exist
      expect(typeof aiService.chat).toBe('function');
      expect(typeof aiService.continueConversation).toBe('function');
      expect(typeof aiService.getConversations).toBe('function');
      expect(typeof aiService.getConversation).toBe('function');
      expect(typeof aiService.createConversation).toBe('function');
      expect(typeof aiService.getAvailableModels).toBe('function');
      expect(typeof aiService.getProviderStatus).toBe('function');
      expect(typeof aiService.getUsageStats).toBe('function');
      expect(typeof aiService.getPrompts).toBe('function');
      expect(typeof aiService.createPrompt).toBe('function');
      expect(typeof aiService.testProvider).toBe('function');
      expect(typeof aiService.getRecommendedProvider).toBe('function');
      expect(typeof aiService.smartChat).toBe('function');
    });

    it('should export legacy functions', async () => {
      const { 
        generateText, 
        generateTextWithProvider, 
        smartChat,
        getAvailableModels,
        getProviderStatus,
        testProvider,
      } = await import('../../../services/aiService');

      expect(typeof generateText).toBe('function');
      expect(typeof generateTextWithProvider).toBe('function');
      expect(typeof smartChat).toBe('function');
      expect(typeof getAvailableModels).toBe('function');
      expect(typeof getProviderStatus).toBe('function');
      expect(typeof testProvider).toBe('function');
    });
  });
});