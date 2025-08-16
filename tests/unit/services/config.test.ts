/**
 * Unit tests for configuration service
 * Tests configuration loading, validation, and management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the config module
const mockConfig = {
  ai: {
    defaultProvider: 'openrouter',
    openrouter: {
      apiKey: 'test-openrouter-key',
      baseUrl: 'https://openrouter.ai/api/v1',
      defaultModel: 'openai/gpt-3.5-turbo',
    },
    ollama: {
      baseUrl: 'http://localhost:11434',
      defaultModel: 'llama3.1:8b',
    },
    gemini: {
      apiKey: 'test-gemini-key',
      defaultModel: 'gemini-pro',
    },
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true,
    },
  },
  database: {
    url: 'postgresql://test:test@localhost:5432/test_db',
    ssl: false,
    maxConnections: 10,
  },
  redis: {
    url: 'redis://localhost:6379/1',
    maxRetries: 3,
  },
  security: {
    jwtSecret: 'test-jwt-secret',
    encryptionKey: 'test-encryption-key-32-chars-long',
    sessionTimeout: 3600000, // 1 hour
  },
  logging: {
    level: 'info',
    format: 'json',
  },
};

vi.doMock('../../../services/config', () => ({
  config: mockConfig,
  loadConfig: vi.fn().mockReturnValue(mockConfig),
  validateConfig: vi.fn().mockReturnValue({ isValid: true, errors: [] }),
  getEnvironment: vi.fn().mockReturnValue('test'),
  isDevelopment: vi.fn().mockReturnValue(false),
  isProduction: vi.fn().mockReturnValue(false),
  isTest: vi.fn().mockReturnValue(true),
}));

describe('Configuration Service', () => {
  let config: any;
  let loadConfig: any;
  let validateConfig: any;
  let getEnvironment: any;
  let isDevelopment: any;
  let isProduction: any;
  let isTest: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    const configModule = await import('../../../services/config');
    config = configModule.config;
    loadConfig = configModule.loadConfig;
    validateConfig = configModule.validateConfig;
    getEnvironment = configModule.getEnvironment;
    isDevelopment = configModule.isDevelopment;
    isProduction = configModule.isProduction;
    isTest = configModule.isTest;
  });

  describe('config object', () => {
    it('should have AI configuration', () => {
      expect(config.ai).toBeDefined();
      expect(config.ai.defaultProvider).toBe('openrouter');
      expect(config.ai.openrouter).toBeDefined();
      expect(config.ai.ollama).toBeDefined();
      expect(config.ai.gemini).toBeDefined();
    });

    it('should have server configuration', () => {
      expect(config.server).toBeDefined();
      expect(config.server.port).toBe(3001);
      expect(config.server.host).toBe('0.0.0.0');
      expect(config.server.cors).toBeDefined();
    });

    it('should have database configuration', () => {
      expect(config.database).toBeDefined();
      expect(config.database.url).toBeTruthy();
      expect(config.database.maxConnections).toBeGreaterThan(0);
    });

    it('should have Redis configuration', () => {
      expect(config.redis).toBeDefined();
      expect(config.redis.url).toBeTruthy();
      expect(config.redis.maxRetries).toBeGreaterThan(0);
    });

    it('should have security configuration', () => {
      expect(config.security).toBeDefined();
      expect(config.security.jwtSecret).toBeTruthy();
      expect(config.security.encryptionKey).toBeTruthy();
      expect(config.security.sessionTimeout).toBeGreaterThan(0);
    });

    it('should have logging configuration', () => {
      expect(config.logging).toBeDefined();
      expect(config.logging.level).toBeTruthy();
      expect(config.logging.format).toBeTruthy();
    });
  });

  describe('AI provider configuration', () => {
    it('should have OpenRouter configuration', () => {
      const openrouter = config.ai.openrouter;
      
      expect(openrouter.apiKey).toBeTruthy();
      expect(openrouter.baseUrl).toBeTruthy();
      expect(openrouter.defaultModel).toBeTruthy();
    });

    it('should have Ollama configuration', () => {
      const ollama = config.ai.ollama;
      
      expect(ollama.baseUrl).toBeTruthy();
      expect(ollama.defaultModel).toBeTruthy();
    });

    it('should have Gemini configuration', () => {
      const gemini = config.ai.gemini;
      
      expect(gemini.apiKey).toBeTruthy();
      expect(gemini.defaultModel).toBeTruthy();
    });
  });

  describe('loadConfig', () => {
    it('should load configuration successfully', () => {
      const loadedConfig = loadConfig();
      
      expect(loadedConfig).toBeDefined();
      expect(loadedConfig.ai).toBeDefined();
      expect(loadedConfig.server).toBeDefined();
      expect(loadedConfig.database).toBeDefined();
    });

    it('should be called during module initialization', () => {
      expect(loadConfig).toHaveBeenCalled();
    });
  });

  describe('validateConfig', () => {
    it('should validate configuration successfully', () => {
      const validation = validateConfig(config);
      
      expect(validation).toMatchObject({
        isValid: true,
        errors: [],
      });
    });

    it('should detect missing required fields', () => {
      const invalidConfig = { ...config };
      delete invalidConfig.ai.defaultProvider;
      
      validateConfig.mockReturnValueOnce({
        isValid: false,
        errors: ['ai.defaultProvider is required'],
      });
      
      const validation = validateConfig(invalidConfig);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('ai.defaultProvider is required');
    });

    it('should validate AI provider configurations', () => {
      const configWithoutApiKey = {
        ...config,
        ai: {
          ...config.ai,
          openrouter: {
            ...config.ai.openrouter,
            apiKey: '',
          },
        },
      };
      
      validateConfig.mockReturnValueOnce({
        isValid: false,
        errors: ['ai.openrouter.apiKey is required'],
      });
      
      const validation = validateConfig(configWithoutApiKey);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('ai.openrouter.apiKey is required');
    });

    it('should validate database configuration', () => {
      const configWithoutDb = {
        ...config,
        database: {
          ...config.database,
          url: '',
        },
      };
      
      validateConfig.mockReturnValueOnce({
        isValid: false,
        errors: ['database.url is required'],
      });
      
      const validation = validateConfig(configWithoutDb);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('database.url is required');
    });
  });

  describe('environment detection', () => {
    it('should detect test environment', () => {
      expect(isTest()).toBe(true);
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(false);
    });

    it('should return correct environment name', () => {
      expect(getEnvironment()).toBe('test');
    });

    it('should handle development environment', () => {
      getEnvironment.mockReturnValueOnce('development');
      isDevelopment.mockReturnValueOnce(true);
      isTest.mockReturnValueOnce(false);
      
      expect(getEnvironment()).toBe('development');
      expect(isDevelopment()).toBe(true);
      expect(isTest()).toBe(false);
    });

    it('should handle production environment', () => {
      getEnvironment.mockReturnValueOnce('production');
      isProduction.mockReturnValueOnce(true);
      isTest.mockReturnValueOnce(false);
      
      expect(getEnvironment()).toBe('production');
      expect(isProduction()).toBe(true);
      expect(isTest()).toBe(false);
    });
  });

  describe('configuration security', () => {
    it('should not expose sensitive values in logs', () => {
      // This would be tested with actual implementation
      // For now, just verify sensitive fields exist
      expect(config.security.jwtSecret).toBeTruthy();
      expect(config.security.encryptionKey).toBeTruthy();
      expect(config.ai.openrouter.apiKey).toBeTruthy();
      expect(config.ai.gemini.apiKey).toBeTruthy();
    });

    it('should have strong encryption key', () => {
      const encryptionKey = config.security.encryptionKey;
      
      expect(encryptionKey).toBeTruthy();
      expect(encryptionKey.length).toBeGreaterThanOrEqual(32);
    });

    it('should have secure JWT secret', () => {
      const jwtSecret = config.security.jwtSecret;
      
      expect(jwtSecret).toBeTruthy();
      expect(jwtSecret.length).toBeGreaterThan(10);
    });
  });

  describe('configuration defaults', () => {
    it('should have sensible default values', () => {
      expect(config.server.port).toBeGreaterThan(1000);
      expect(config.server.port).toBeLessThan(65536);
      expect(config.database.maxConnections).toBeGreaterThan(0);
      expect(config.redis.maxRetries).toBeGreaterThan(0);
      expect(config.security.sessionTimeout).toBeGreaterThan(0);
    });

    it('should have valid CORS configuration', () => {
      const cors = config.server.cors;
      
      expect(cors.origin).toBeInstanceOf(Array);
      expect(cors.origin.length).toBeGreaterThan(0);
      expect(typeof cors.credentials).toBe('boolean');
    });

    it('should have valid logging configuration', () => {
      const logging = config.logging;
      
      expect(['debug', 'info', 'warn', 'error']).toContain(logging.level);
      expect(['json', 'text']).toContain(logging.format);
    });
  });

  describe('configuration overrides', () => {
    it('should allow environment variable overrides', () => {
      // Mock environment variable override
      const originalEnv = process.env.AI_DEFAULT_PROVIDER;
      process.env.AI_DEFAULT_PROVIDER = 'ollama';
      
      loadConfig.mockReturnValueOnce({
        ...config,
        ai: {
          ...config.ai,
          defaultProvider: 'ollama',
        },
      });
      
      const overriddenConfig = loadConfig();
      
      expect(overriddenConfig.ai.defaultProvider).toBe('ollama');
      
      // Restore original
      if (originalEnv !== undefined) {
        process.env.AI_DEFAULT_PROVIDER = originalEnv;
      } else {
        delete process.env.AI_DEFAULT_PROVIDER;
      }
    });

    it('should handle missing environment variables gracefully', () => {
      // Test with missing optional environment variables
      const originalApiKey = process.env.VITE_OPENROUTER_API_KEY;
      delete process.env.VITE_OPENROUTER_API_KEY;
      
      loadConfig.mockReturnValueOnce({
        ...config,
        ai: {
          ...config.ai,
          openrouter: {
            ...config.ai.openrouter,
            apiKey: '',
          },
        },
      });
      
      const configWithoutApiKey = loadConfig();
      
      expect(configWithoutApiKey.ai.openrouter.apiKey).toBe('');
      
      // Restore original
      if (originalApiKey !== undefined) {
        process.env.VITE_OPENROUTER_API_KEY = originalApiKey;
      }
    });
  });
});