/**
 * Database utilities for testing
 * Provides setup, teardown, and data management for tests
 */

import { vi } from 'vitest';

// Mock database connection for testing
let mockDatabase: any = null;

export interface TestUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'student' | 'teacher' | 'admin';
  isActive: boolean;
  createdAt: Date;
}

export interface TestSchool {
  id: number;
  name: string;
  type: 'elementary' | 'middle' | 'high' | 'university';
  isActive: boolean;
  createdAt: Date;
}

// Test data fixtures
export const testUsers: TestUser[] = [
  {
    id: 1,
    email: 'student@test.com',
    firstName: 'Test',
    lastName: 'Student',
    role: 'student',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    email: 'teacher@test.com',
    firstName: 'Test',
    lastName: 'Teacher',
    role: 'teacher',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 3,
    email: 'admin@test.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

export const testSchools: TestSchool[] = [
  {
    id: 1,
    name: 'Test Elementary School',
    type: 'elementary',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'Test High School',
    type: 'high',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

/**
 * Setup test database
 * Creates in-memory database for testing
 */
export async function setupTestDatabase(): Promise<void> {
  console.log('Setting up test database...');
  
  // Mock database implementation
  mockDatabase = {
    users: new Map(testUsers.map(user => [user.id, { ...user }])),
    schools: new Map(testSchools.map(school => [school.id, { ...school }])),
    conversations: new Map(),
    messages: new Map(),
    aiUsage: new Map(),
    prompts: new Map(),
  };
  
  // Mock database operations
  global.mockDb = {
    // User operations
    findUserById: vi.fn((id: number) => mockDatabase.users.get(id) || null),
    findUserByEmail: vi.fn((email: string) => {
      for (const user of mockDatabase.users.values()) {
        if (user.email === email) return user;
      }
      return null;
    }),
    createUser: vi.fn((userData: Partial<TestUser>) => {
      const id = Math.max(...Array.from(mockDatabase.users.keys())) + 1;
      const user = {
        id,
        ...userData,
        createdAt: new Date(),
      } as TestUser;
      mockDatabase.users.set(id, user);
      return user;
    }),
    updateUser: vi.fn((id: number, updates: Partial<TestUser>) => {
      const user = mockDatabase.users.get(id);
      if (!user) return null;
      const updated = { ...user, ...updates };
      mockDatabase.users.set(id, updated);
      return updated;
    }),
    deleteUser: vi.fn((id: number) => {
      return mockDatabase.users.delete(id);
    }),
    
    // School operations
    findSchoolById: vi.fn((id: number) => mockDatabase.schools.get(id) || null),
    createSchool: vi.fn((schoolData: Partial<TestSchool>) => {
      const id = Math.max(...Array.from(mockDatabase.schools.keys())) + 1;
      const school = {
        id,
        ...schoolData,
        createdAt: new Date(),
      } as TestSchool;
      mockDatabase.schools.set(id, school);
      return school;
    }),
    
    // AI Usage operations
    createAIUsage: vi.fn((usageData: any) => {
      const id = Math.max(0, ...Array.from(mockDatabase.aiUsage.keys())) + 1;
      const usage = { id, ...usageData, createdAt: new Date() };
      mockDatabase.aiUsage.set(id, usage);
      return usage;
    }),
    getAIUsageByUser: vi.fn((userId: number) => {
      return Array.from(mockDatabase.aiUsage.values()).filter(
        (usage: any) => usage.userId === userId
      );
    }),
    
    // Transaction support
    transaction: vi.fn(async (callback: Function) => {
      return await callback(global.mockDb);
    }),
  };
  
  console.log('✅ Test database setup complete');
}

/**
 * Cleanup test database
 * Removes all test data and connections
 */
export async function cleanupTestDatabase(): Promise<void> {
  console.log('Cleaning up test database...');
  
  if (mockDatabase) {
    mockDatabase.users.clear();
    mockDatabase.schools.clear();
    mockDatabase.conversations.clear();
    mockDatabase.messages.clear();
    mockDatabase.aiUsage.clear();
    mockDatabase.prompts.clear();
  }
  
  // Clear global mocks
  if (global.mockDb) {
    delete global.mockDb;
  }
  
  mockDatabase = null;
  console.log('✅ Test database cleanup complete');
}

/**
 * Reset test data to initial state
 * Useful for running between tests
 */
export async function resetTestData(): Promise<void> {
  if (!mockDatabase) return;
  
  // Reset to initial test data
  mockDatabase.users.clear();
  mockDatabase.schools.clear();
  mockDatabase.conversations.clear();
  mockDatabase.messages.clear();
  mockDatabase.aiUsage.clear();
  mockDatabase.prompts.clear();
  
  // Restore initial data
  testUsers.forEach(user => mockDatabase.users.set(user.id, { ...user }));
  testSchools.forEach(school => mockDatabase.schools.set(school.id, { ...school }));
}

/**
 * Create test user with specific attributes
 */
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const defaultUser: TestUser = {
    id: Math.floor(Math.random() * 10000),
    email: `test${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    role: 'student',
    isActive: true,
    createdAt: new Date(),
  };
  
  return { ...defaultUser, ...overrides };
}

/**
 * Create test school with specific attributes
 */
export function createTestSchool(overrides: Partial<TestSchool> = {}): TestSchool {
  const defaultSchool: TestSchool = {
    id: Math.floor(Math.random() * 10000),
    name: `Test School ${Date.now()}`,
    type: 'elementary',
    isActive: true,
    createdAt: new Date(),
  };
  
  return { ...defaultSchool, ...overrides };
}

/**
 * Get current database state for debugging
 */
export function getDatabaseState() {
  if (!mockDatabase) return null;
  
  return {
    users: Array.from(mockDatabase.users.values()),
    schools: Array.from(mockDatabase.schools.values()),
    conversations: Array.from(mockDatabase.conversations.values()),
    messages: Array.from(mockDatabase.messages.values()),
    aiUsage: Array.from(mockDatabase.aiUsage.values()),
    prompts: Array.from(mockDatabase.prompts.values()),
  };
}

// Type declarations for global mocks
declare global {
  var mockDb: {
    findUserById: any;
    findUserByEmail: any;
    createUser: any;
    updateUser: any;
    deleteUser: any;
    findSchoolById: any;
    createSchool: any;
    createAIUsage: any;
    getAIUsageByUser: any;
    transaction: any;
  };
}