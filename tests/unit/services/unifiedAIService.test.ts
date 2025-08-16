/**
 * Unit tests for UnifiedAIService
 * Tests the core AI service functionality with mocked providers
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnifiedAIService } from '../../../services/unifiedAIService';
import { mockChatResponses, mockProviderStatus, mockModels, mockUsageStats } from '../../utils/ai-mocks';
import type { AIProvider, AIServiceConfig } from '../../../services/unifiedAIService';

describe('UnifiedAIService', () => {
  let aiService: UnifiedAIService;

  beforeEach(() => {
    aiService = UnifiedAIService.getInstance();
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = UnifiedAIService.getInstance();
      const instance2 = UnifiedAIService.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(UnifiedAIService);
    });
  });

  describe('generateText', () => {
    it('should generate text with default provider', async () => {
      const prompt = 'Hello, world!';
      const response = await aiService.generateText(prompt);

      expect(response).toMatchObject({
        response: expect.any(String),
        provider: expect.any(String),
        model: expect.any(String),
        tokensUsed: expect.any(Number),
        cost: expect.any(Number),
        responseTime: expect.any(Number),
      });
      expect(response.response).toBeTruthy();
      expect(response.tokensUsed).toBeGreaterThan(0);
    });

    it('should generate text with specific provider', async () => {
      const prompt = 'Test prompt';
      const config: AIServiceConfig = {
        provider: 'ollama',
        model: 'llama3.1:8b',
        temperature: 0.5,
      };

      const response = await aiService.generateText(prompt, config);

      expect(response.provider).toBe('ollama');
      expect(response.cost).toBe(0); // Ollama is free
      expect(response.responseTime).toBeGreaterThan(0);
    });

    it('should handle system prompts', async () => {
      const prompt = 'User message';
      const config: AIServiceConfig = {
        systemPrompt: 'You are a helpful assistant.',
        provider: 'openrouter',
      };

      const response = await aiService.generateText(prompt, config);

      expect(response).toMatchObject({
        response: expect.any(String),
        provider: 'openrouter',
        model: expect.any(String),
      });
    });

    it('should handle different context types', async () => {
      const prompt = 'Academic question';
      const config: AIServiceConfig = {
        contextType: 'academic',
        provider: 'gemini',
      };

      const response = await aiService.generateText(prompt, config);

      expect(response.provider).toBe('gemini');
      expect(response.response).toBeTruthy();
    });

    it('should handle custom temperature and max tokens', async () => {
      const prompt = 'Creative writing prompt';
      const config: AIServiceConfig = {
        temperature: 0.9,
        maxTokens: 1000,
        provider: 'openrouter',
      };

      const response = await aiService.generateText(prompt, config);

      expect(response.tokensUsed).toBeLessThanOrEqual(1000);
      expect(response.response).toBeTruthy();
    });

    it('should handle errors gracefully', async () => {
      // Mock an error scenario
      const mockError = new Error('Provider unavailable');
      vi.mocked(global.fetch).mockRejectedValueOnce(mockError);

      const prompt = 'Test prompt';
      
      // Should still return a response due to fallback mechanism
      const response = await aiService.generateText(prompt);
      expect(response).toBeDefined();
    });
  });

  describe('smartGenerateText', () => {
    it('should select appropriate provider for use case', async () => {
      const prompt = 'Write some code';
      const response = await aiService.smartGenerateText(prompt, 'coding');

      expect(response).toMatchObject({
        response: expect.any(String),
        provider: expect.any(String),
        model: expect.any(String),
      });
    });

    it('should handle cost-effective use case', async () => {
      const prompt = 'Simple question';
      const response = await aiService.smartGenerateText(prompt, 'cost-effective');

      // Should prefer free or low-cost providers
      expect(['ollama', 'gemini']).toContain(response.provider);
    });

    it('should handle fast use case', async () => {
      const prompt = 'Quick question';
      const response = await aiService.smartGenerateText(prompt, 'fast');

      expect(response.responseTime).toBeDefined();
      expect(response.response).toBeTruthy();
    });

    it('should handle creative use case', async () => {
      const prompt = 'Write a story';
      const response = await aiService.smartGenerateText(prompt, 'creative');

      expect(response.response).toBeTruthy();
      expect(response.tokensUsed).toBeGreaterThan(0);
    });
  });

  describe('getAvailableModels', () => {
    it('should return all available models', async () => {
      const models = await aiService.getAvailableModels();

      expect(models).toBeInstanceOf(Array);
      expect(models.length).toBeGreaterThan(0);
      expect(models[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        provider: expect.any(String),
        description: expect.any(String),
        contextLength: expect.any(Number),
        inputPricing: expect.any(Number),
        outputPricing: expect.any(Number),
        capabilities: expect.any(Array),
      });
    });

    it('should return models for specific provider', async () => {
      const models = await aiService.getAvailableModels('openrouter');

      expect(models).toBeInstanceOf(Array);
      models.forEach(model => {
        expect(model.provider).toBe('openrouter');
      });
    });

    it('should handle invalid provider', async () => {
      const models = await aiService.getAvailableModels('invalid' as AIProvider);

      expect(models).toBeInstanceOf(Array);
      // Should return empty array or handle gracefully
    });
  });

  describe('getProviderStatus', () => {
    it('should return status for all providers', async () => {
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

    it('should handle provider connection errors', async () => {
      // Mock network error
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const statuses = await aiService.getProviderStatus();

      expect(statuses).toBeInstanceOf(Array);
      // Should still return status array, possibly with error states
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

      expect(stats.byProvider[0]).toMatchObject({
        provider: expect.any(String),
        requests: expect.any(Number),
        tokens: expect.any(Number),
        cost: expect.any(Number),
      });
    });

    it('should filter usage stats by provider', async () => {
      const stats = await aiService.getUsageStats({ provider: 'openrouter' });

      expect(stats).toBeDefined();
      expect(stats.byProvider).toBeInstanceOf(Array);
    });

    it('should filter usage stats by date range', async () => {
      const stats = await aiService.getUsageStats({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(stats).toBeDefined();
      expect(stats.byDay).toBeInstanceOf(Array);
    });
  });

  describe('testProvider', () => {
    it('should test provider connectivity', async () => {
      const result = await aiService.testProvider('openrouter');

      expect(typeof result).toBe('boolean');
    });

    it('should handle provider test failures', async () => {
      // Mock failure
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Connection failed'));

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

    it('should consider use case in recommendation', async () => {
      const costEffectiveProvider = await aiService.getRecommendedProvider('cost-effective');
      const creativeProvider = await aiService.getRecommendedProvider('creative');

      expect(['openrouter', 'ollama', 'gemini']).toContain(costEffectiveProvider);
      expect(['openrouter', 'ollama', 'gemini']).toContain(creativeProvider);
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost for OpenRouter', () => {
      const cost = aiService.estimateCost('openrouter', 'gpt-3.5-turbo', 1000, 500);

      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThanOrEqual(0);
    });

    it('should return zero cost for Ollama', () => {
      const cost = aiService.estimateCost('ollama', 'llama3.1:8b', 1000, 500);

      expect(cost).toBe(0);
    });

    it('should estimate cost for Gemini', () => {
      const cost = aiService.estimateCost('gemini', 'gemini-pro', 1000, 500);

      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getProviderCapabilities', () => {
    it('should return capabilities for all providers', () => {
      const capabilities = aiService.getProviderCapabilities();

      expect(capabilities).toBeInstanceOf(Object);
      expect(capabilities.openrouter).toBeDefined();
      expect(capabilities.ollama).toBeDefined();
      expect(capabilities.gemini).toBeDefined();

      // Check capability structure
      Object.values(capabilities).forEach(providerCaps => {
        expect(providerCaps).toMatchObject({
          textGeneration: expect.any(Boolean),
          imageGeneration: expect.any(Boolean),
          visionAnalysis: expect.any(Boolean),
          codeGeneration: expect.any(Boolean),
          streaming: expect.any(Boolean),
          localDeployment: expect.any(Boolean),
          customModels: expect.any(Boolean),
        });
      });
    });
  });

  describe('getRecommendedModels', () => {
    it('should return model recommendations', () => {
      const recommendations = aiService.getRecommendedModels();

      expect(recommendations).toBeInstanceOf(Object);
      expect(recommendations.openrouter).toBeDefined();
      expect(recommendations.ollama).toBeDefined();
      expect(recommendations.gemini).toBeDefined();

      // Check recommendation structure
      Object.values(recommendations).forEach(providerRecs => {
        expect(providerRecs).toBeInstanceOf(Object);
        expect(providerRecs.general).toBeDefined();
      });
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const response = await aiService.generateText('Test prompt');
      
      // Should either succeed with fallback or throw meaningful error
      expect(response).toBeDefined();
    });

    it('should handle invalid API responses', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      } as Response);

      await expect(aiService.generateText('Test prompt')).rejects.toThrow();
    });

    it('should handle API rate limiting', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      } as Response);

      await expect(aiService.generateText('Test prompt')).rejects.toThrow();
    });

    it('should handle authentication errors', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      await expect(aiService.generateText('Test prompt')).rejects.toThrow();
    });
  });

  describe('performance', () => {
    it('should complete requests within reasonable time', async () => {
      const startTime = Date.now();
      const response = await aiService.generateText('Quick test');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
      expect(response.responseTime).toBeGreaterThan(0);
    });

    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        aiService.generateText(`Concurrent request ${i}`)
      );

      const responses = await Promise.all(promises);

      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect(response.response).toBeTruthy();
      });
    });
  });
});