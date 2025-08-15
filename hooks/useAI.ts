import { useState, useCallback, useEffect, useRef } from 'react';
import {
  unifiedAIService,
  AIProvider,
  AIServiceConfig,
  ChatResponse,
  ProviderStatus,
  UsageStats,
  ModelInfo
} from '../services/unifiedAIService';

export interface UseAIOptions {
  defaultProvider?: AIProvider;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  contextType?: 'general' | 'academic' | 'administrative' | 'support';
  conversationId?: number;
}

export interface UseAIReturn {
  // State
  isLoading: boolean;
  error: string | null;
  response: ChatResponse | null;
  providers: ProviderStatus[];
  models: ModelInfo[];
  usageStats: UsageStats | null;
  isInitialized: boolean;
  lastRequestTime: number | null;

  // Actions
  generateText: (prompt: string, systemInstruction?: string, config?: Partial<AIServiceConfig>) => Promise<ChatResponse>;
  smartGenerateText: (prompt: string, useCase?: string, systemInstruction?: string, config?: Partial<AIServiceConfig>) => Promise<ChatResponse>;
  clearError: () => void;
  clearResponse: () => void;
  refreshProviders: () => Promise<void>;
  refreshModels: (provider?: AIProvider) => Promise<void>;
  refreshUsageStats: (startDate?: string, endDate?: string, provider?: AIProvider) => Promise<void>;
  testProvider: (provider: AIProvider) => Promise<boolean>;

  // Conversation management (when tRPC is available)
  createConversation: (title?: string, contextType?: string) => Promise<number | null>;
  continueConversation: (conversationId: number, message: string, config?: Partial<AIServiceConfig>) => Promise<ChatResponse>;
  getConversations: () => Promise<any[]>;

  // Utilities
  getRecommendedProvider: (useCase: string) => Promise<AIProvider>;
  getRecommendedModels: () => Record<AIProvider, Record<string, string>>;
  estimateCost: (provider: AIProvider, model: string, inputTokens: number, outputTokens?: number) => number;

  // Advanced features
  retryLastRequest: () => Promise<ChatResponse | null>;
  cancelRequest: () => void;
}

