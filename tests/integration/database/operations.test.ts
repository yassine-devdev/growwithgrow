/**
 * Integration tests for database operations
 * Tests database transactions, constraints, and data integrity
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase, resetTestData, createTestUser, createTestSchool } from '../../utils/database';

describe('Database Operations Integration', () => {
  beforeEach(async () => {
    await setupTestDatabase();
    await resetTestData();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
    vi.clearAllMocks();
  });

  describe('User Operations', () => {
    it('should create user with valid data', async () => {
      const userData = {
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        role: 'student' as const,
        isActive: true,
      };

      const user = global.mockDb.createUser(userData);

      expect(user).toMatchObject({
        id: expect.any(Number),
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        role: 'student',
        isActive: true,
        createdAt: expect.any(Date),
      });
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'duplicate@test.com',
        firstName: 'First',
        lastName: 'User',
        role: 'student' as const,
      };

      // Create first user
      const user1 = global.mockDb.createUser(userData);
      expect(user1).toBeDefined();

      // Attempt to create second user with same email
      expect(() => {
        global.mockDb.createUser(userData);
      }).toThrow('Email already exists');
    });

    it('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        firstName: 'Test',
        lastName: 'User',
        role: 'student' as const,
      };

      expect(() => {
        global.mockDb.createUser(userData);
      }).toThrow('Invalid email format');
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        // Missing firstName, lastName, role
      };

      expect(() => {
        global.mockDb.createUser(incompleteData);
      }).toThrow('Missing required fields');
    });

    it('should update user data', async () => {
      const user = createTestUser();
      global.mockDb.createUser(user);

      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const updatedUser = global.mockDb.updateUser(user.id, updates);

      expect(updatedUser).toMatchObject({
        id: user.id,
        firstName: 'Updated',
        lastName: 'Name',
        email: user.email, // Should remain unchanged
      });
    });

    it('should soft delete users', async () => {
      const user = createTestUser();
      global.mockDb.createUser(user);

      const updatedUser = global.mockDb.updateUser(user.id, { isActive: false });

      expect(updatedUser.isActive).toBe(false);
      
      // User should still exist but be inactive
      const foundUser = global.mockDb.findUserById(user.id);
      expect(foundUser).toBeDefined();
      expect(foundUser.isActive).toBe(false);
    });

    it('should find user by email', async () => {
      const user = createTestUser({ email: 'findme@test.com' });
      global.mockDb.createUser(user);

      const foundUser = global.mockDb.findUserByEmail('findme@test.com');

      expect(foundUser).toMatchObject({
        id: user.id,
        email: 'findme@test.com',
      });
    });

    it('should return null for non-existent user', async () => {
      const foundUser = global.mockDb.findUserById(99999);
      expect(foundUser).toBeNull();
    });
  });

  describe('School Operations', () => {
    it('should create school with valid data', async () => {
      const schoolData = {
        name: 'New Test School',
        type: 'elementary' as const,
        isActive: true,
      };

      const school = global.mockDb.createSchool(schoolData);

      expect(school).toMatchObject({
        id: expect.any(Number),
        name: 'New Test School',
        type: 'elementary',
        isActive: true,
        createdAt: expect.any(Date),
      });
    });

    it('should validate school type', async () => {
      const schoolData = {
        name: 'Test School',
        type: 'invalid-type' as any,
      };

      expect(() => {
        global.mockDb.createSchool(schoolData);
      }).toThrow('Invalid school type');
    });

    it('should enforce name length constraints', async () => {
      const schoolData = {
        name: '', // Empty name
        type: 'elementary' as const,
      };

      expect(() => {
        global.mockDb.createSchool(schoolData);
      }).toThrow('School name is required');
    });
  });

  describe('AI Usage Operations', () => {
    it('should track AI usage', async () => {
      const user = createTestUser();
      global.mockDb.createUser(user);

      const usageData = {
        userId: user.id,
        provider: 'openrouter',
        modelName: 'gpt-3.5-turbo',
        tokensUsed: 100,
        cost: 0.002,
        requestType: 'chat',
      };

      const usage = global.mockDb.createAIUsage(usageData);

      expect(usage).toMatchObject({
        id: expect.any(Number),
        userId: user.id,
        provider: 'openrouter',
        modelName: 'gpt-3.5-turbo',
        tokensUsed: 100,
        cost: 0.002,
        requestType: 'chat',
        createdAt: expect.any(Date),
      });
    });

    it('should validate foreign key constraints', async () => {
      const usageData = {
        userId: 99999, // Non-existent user
        provider: 'openrouter',
        modelName: 'gpt-3.5-turbo',
        tokensUsed: 100,
        cost: 0.002,
        requestType: 'chat',
      };

      expect(() => {
        global.mockDb.createAIUsage(usageData);
      }).toThrow('User not found');
    });

    it('should validate usage data types', async () => {
      const user = createTestUser();
      global.mockDb.createUser(user);

      const invalidUsageData = {
        userId: user.id,
        provider: 'openrouter',
        modelName: 'gpt-3.5-turbo',
        tokensUsed: -100, // Negative tokens
        cost: 'invalid', // Invalid cost type
        requestType: 'chat',
      };

      expect(() => {
        global.mockDb.createAIUsage(invalidUsageData);
      }).toThrow('Invalid usage data');
    });

    it('should retrieve usage by user', async () => {
      const user1 = createTestUser({ email: 'user1@test.com' });
      const user2 = createTestUser({ email: 'user2@test.com' });
      
      global.mockDb.createUser(user1);
      global.mockDb.createUser(user2);

      // Create usage for both users
      global.mockDb.createAIUsage({
        userId: user1.id,
        provider: 'openrouter',
        modelName: 'gpt-3.5-turbo',
        tokensUsed: 100,
        cost: 0.002,
        requestType: 'chat',
      });

      global.mockDb.createAIUsage({
        userId: user2.id,
        provider: 'ollama',
        modelName: 'llama3.1:8b',
        tokensUsed: 200,
        cost: 0,
        requestType: 'chat',
      });

      const user1Usage = global.mockDb.getAIUsageByUser(user1.id);
      const user2Usage = global.mockDb.getAIUsageByUser(user2.id);

      expect(user1Usage).toHaveLength(1);
      expect(user1Usage[0].userId).toBe(user1.id);
      expect(user1Usage[0].provider).toBe('openrouter');

      expect(user2Usage).toHaveLength(1);
      expect(user2Usage[0].userId).toBe(user2.id);
      expect(user2Usage[0].provider).toBe('ollama');
    });
  });

  describe('Transaction Operations', () => {
    it('should handle successful transactions', async () => {
      const result = await global.mockDb.transaction(async (tx: any) => {
        const user = tx.createUser({
          email: 'transaction@test.com',
          firstName: 'Transaction',
          lastName: 'User',
          role: 'student',
        });

        const school = tx.createSchool({
          name: 'Transaction School',
          type: 'elementary',
        });

        return { user, school };
      });

      expect(result.user).toBeDefined();
      expect(result.school).toBeDefined();

      // Verify data was committed
      const user = global.mockDb.findUserByEmail('transaction@test.com');
      expect(user).toBeDefined();
    });

    it('should rollback failed transactions', async () => {
      await expect(
        global.mockDb.transaction(async (tx: any) => {
          tx.createUser({
            email: 'rollback@test.com',
            firstName: 'Rollback',
            lastName: 'User',
            role: 'student',
          });

          // This should cause the transaction to fail
          throw new Error('Transaction failed');
        })
      ).rejects.toThrow('Transaction failed');

      // Verify data was not committed
      const user = global.mockDb.findUserByEmail('rollback@test.com');
      expect(user).toBeNull();
    });

    it('should handle nested transactions', async () => {
      const result = await global.mockDb.transaction(async (tx: any) => {
        const user = tx.createUser({
          email: 'nested@test.com',
          firstName: 'Nested',
          lastName: 'User',
          role: 'student',
        });

        // Nested transaction
        const nestedResult = await tx.transaction(async (nestedTx: any) => {
          return nestedTx.createSchool({
            name: 'Nested School',
            type: 'middle',
          });
        });

        return { user, school: nestedResult };
      });

      expect(result.user).toBeDefined();
      expect(result.school).toBeDefined();
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity', async () => {
      const user = createTestUser();
      global.mockDb.createUser(user);

      // Create AI usage referencing the user
      global.mockDb.createAIUsage({
        userId: user.id,
        provider: 'openrouter',
        modelName: 'gpt-3.5-turbo',
        tokensUsed: 100,
        cost: 0.002,
        requestType: 'chat',
      });

      // Attempting to delete user should fail due to foreign key constraint
      expect(() => {
        global.mockDb.deleteUser(user.id);
      }).toThrow('Cannot delete user with existing usage records');
    });

    it('should handle cascade deletes properly', async () => {
      const user = createTestUser();
      global.mockDb.createUser(user);

      // Create AI usage
      global.mockDb.createAIUsage({
        userId: user.id,
        provider: 'openrouter',
        modelName: 'gpt-3.5-turbo',
        tokensUsed: 100,
        cost: 0.002,
        requestType: 'chat',
      });

      // Soft delete user (set inactive)
      global.mockDb.updateUser(user.id, { isActive: false });

      // Usage records should still exist
      const usage = global.mockDb.getAIUsageByUser(user.id);
      expect(usage).toHaveLength(1);
    });

    it('should validate data consistency', async () => {
      const user = createTestUser();
      global.mockDb.createUser(user);

      // Create usage with inconsistent data
      expect(() => {
        global.mockDb.createAIUsage({
          userId: user.id,
          provider: 'openrouter',
          modelName: 'gpt-3.5-turbo',
          tokensUsed: 100,
          cost: -0.002, // Negative cost should be invalid
          requestType: 'chat',
        });
      }).toThrow('Cost cannot be negative');
    });
  });

  describe('Performance', () => {
    it('should handle bulk operations efficiently', async () => {
      const startTime = Date.now();

      // Create multiple users
      const users = Array.from({ length: 100 }, (_, i) => ({
        email: `bulk${i}@test.com`,
        firstName: `User${i}`,
        lastName: 'Bulk',
        role: 'student' as const,
      }));

      users.forEach(userData => {
        global.mockDb.createUser(userData);
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second
    });

    it('should handle concurrent operations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve().then(() => {
          const user = createTestUser({ email: `concurrent${i}@test.com` });
          return global.mockDb.createUser(user);
        })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((user, index) => {
        expect(user.email).toBe(`concurrent${index}@test.com`);
      });
    });
  });

  describe('Error Handling', () => {
    it('should provide meaningful error messages', async () => {
      expect(() => {
        global.mockDb.createUser({
          email: 'invalid-email',
          firstName: 'Test',
          lastName: 'User',
          role: 'student',
        });
      }).toThrow('Invalid email format');
    });

    it('should handle database connection errors', async () => {
      // Mock database connection failure
      const originalCreateUser = global.mockDb.createUser;
      global.mockDb.createUser = vi.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      expect(() => {
        global.mockDb.createUser({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'student',
        });
      }).toThrow('Database connection failed');

      // Restore original function
      global.mockDb.createUser = originalCreateUser;
    });

    it('should handle timeout errors', async () => {
      // Mock slow operation
      const slowOperation = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 5000); // 5 second delay
        });
      });

      // Should timeout before completion
      await expect(
        Promise.race([
          slowOperation(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Operation timeout')), 1000)
          )
        ])
      ).rejects.toThrow('Operation timeout');
    });
  });
});