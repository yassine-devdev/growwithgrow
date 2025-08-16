/**
 * External service mocks for testing
 * Prevents calls to external APIs and services during testing
 */

import { vi } from 'vitest';

/**
 * Mock external services to prevent actual API calls
 */
export function mockExternalServices(): void {
  console.log('🌐 Setting up external service mocks...');
  
  // Mock Google Gemini AI
  vi.doMock('@google/genai', () => ({
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: vi.fn().mockReturnValue('Mocked Gemini response'),
          },
        }),
      }),
    })),
  }));
  
  // Mock Redis client
  vi.doMock('ioredis', () => ({
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
      setex: vi.fn().mockResolvedValue('OK'),
      del: vi.fn().mockResolvedValue(1),
      keys: vi.fn().mockResolvedValue([]),
      flushall: vi.fn().mockResolvedValue('OK'),
      ping: vi.fn().mockResolvedValue('PONG'),
      quit: vi.fn().mockResolvedValue('OK'),
      on: vi.fn(),
      off: vi.fn(),
    })),
  }));
  
  // Mock Winston logger
  vi.doMock('winston', () => ({
    createLogger: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    }),
    format: {
      combine: vi.fn(),
      timestamp: vi.fn(),
      errors: vi.fn(),
      json: vi.fn(),
      colorize: vi.fn(),
      simple: vi.fn(),
    },
    transports: {
      Console: vi.fn(),
      File: vi.fn(),
    },
  }));
  
  // Mock WebSocket
  vi.doMock('ws', () => ({
    WebSocketServer: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      close: vi.fn(),
      clients: new Set(),
    })),
    WebSocket: vi.fn().mockImplementation(() => ({
      send: vi.fn(),
      close: vi.fn(),
      on: vi.fn(),
      readyState: 1,
      OPEN: 1,
      CLOSED: 3,
    })),
  }));
  
  // Mock bcrypt for password hashing
  vi.doMock('bcryptjs', () => ({
    hash: vi.fn().mockResolvedValue('$2a$10$hashedpassword'),
    compare: vi.fn().mockResolvedValue(true),
    genSalt: vi.fn().mockResolvedValue('$2a$10$salt'),
  }));
  
  // Mock JWT
  vi.doMock('jsonwebtoken', () => ({
    sign: vi.fn().mockReturnValue('mock.jwt.token'),
    verify: vi.fn().mockReturnValue({
      userId: 1,
      email: 'test@example.com',
      role: 'student',
    }),
    decode: vi.fn().mockReturnValue({
      userId: 1,
      email: 'test@example.com',
      role: 'student',
    }),
  }));
  
  // Mock nanoid for ID generation
  vi.doMock('nanoid', () => ({
    nanoid: vi.fn().mockReturnValue('mock-id-12345'),
  }));
  
  // Mock file system operations
  vi.doMock('fs', () => ({
    promises: {
      readFile: vi.fn().mockResolvedValue('mock file content'),
      writeFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined),
      unlink: vi.fn().mockResolvedValue(undefined),
      stat: vi.fn().mockResolvedValue({
        isFile: () => true,
        isDirectory: () => false,
        size: 1024,
        mtime: new Date(),
      }),
    },
    readFileSync: vi.fn().mockReturnValue('mock file content'),
    writeFileSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(true),
  }));
  
  // Mock path operations
  vi.doMock('path', () => ({
    join: vi.fn((...args) => args.join('/')),
    resolve: vi.fn((...args) => '/' + args.join('/')),
    dirname: vi.fn((path) => path.split('/').slice(0, -1).join('/')),
    basename: vi.fn((path) => path.split('/').pop()),
    extname: vi.fn((path) => {
      const parts = path.split('.');
      return parts.length > 1 ? '.' + parts.pop() : '';
    }),
  }));
  
  // Mock email service (if implemented)
  global.mockEmailService = {
    sendEmail: vi.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
    sendVerificationEmail: vi.fn().mockResolvedValue(true),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
    sendWelcomeEmail: vi.fn().mockResolvedValue(true),
  };
  
  // Mock file upload service
  global.mockFileUploadService = {
    uploadFile: vi.fn().mockResolvedValue({
      url: 'https://mock-cdn.com/file.jpg',
      key: 'mock-file-key',
      size: 1024,
    }),
    deleteFile: vi.fn().mockResolvedValue(true),
    getSignedUrl: vi.fn().mockResolvedValue('https://mock-cdn.com/signed-url'),
  };
  
  // Mock payment service
  global.mockPaymentService = {
    createPaymentIntent: vi.fn().mockResolvedValue({
      id: 'pi_mock_payment_intent',
      clientSecret: 'pi_mock_secret',
      amount: 1000,
      currency: 'usd',
    }),
    confirmPayment: vi.fn().mockResolvedValue({
      status: 'succeeded',
      paymentMethod: 'card',
    }),
    refundPayment: vi.fn().mockResolvedValue({
      id: 're_mock_refund',
      amount: 1000,
      status: 'succeeded',
    }),
  };
  
  // Mock analytics service
  global.mockAnalyticsService = {
    track: vi.fn().mockResolvedValue(true),
    identify: vi.fn().mockResolvedValue(true),
    page: vi.fn().mockResolvedValue(true),
    group: vi.fn().mockResolvedValue(true),
  };
  
  console.log('✅ External service mocks setup complete');
}

/**
 * Mock environment variables for testing
 */
export function mockEnvironmentVariables(): void {
  const originalEnv = process.env;
  
  process.env = {
    ...originalEnv,
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
    REDIS_URL: 'redis://localhost:6379/1',
    JWT_SECRET: 'test-jwt-secret-key-for-testing-only',
    ENCRYPTION_KEY: 'test-encryption-key-32-chars-long',
    VITE_OPENROUTER_API_KEY: 'test-openrouter-key',
    VITE_GOOGLE_GEMINI_API_KEY: 'test-gemini-key',
    VITE_API_URL: 'http://localhost:3001',
    CORS_ORIGIN: 'http://localhost:3000',
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX_REQUESTS: '100',
  };
  
  // Restore original environment after tests
  return () => {
    process.env = originalEnv;
  };
}

/**
 * Mock network requests
 */
export function mockNetworkRequests(): void {
  // Mock successful API responses
  const mockFetch = vi.fn().mockImplementation(async (url: string, options: any = {}) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock different responses based on URL
    if (url.includes('openrouter.ai')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{
            message: { content: 'Mocked OpenRouter response' },
          }],
          usage: { total_tokens: 25 },
        }),
      };
    }
    
    if (url.includes('localhost:11434')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          response: 'Mocked Ollama response',
        }),
      };
    }
    
    // Default mock response
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      text: async () => 'Mock response',
    };
  });
  
  global.fetch = mockFetch;
}

/**
 * Reset all external mocks
 */
export function resetExternalMocks(): void {
  vi.clearAllMocks();
  mockExternalServices();
  mockNetworkRequests();
}

// Type declarations for global mocks
declare global {
  var mockEmailService: {
    sendEmail: any;
    sendVerificationEmail: any;
    sendPasswordResetEmail: any;
    sendWelcomeEmail: any;
  };
  
  var mockFileUploadService: {
    uploadFile: any;
    deleteFile: any;
    getSignedUrl: any;
  };
  
  var mockPaymentService: {
    createPaymentIntent: any;
    confirmPayment: any;
    refundPayment: any;
  };
  
  var mockAnalyticsService: {
    track: any;
    identify: any;
    page: any;
    group: any;
  };
}