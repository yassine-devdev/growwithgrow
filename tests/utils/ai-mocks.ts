/**
 * AI Service Mocks for Testing
 * Prevents actual API calls during testing and provides predictable responses
 */

import { vi } from 'vitest';
import type { AIProvider, ChatResponse, ProviderStatus, ModelInfo } from '../../services/unifiedAIService';

// Mock responses for different scenarios
export const mockChatResponses = {
  success: {
    response: 'This is a test response from the AI service.',
    provider: 'openrouter' as AIProvider,
    model: 'gpt-3.5-turbo',
    tokensUsed: 25,
    cost: 0.0001,
    responseTime: 1500,
  },
  longResponse: {
    response: 'This is a much longer test response that simulates a detailed AI-generated answer with multiple sentences and comprehensive information about the topic at hand.',
    provider: 'openrouter' as AIProvider,
    model: 'gpt-4',
    tokensUsed: 150,
    cost: 0.003,
    responseTime: 3000,
  },
  ollamaResponse: {
    response: 'This is a response from the local Ollama service.',
    provider: 'ollama' as AIProvider,
    model: 'llama3.1:8b',
    tokensUsed: 30,
    cost: 0,
    responseTime: 2000,
  },
  geminiResponse: {
    response: 'This is a response from Google Gemini.',
    provider: 'gemini' as AIProvider,
    model: 'gemini-pro',
    tokensUsed: 28,
    cost: 0.0002,
    responseTime: 1800,
  },
};

export const mockProviderStatus: ProviderStatus[] = [
  {
    name: 'openrouter',
    displayName: 'OpenRouter',
    status: 'online',
    responseTime: 1200,
    modelCount: 50,
    lastChecked: new Date().toISOString(),
    capabilities: ['text', 'code', 'vision'],
  },
  {
    name: 'ollama',
    displayName: 'Ollama (Local)',
    status: 'online',
    responseTime: 800,
    modelCount: 3,
    lastChecked: new Date().toISOString(),
    capabilities: ['text', 'code'],
  },
  {
    name: 'gemini',
    displayName: 'Google Gemini',
    status: 'online',
    responseTime: 1500,
    modelCount: 5,
    lastChecked: new Date().toISOString(),
    capabilities: ['text', 'vision'],
  },
];

export const mockModels: ModelInfo[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openrouter',
    description: 'Fast and efficient model for general tasks',
    contextLength: 4096,
    inputPricing: 0.0015,
    outputPricing: 0.002,
    capabilities: ['text', 'code'],
    isRecommended: true,
    useCase: ['general', 'fast'],
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openrouter',
    description: 'Most capable model for complex tasks',
    contextLength: 8192,
    inputPricing: 0.03,
    outputPricing: 0.06,
    capabilities: ['text', 'code', 'analysis'],
    isRecommended: false,
    useCase: ['analysis', 'creative'],
  },
  {
    id: 'llama3.1:8b',
    name: 'Llama 3.1 8B',
    provider: 'ollama',
    description: 'Local model for privacy-focused applications',
    contextLength: 4096,
    inputPricing: 0,
    outputPricing: 0,
    capabilities: ['text', 'code'],
    isRecommended: true,
    useCase: ['cost-effective', 'privacy'],
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'gemini',
    description: 'Google\'s advanced language model',
    contextLength: 32768,
    inputPricing: 0.00025,
    outputPricing: 0.0005,
    capabilities: ['text', 'vision'],
    isRecommended: true,
    useCase: ['general', 'vision'],
  },
];

export const mockUsageStats = {
  totalRequests: 150,
  totalTokens: 45000,
  totalCost: 2.35,
  byProvider: [
    {
      provider: 'openrouter' as AIProvider,
      requests: 100,
      tokens: 30000,
      cost: 2.0,
    },
    {
      provider: 'ollama' as AIProvider,
      requests: 30,
      tokens: 10000,
      cost: 0,
    },
    {
      provider: 'gemini' as AIProvider,
      requests: 20,
      tokens: 5000,
      cost: 0.35,
    },
  ],
  byDay: [
    {
      date: '2024-01-01',
      requests: 50,
      tokens: 15000,
      cost: 1.0,
    },
    {
      date: '2024-01-02',
      requests: 60,
      tokens: 18000,
      cost: 1.2,
    },
    {
      date: '2024-01-03',
      requests: 40,
      tokens: 12000,
      cost: 0.15,
    },
  ],
};

/**
 * Mock AI providers to prevent actual API calls during testing
 */
