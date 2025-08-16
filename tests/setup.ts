/**
 * Global test setup
 * Configures test environment, mocks, and utilities
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase, resetTestData } from './utils/database';
import { mockAIProviders } from './utils/ai-mocks';
import { setupTestServer } from './utils/server';
import { mockExternalServices, mockEnvironmentVariables, mockNetworkRequests } from './utils/external-mocks';

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: console.warn,
  error: console.error,
};

// Setup environment variables for testing
const restoreEnv = mockEnvironmentVariables();

// Global setup - runs once before all tests
beforeAll(async () => {
  console.log('🚀 Setting up test environment...');
  
  // Setup test database
  await setupTestDatabase();
  
  // Mock AI providers to prevent actual API calls
  mockAIProviders();
  
  // Mock external services
  mockExternalServices();
  
  // Mock network requests
  mockNetworkRequests();
  
  // Setup test server
  await setupTestServer();
  
  console.log('✅ Test environment ready');
});

// Global cleanup - runs once after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  
  // Cleanup test database
  await cleanupTestDatabase();
  
  // Restore environment variables
  restoreEnv();
  
  // Restore all mocks
  vi.restoreAllMocks();
  
  console.log('✅ Test environment cleaned up');
});

// Setup before each test
beforeEach(async () => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset database to clean state
  await resetTestData();
});

// Cleanup after each test
afterEach(async () => {
  // Additional cleanup if needed
});

// Global test utilities
declare global {
  namespace Vi {
    interface AsserterContext {
      toBeValidUUID(): void;
      toBeValidEmail(): void;
      toBeValidDate(): void;
      toHaveValidationError(field: string): void;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    return {
      pass,
      message: () => pass 
        ? `Expected ${received} not to be a valid UUID`
        : `Expected ${received} to be a valid UUID`
    };
  },
  
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      pass,
      message: () => pass
        ? `Expected ${received} not to be a valid email`
        : `Expected ${received} to be a valid email`
    };
  },
  
  toBeValidDate(received: any) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    
    return {
      pass,
      message: () => pass
        ? `Expected ${received} not to be a valid date`
        : `Expected ${received} to be a valid date`
    };
  },
  
  toHaveValidationError(received: any, field: string) {
    const hasError = received?.validationErrors?.some((error: any) => 
      error.field === field || error.path?.includes(field)
    );
    
    return {
      pass: hasError,
      message: () => hasError
        ? `Expected not to have validation error for field ${field}`
        : `Expected to have validation error for field ${field}`
    };
  }
});

export {};