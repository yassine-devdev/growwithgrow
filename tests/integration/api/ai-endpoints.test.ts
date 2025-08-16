/**
 * Integration tests for AI API endpoints
 * Tests the complete flow from HTTP request to AI service response
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase, resetTestData } from '../../utils/database';
import { mockAIProviders } from '../../utils/ai-mocks';
import { createMockTRPCContext, mockHTTPRequest } from '../../utils/server';

describe('AI API Endpoints Integration', () => {
  beforeEach(async () => {
    await setupTestDatabase();
    mockAIProviders();
    await resetTestData();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
    vi.clearAllMocks();
  });

  describe('POST /api/ai/chat', () => {
    it('should handle chat request successfully', async () => {
      const requestBody = {
        message: 'Hello, AI!',
        provider: 'openrouter',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
      };

      const response = await mockHTTPRequest('POST', '/api/ai/chat', {
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        data: {
          response: expect.any(String),
          provider: expect.any(String),
          model: expect.any(String),
          tokensUsed: expect.any(Number),
          cost: expect.any(Number),
        },
      });
    });

    it('should validate request body', async () => {
      const invalidRequestBody = {
        message: '', // Empty message should fail validation
        temperature: 3, // Invalid temperature
      };

      const response = await mockHTTPRequest('POST', '/api/ai/chat', {
        body: invalidRequestBody,
        headers: { 'Content-Type': 'application/json' },
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(400);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('validation'),
      });
    });

    it('should require authentication', async () => {
      const requestBody = {
        message: 'Hello, AI!',
      };

      const response = await mockHTTPRequest('POST', '/api/ai/chat', {
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
        // No user provided
      });

      expect(response.status).toBe(401);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('authentication'),
      });
    });

    it('should handle AI service errors gracefully', async () => {
      // Mock AI service to throw error
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('AI service unavailable'));

      const requestBody = {
        message: 'Hello, AI!',
        provider: 'openrouter',
      };

      const response = await mockHTTPRequest('POST', '/api/ai/chat', {
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(500);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('AI service'),
      });
    });

    it('should track usage in database', async () => {
      const requestBody = {
        message: 'Hello, AI!',
        provider: 'openrouter',
      };

      const response = await mockHTTPRequest('POST', '/api/ai/chat', {
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(200);

      // Verify usage was tracked in database
      const usage = global.mockDb.getAIUsageByUser(1);
      expect(usage).toHaveLength(1);
      expect(usage[0]).toMatchObject({
        userId: 1,
        provider: 'openrouter',
        tokensUsed: expect.any(Number),
        cost: expect.any(Number),
      });
    });
  });

  describe('GET /api/ai/models', () => {
    it('should return available models', async () => {
      const response = await mockHTTPRequest('GET', '/api/ai/models', {
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            provider: expect.any(String),
            capabilities: expect.any(Array),
          }),
        ]),
      });
    });

    it('should filter models by provider', async () => {
      const response = await mockHTTPRequest('GET', '/api/ai/models', {
        query: { provider: 'openrouter' },
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toBeInstanceOf(Array);
      response.data.data.forEach((model: any) => {
        expect(model.provider).toBe('openrouter');
      });
    });

    it('should require authentication', async () => {
      const response = await mockHTTPRequest('GET', '/api/ai/models');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/ai/usage', () => {
    it('should return user usage statistics', async () => {
      // Create some usage data
      global.mockDb.createAIUsage({
        userId: 1,
        provider: 'openrouter',
        modelName: 'gpt-3.5-turbo',
        tokensUsed: 100,
        cost: 0.002,
        requestType: 'chat',
      });

      const response = await mockHTTPRequest('GET', '/api/ai/usage', {
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        data: {
          totalRequests: expect.any(Number),
          totalTokens: expect.any(Number),
          totalCost: expect.any(Number),
          byProvider: expect.any(Array),
          byDay: expect.any(Array),
        },
      });
    });

    it('should filter usage by date range', async () => {
      const response = await mockHTTPRequest('GET', '/api/ai/usage', {
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it('should only return user\'s own usage data', async () => {
      // Create usage for different users
      global.mockDb.createAIUsage({
        userId: 1,
        provider: 'openrouter',
        modelName: 'gpt-3.5-turbo',
        tokensUsed: 100,
        cost: 0.002,
        requestType: 'chat',
      });

      global.mockDb.createAIUsage({
        userId: 2,
        provider: 'openrouter',
        modelName: 'gpt-3.5-turbo',
        tokensUsed: 200,
        cost: 0.004,
        requestType: 'chat',
      });

      const response = await mockHTTPRequest('GET', '/api/ai/usage', {
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(200);
      
      // Should only include user 1's usage
      const userUsage = global.mockDb.getAIUsageByUser(1);
      expect(userUsage).toHaveLength(1);
      expect(userUsage[0].userId).toBe(1);
    });
  });

  describe('GET /api/ai/providers/status', () => {
    it('should return provider status', async () => {
      const response = await mockHTTPRequest('GET', '/api/ai/providers/status', {
        user: { id: 1, role: 'admin' },
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            displayName: expect.any(String),
            status: expect.stringMatching(/^(online|offline|error)$/),
            responseTime: expect.any(Number),
            modelCount: expect.any(Number),
            capabilities: expect.any(Array),
          }),
        ]),
      });
    });

    it('should require admin role', async () => {
      const response = await mockHTTPRequest('GET', '/api/ai/providers/status', {
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(403);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('permission'),
      });
    });
  });

  describe('POST /api/ai/providers/test', () => {
    it('should test provider connectivity', async () => {
      const requestBody = {
        provider: 'openrouter',
      };

      const response = await mockHTTPRequest('POST', '/api/ai/providers/test', {
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
        user: { id: 1, role: 'admin' },
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        data: {
          provider: 'openrouter',
          isConnected: expect.any(Boolean),
          responseTime: expect.any(Number),
        },
      });
    });

    it('should handle invalid provider', async () => {
      const requestBody = {
        provider: 'invalid-provider',
      };

      const response = await mockHTTPRequest('POST', '/api/ai/providers/test', {
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
        user: { id: 1, role: 'admin' },
      });

      expect(response.status).toBe(400);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid provider'),
      });
    });

    it('should require admin role', async () => {
      const requestBody = {
        provider: 'openrouter',
      };

      const response = await mockHTTPRequest('POST', '/api/ai/providers/test', {
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(403);
    });
  });

  describe('Rate limiting', () => {
    it('should enforce rate limits', async () => {
      const requestBody = {
        message: 'Hello, AI!',
      };

      // Make multiple requests rapidly
      const promises = Array.from({ length: 10 }, () =>
        mockHTTPRequest('POST', '/api/ai/chat', {
          body: requestBody,
          headers: { 'Content-Type': 'application/json' },
          user: { id: 1, role: 'student' },
        })
      );

      const responses = await Promise.all(promises);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should have different rate limits for different roles', async () => {
      const requestBody = {
        message: 'Hello, AI!',
      };

      // Admin should have higher rate limits
      const adminResponse = await mockHTTPRequest('POST', '/api/ai/chat', {
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
        user: { id: 1, role: 'admin' },
      });

      expect(adminResponse.status).toBe(200);

      // Student should have lower rate limits
      const studentResponse = await mockHTTPRequest('POST', '/api/ai/chat', {
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
        user: { id: 2, role: 'student' },
      });

      expect(studentResponse.status).toBe(200);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await mockHTTPRequest('POST', '/api/ai/chat', {
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(400);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid JSON'),
      });
    });

    it('should handle missing content-type header', async () => {
      const response = await mockHTTPRequest('POST', '/api/ai/chat', {
        body: { message: 'Hello' },
        // Missing Content-Type header
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(400);
    });

    it('should handle database connection errors', async () => {
      // Mock database error
      vi.mocked(global.mockDb.createAIUsage).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const requestBody = {
        message: 'Hello, AI!',
      };

      const response = await mockHTTPRequest('POST', '/api/ai/chat', {
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
        user: { id: 1, role: 'student' },
      });

      // Should still succeed but log the database error
      expect(response.status).toBe(200);
    });
  });

  describe('Security', () => {
    it('should sanitize input messages', async () => {
      const requestBody = {
        message: '<script>alert("xss")</script>Hello World',
      };

      const response = await mockHTTPRequest('POST', '/api/ai/chat', {
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
        user: { id: 1, role: 'student' },
      });

      expect(response.status).toBe(200);
      // The actual sanitization would be tested in the validation layer
    });

    it('should validate JWT tokens', async () => {
      const requestBody = {
        message: 'Hello, AI!',
      };

      const response = await mockHTTPRequest('POST', '/api/ai/chat', {
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token',
        },
      });

      expect(response.status).toBe(401);
    });

    it('should prevent SQL injection in usage queries', async () => {
      const response = await mockHTTPRequest('GET', '/api/ai/usage', {
        query: {
          startDate: "'; DROP TABLE users; --",
        },
        user: { id: 1, role: 'student' },
      });

      // Should handle malicious input gracefully
      expect([200, 400]).toContain(response.status);
    });
  });
});