export function mockAIProviders(): void {
  console.log('🤖 Setting up AI provider mocks...');
  
  // Mock fetch for API calls
  global.fetch = vi.fn();
  
  // Mock UnifiedAIService
  vi.doMock('../../services/unifiedAIService', () => ({
    UnifiedAIService: vi.fn().mockImplementation(() => ({
      generateText: vi.fn().mockImplementation(async (prompt: string, options: any = {}) => {
        // Simulate different responses based on provider
        const provider = options.provider || 'openrouter';
        const delay = provider === 'ollama' ? 800 : 1500;
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Return appropriate mock response
        switch (provider) {
          case 'ollama':
            return mockChatResponses.ollamaResponse;
          case 'gemini':
            return mockChatResponses.geminiResponse;
          default:
            return mockChatResponses.success;
        }
      }),
      
      smartGenerateText: vi.fn().mockImplementation(async (prompt: string, useCase: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockChatResponses.success;
      }),
      
      getAvailableModels: vi.fn().mockResolvedValue(mockModels),
      
      getProviderStatus: vi.fn().mockResolvedValue(mockProviderStatus),
      
      getUsageStats: vi.fn().mockResolvedValue(mockUsageStats),
      
      testProvider: vi.fn().mockImplementation(async (provider: AIProvider) => {
        // Simulate different success rates
        const successRates = {
          openrouter: 0.95,
          ollama: 0.9,
          gemini: 0.98,
        };
        return Math.random() < successRates[provider];
      }),
      
      getRecommendedProvider: vi.fn().mockResolvedValue('openrouter'),
      
      estimateCost: vi.fn().mockImplementation((provider: AIProvider, model: string, tokens: number) => {
        const rates = {
          openrouter: 0.002,
          ollama: 0,
          gemini: 0.0005,
        };
        return tokens * (rates[provider] || 0.001);
      }),
    })),
    
    unifiedAIService: {
      generateText: vi.fn().mockResolvedValue(mockChatResponses.success),
      smartGenerateText: vi.fn().mockResolvedValue(mockChatResponses.success),
      getAvailableModels: vi.fn().mockResolvedValue(mockModels),
      getProviderStatus: vi.fn().mockResolvedValue(mockProviderStatus),
      getUsageStats: vi.fn().mockResolvedValue(mockUsageStats),
      testProvider: vi.fn().mockResolvedValue(true),
      getRecommendedProvider: vi.fn().mockResolvedValue('openrouter'),
      estimateCost: vi.fn().mockReturnValue(0.001),
    },
  }));
  
  // Mock legacy AI service
  vi.doMock('../../services/aiService', () => ({
    AIService: vi.fn().mockImplementation(() => ({
      chat: vi.fn().mockResolvedValue(mockChatResponses.success),
      getAvailableModels: vi.fn().mockResolvedValue(mockModels),
      getProviderStatus: vi.fn().mockResolvedValue(mockProviderStatus),
      getUsageStats: vi.fn().mockResolvedValue(mockUsageStats),
      testProvider: vi.fn().mockResolvedValue(true),
      smartChat: vi.fn().mockResolvedValue(mockChatResponses.success),
    })),
    
    aiService: {
      chat: vi.fn().mockResolvedValue(mockChatResponses.success),
      getAvailableModels: vi.fn().mockResolvedValue(mockModels),
      getProviderStatus: vi.fn().mockResolvedValue(mockProviderStatus),
      getUsageStats: vi.fn().mockResolvedValue(mockUsageStats),
      testProvider: vi.fn().mockResolvedValue(true),
      smartChat: vi.fn().mockResolvedValue(mockChatResponses.success),
    },
    
    generateText: vi.fn().mockResolvedValue('Mocked AI response'),
    generateTextWithProvider: vi.fn().mockResolvedValue('Mocked provider response'),
    smartChat: vi.fn().mockResolvedValue(mockChatResponses.success),
  }));
  
  // Mock AI provider config
  vi.doMock('../../services/aiProviderConfig', () => ({
    aiProviderConfig: {
      getProvider: vi.fn().mockReturnValue({
        name: 'openrouter',
        apiKey: 'test-key',
        isEnabled: true,
        models: mockModels.filter(m => m.provider === 'openrouter'),
      }),
      getEnabledProviders: vi.fn().mockReturnValue([
        { name: 'openrouter', isEnabled: true, models: [] },
        { name: 'ollama', isEnabled: true, models: [] },
        { name: 'gemini', isEnabled: true, models: [] },
      ]),
      updateConnectionStatus: vi.fn(),
      saveConfiguration: vi.fn(),
      getUsageStats: vi.fn().mockReturnValue([]),
      estimateCost: vi.fn().mockReturnValue(0.001),
    },
    trackUsage: vi.fn(),
  }));
  
  // Mock Ollama manager
  vi.doMock('../../services/ollamaManager', () => ({
    ollamaManager: {
      checkStatus: vi.fn().mockResolvedValue({
        isRunning: true,
        models: [
          { name: 'llama3.1:8b', size: 4700000000 },
          { name: 'qwen2.5-coder:1.5b', size: 1500000000 },
        ],
      }),
      isModelInstalled: vi.fn().mockResolvedValue(true),
    },
  }));
  
  console.log('✅ AI provider mocks setup complete');
}

/**
 * Create a mock chat response with custom parameters
 */
export function createMockChatResponse(overrides: Partial<ChatResponse> = {}): ChatResponse {
  return {
    ...mockChatResponses.success,
    ...overrides,
  };
}

/**
 * Create a mock provider status with custom parameters
 */
export function createMockProviderStatus(overrides: Partial<ProviderStatus> = {}): ProviderStatus {
  return {
    ...mockProviderStatus[0],
    ...overrides,
  };
}

/**
 * Simulate API errors for testing error handling
 */
export function mockAPIError(provider: AIProvider, errorType: 'network' | 'auth' | 'quota' | 'server' = 'network'): void {
  const errorMessages = {
    network: 'Network error: Unable to connect to AI provider',
    auth: 'Authentication error: Invalid API key',
    quota: 'Quota exceeded: API rate limit reached',
    server: 'Server error: Internal server error',
  };
  
  const mockFetch = global.fetch as any;
  mockFetch.mockRejectedValueOnce(new Error(errorMessages[errorType]));
}

/**
 * Reset all AI mocks to their default state
 */
export function resetAIMocks(): void {
  vi.clearAllMocks();
  mockAIProviders();
}

/**
 * Get mock call history for debugging
 */
export function getMockCallHistory() {
  return {
    generateTextCalls: vi.mocked(global.fetch).mock.calls,
    // Add other mock call histories as needed
  };
}