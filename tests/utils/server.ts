/**
 * Test server utilities
 * Provides mock server setup for testing API endpoints
 */

import { vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

// Mock Express app and middleware
export const mockApp = {
  use: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  listen: vi.fn(),
  close: vi.fn(),
};

// Mock request object
export function createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    method: 'GET',
    url: '/',
    path: '/',
    headers: {},
    query: {},
    params: {},
    body: {},
    user: undefined,
    ip: '127.0.0.1',
    ...overrides,
  };
}

// Mock response object
export function createMockResponse(): Partial<Response> {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
  };
  
  return res;
}

// Mock next function
export const mockNext: NextFunction = vi.fn();

// Mock tRPC context
export function createMockTRPCContext(overrides: any = {}) {
  return {
    req: createMockRequest(),
    res: createMockResponse(),
    user: null,
    db: global.mockDb,
    ...overrides,
  };
}

// Mock tRPC procedure
export function createMockTRPCProcedure() {
  return {
    input: vi.fn().mockReturnThis(),
    query: vi.fn().mockReturnThis(),
    mutation: vi.fn().mockReturnThis(),
    use: vi.fn().mockReturnThis(),
  };
}

/**
 * Setup test server
 * Initializes mock server for testing
 */
export async function setupTestServer(): Promise<void> {
  console.log('Setting up test server...');
  
  // Mock tRPC
  vi.doMock('@trpc/server', () => ({
    initTRPC: vi.fn().mockReturnValue({
      router: vi.fn(),
      procedure: createMockTRPCProcedure(),
      middleware: vi.fn(),
      createCallerFactory: vi.fn(),
    }),
    TRPCError: class TRPCError extends Error {
      constructor(public opts: { code: string; message: string }) {
        super(opts.message);
        this.name = 'TRPCError';
      }
    },
  }));
  
  // Mock Express
  vi.doMock('express', () => ({
    default: vi.fn(() => mockApp),
    Router: vi.fn(() => ({
      use: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
    json: vi.fn(),
    urlencoded: vi.fn(),
    static: vi.fn(),
  }));
  
  // Mock middleware
  vi.doMock('cors', () => vi.fn(() => vi.fn()));
  vi.doMock('helmet', () => vi.fn(() => vi.fn()));
  vi.doMock('express-rate-limit', () => vi.fn(() => vi.fn()));
  
  console.log('✅ Test server setup complete');
}

/**
 * Mock HTTP request for testing
 */
export async function mockHTTPRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  options: {
    body?: any;
    headers?: Record<string, string>;
    query?: Record<string, string>;
    user?: any;
  } = {}
): Promise<{
  status: number;
  data: any;
  headers: Record<string, string>;
}> {
  // Simulate HTTP request processing
  await new Promise(resolve => setTimeout(resolve, 10));
  
  // Mock successful response
  return {
    status: 200,
    data: { success: true, message: 'Mock response' },
    headers: { 'content-type': 'application/json' },
  };
}

/**
 * Mock WebSocket connection for testing
 */
export function createMockWebSocket() {
  return {
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1, // OPEN
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  };
}

/**
 * Mock authentication middleware
 */
export function mockAuthMiddleware(user: any = null) {
  return vi.fn((req: any, res: any, next: any) => {
    req.user = user;
    next();
  });
}

/**
 * Mock validation middleware
 */
export function mockValidationMiddleware(isValid: boolean = true) {
  return vi.fn((req: any, res: any, next: any) => {
    if (isValid) {
      next();
    } else {
      res.status(400).json({ error: 'Validation failed' });
    }
  });
}

/**
 * Mock rate limiting middleware
 */
export function mockRateLimitMiddleware(isAllowed: boolean = true) {
  return vi.fn((req: any, res: any, next: any) => {
    if (isAllowed) {
      next();
    } else {
      res.status(429).json({ error: 'Rate limit exceeded' });
    }
  });
}

/**
 * Create mock tRPC router
 */
export function createMockTRPCRouter(procedures: Record<string, any> = {}) {
  return {
    ...procedures,
    createCaller: vi.fn(() => procedures),
  };
}

/**
 * Mock tRPC client
 */
export function createMockTRPCClient() {
  return {
    ai: {
      chat: vi.fn(),
      getModels: vi.fn(),
      getUsage: vi.fn(),
    },
    dashboard: {
      getKPIs: vi.fn(),
      getCharts: vi.fn(),
    },
    crm: {
      getContacts: vi.fn(),
      createContact: vi.fn(),
    },
    schoolHub: {
      getCourses: vi.fn(),
      createCourse: vi.fn(),
    },
  };
}