export const useAI = (options: UseAIOptions = {}): UseAIReturn => {
  const {
    defaultProvider = 'openrouter',
    defaultModel,
    defaultTemperature = 0.7,
    defaultMaxTokens = 2000,
    contextType = 'general',
    conversationId,
  } = options;

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);

  // Refs for request management
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<{
    prompt: string;
    systemInstruction?: string;
    config?: Partial<AIServiceConfig>;
  } | null>(null);

  // Initialize the hook
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Generate text function with enhanced error handling and request management
  const generateText = useCallback(async (
    prompt: string,
    systemInstruction?: string,
    config: Partial<AIServiceConfig> = {}
  ): Promise<ChatResponse> => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setLastRequestTime(Date.now());

    // Store request for retry functionality
    lastRequestRef.current = { prompt, systemInstruction, config };

    try {
      const finalConfig: AIServiceConfig = {
        provider: defaultProvider,
        model: defaultModel,
        temperature: defaultTemperature,
        maxTokens: defaultMaxTokens,
        contextType,
        systemPrompt: systemInstruction,
        ...config,
      };

      // Use unified service directly
      const result = await unifiedAIService.generateText(prompt, finalConfig);
      setResponse(result);
      return result;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }

      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);

      // Log error for debugging
      console.error('AI generation failed:', {
        error: err,
        prompt: prompt.substring(0, 100) + '...',
        config,
      });

      throw err;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [
    defaultProvider,
    defaultModel,
    defaultTemperature,
    defaultMaxTokens,
    contextType,
    conversationId,
  ]);

  // Smart generate text with use case optimization
  const smartGenerateText = useCallback(async (
    prompt: string,
    useCase: string = 'general',
    systemInstruction?: string,
    config: Partial<AIServiceConfig> = {}
  ): Promise<ChatResponse> => {
    setIsLoading(true);
    setError(null);
    setLastRequestTime(Date.now());

    try {
      const result = await unifiedAIService.smartGenerateText(
        prompt,
        useCase as any,
        systemInstruction,
        config
      );
      setResponse(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh providers
  const refreshProviders = useCallback(async () => {
    try {
      const result = await unifiedAIService.getProviderStatus();
      setProviders(result);
    } catch (err) {
      console.error('Error refreshing providers:', err);
    }
  }, []);

  // Refresh models
  const refreshModels = useCallback(async (provider?: AIProvider) => {
    try {
      const result = await unifiedAIService.getAvailableModels(provider);
      setModels(result);
    } catch (err) {
      console.error('Error refreshing models:', err);
    }
  }, []);

  // Refresh usage stats
  const refreshUsageStats = useCallback(async (
    startDate?: string,
    endDate?: string,
    provider?: AIProvider
  ) => {
    try {
      const result = await unifiedAIService.getUsageStats({ startDate, endDate, provider });
      setUsageStats(result);
    } catch (err) {
      console.error('Error refreshing usage stats:', err);
    }
  }, []);

  // Clear functions
  const clearError = useCallback(() => setError(null), []);
  const clearResponse = useCallback(() => setResponse(null), []);

  // Utility functions
  const getRecommendedProvider = useCallback(async (useCase: string): Promise<AIProvider> => {
    return await unifiedAIService.getRecommendedProvider(useCase);
  }, []);

  const getRecommendedModels = useCallback(() => {
    return unifiedAIService.getRecommendedModels();
  }, []);

  const estimateCost = useCallback((provider: AIProvider, model: string, inputTokens: number, outputTokens?: number): number => {
    return unifiedAIService.estimateCost(provider, model, inputTokens, outputTokens);
  }, []);

  // Test provider function
  const testProvider = useCallback(async (provider: AIProvider): Promise<boolean> => {
    try {
      return await unifiedAIService.testProvider(provider);
    } catch (err) {
      console.error('Error testing provider:', err);
      return false;
    }
  }, []);

  // Conversation management functions (placeholder for tRPC integration)
  const createConversation = useCallback(async (title?: string, contextType?: string): Promise<number | null> => {
    // This would be implemented with tRPC backend integration
    console.warn('Conversation management not yet implemented');
    return null;
  }, []);

  const continueConversation = useCallback(async (
    conversationId: number,
    message: string,
    config?: Partial<AIServiceConfig>
  ): Promise<ChatResponse> => {
    // For now, just use regular generateText
    return await generateText(message, undefined, config);
  }, [generateText]);

  const getConversations = useCallback(async (): Promise<any[]> => {
    // This would be implemented with tRPC backend integration
    console.warn('Conversation management not yet implemented');
    return [];
  }, []);

  // Advanced features
  const retryLastRequest = useCallback(async (): Promise<ChatResponse | null> => {
    if (!lastRequestRef.current) {
      throw new Error('No previous request to retry');
    }
    
    const { prompt, systemInstruction, config } = lastRequestRef.current;
    return await generateText(prompt, systemInstruction, config);
  }, [generateText]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Auto-load initial data
  useEffect(() => {
    refreshProviders();
    refreshModels();
  }, [refreshProviders, refreshModels]);

  return {
    // State
    isLoading,
    error,
    response,
    providers,
    models,
    usageStats,
    isInitialized,
    lastRequestTime,

    // Actions
    generateText,
    smartGenerateText,
    clearError,
    clearResponse,
    refreshProviders,
    refreshModels,
    refreshUsageStats,
    testProvider,

    // Conversation management
    createConversation,
    continueConversation,
    getConversations,

    // Utilities
    getRecommendedProvider,
    getRecommendedModels,
    estimateCost,

    // Advanced features
    retryLastRequest,
    cancelRequest,
  };
};

// Specialized hooks for different use cases
export const useAIChat = (conversationId?: number) => {
  return useAI({
    defaultProvider: 'openrouter',
    defaultModel: 'openai/gpt-3.5-turbo',
    contextType: 'general',
    conversationId,
  });
};

export const useAIAcademic = (conversationId?: number) => {
  return useAI({
    defaultProvider: 'gemini',
    defaultModel: 'gemini-pro',
    contextType: 'academic',
    conversationId,
  });
};

export const useAICoding = () => {
  return useAI({
    defaultProvider: 'openrouter',
    defaultModel: 'openai/gpt-4',
    contextType: 'general',
    defaultTemperature: 0.3,
  });
};

export const useAIFast = () => {
  return useAI({
    defaultProvider: 'ollama',
    defaultModel: 'phi3',
    contextType: 'general',
    defaultMaxTokens: 1000,
  });
};

export const useAICostEffective = () => {
  return useAI({
    defaultProvider: 'ollama',
    defaultModel: 'llama3.2:1b',
    contextType: 'general',
  });
};

export const useAICreative = () => {
  return useAI({
    defaultProvider: 'openrouter',
    defaultModel: 'anthropic/claude-3-sonnet',
    contextType: 'general',
    defaultTemperature: 0.9,
  });
};