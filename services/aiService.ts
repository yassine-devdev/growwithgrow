// Legacy AI Service - now delegates to unified service
import { unifiedAIService, AIProvider, AIServiceConfig, ChatResponse, ProviderStatus, UsageStats } from './unifiedAIService';
import { config } from './config';
import { aiProviderConfig, trackUsage } from './aiProviderConfig';
import { ollamaManager } from './ollamaManager';

// Re-export types from unified service
export type { AIProvider, AIServiceConfig, ChatResponse, ProviderStatus, UsageStats } from './unifiedAIService';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ConversationSummary {
  id: number;
  title?: string;
  contextType: 'general' | 'academic' | 'administrative' | 'support';
  messageCount: number;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Default configuration
const DEFAULT_CONFIG: AIServiceConfig = {
  provider: 'openrouter',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000,
  contextType: 'general',
};

/**
 * Legacy AI Service Class - now delegates to unified service
 * Provides backward compatibility while using the new unified service
 */
export class AIService {
  private static instance: AIService;
  
  private constructor() {}
  
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Send a chat message using the specified AI provider
   */
  async chat(
    message: string, 
    options: AIServiceConfig = {}
  ): Promise<ChatResponse> {
    return await unifiedAIService.generateText(message, options);
  }

  /**
   * Continue a conversation by adding a message to an existing conversation
   */
  async continueConversation(
    conversationId: number,
    message: string,
    options: AIServiceConfig = {}
  ): Promise<ChatResponse> {
    // For now, delegate to regular chat - conversation management would be handled by tRPC
    return await this.chat(message, options);
  }

  /**
   * Get list of conversations
   */
  async getConversations(options: {
    contextType?: 'general' | 'academic' | 'administrative' | 'support';
    limit?: number;
    page?: number;
  } = {}): Promise<ConversationSummary[]> {
    // This would be implemented with tRPC backend integration
    // For now, return empty array
    return [];
  }

  /**
   * Get conversation with full message history
   */
  async getConversation(conversationId: number): Promise<{
    conversation: ConversationSummary;
    messages: ChatMessage[];
  }> {
    // This would be implemented with tRPC backend integration
    throw new Error('Conversation management not yet implemented');
  }

  /**
   * Create a new conversation
   */
  async createConversation(options: {
    title?: string;
    contextType?: 'general' | 'academic' | 'administrative' | 'support';
    schoolId?: number;
    classId?: number;
  } = {}): Promise<number> {
    // This would be implemented with tRPC backend integration
    throw new Error('Conversation management not yet implemented');
  }

  /**
   * Get available AI models from all providers
   */
  async getAvailableModels(provider?: AIProvider): Promise<Array<{
    id: string;
    name: string;
    provider: string;
    pricing?: any;
  }>> {
    const models = await unifiedAIService.getAvailableModels(provider);
    return models.map(model => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      pricing: {
        input: model.inputPricing,
        output: model.outputPricing,
      },
    }));
  }

  /**
   * Get provider status for all AI providers
   */
  async getProviderStatus(): Promise<ProviderStatus[]> {
    return await unifiedAIService.getProviderStatus();
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(options: {
    startDate?: string;
    endDate?: string;
    provider?: AIProvider;
    schoolId?: number;
  } = {}): Promise<UsageStats> {
    return await unifiedAIService.getUsageStats(options);
  }

  /**
   * Get prompts from the prompt library
   */
  async getPrompts(options: {
    category?: string;
    isSystem?: boolean;
    search?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<Array<{
    id: number;
    name: string;
    description?: string;
    promptText: string;
    category: string;
    variables?: string[];
    usageCount: number;
  }>> {
    // This would be implemented with tRPC backend integration
    return [];
  }

  /**
   * Create a new prompt in the library
   */
  async createPrompt(prompt: {
    name: string;
    description?: string;
    promptText: string;
    category: string;
    variables?: string[];
    isSystem?: boolean;
  }): Promise<number> {
    // This would be implemented with tRPC backend integration
    throw new Error('Prompt management not yet implemented');
  }

  /**
   * Test provider connectivity
   */
  async testProvider(provider: AIProvider): Promise<boolean> {
    return await unifiedAIService.testProvider(provider);
  }

  /**
   * Get recommended provider based on current status and usage
   */
  async getRecommendedProvider(): Promise<AIProvider> {
    return await unifiedAIService.getRecommendedProvider();
  }

  /**
   * Smart chat with automatic provider selection and fallback
   */
  async smartChat(
    message: string,
    options: Omit<AIServiceConfig, 'provider'> & { preferredProvider?: AIProvider } = {}
  ): Promise<ChatResponse> {
    const { preferredProvider, ...config } = options;
    
    return await unifiedAIService.smartGenerateText(
      message,
      'general',
      config.systemPrompt,
      { ...config, provider: preferredProvider }
    );
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();

// Export legacy functions for backward compatibility
export const generateText = async (
  prompt: string, 
  systemInstruction?: string, 
  providerConfig: Partial<AIServiceConfig> = {}
): Promise<string> => {
  const response = await aiService.chat(prompt, {
    ...providerConfig,
    systemPrompt: systemInstruction,
  });
  return response.response;
};

// Export provider-specific functions for direct access
export const generateTextWithProvider = async (
  prompt: string,
  provider: AIProvider,
  options: Omit<AIServiceConfig, 'provider'> = {}
): Promise<string> => {
  const response = await aiService.chat(prompt, { ...options, provider });
  return response.response;
};

// Export smart chat for automatic provider selection
export const smartChat = async (
  message: string,
  options: Omit<AIServiceConfig, 'provider'> & { preferredProvider?: AIProvider } = {}
): Promise<ChatResponse> => {
  return aiService.smartChat(message, options);
};

// Export conversation management functions
export const createConversation = (options: {
  title?: string;
  contextType?: 'general' | 'academic' | 'administrative' | 'support';
  schoolId?: number;
  classId?: number;
} = {}) => aiService.createConversation(options);

export const getConversations = (options: {
  contextType?: 'general' | 'academic' | 'administrative' | 'support';
  limit?: number;
  page?: number;
} = {}) => aiService.getConversations(options);

export const getConversation = (conversationId: number) => 
  aiService.getConversation(conversationId);

// Export provider management functions
export const getAvailableModels = (provider: AIProvider | 'all' = 'all') => 
  aiService.getAvailableModels(provider);

export const getProviderStatus = () => aiService.getProviderStatus();

export const testProvider = (provider: AIProvider) => aiService.testProvider(provider);

export const getRecommendedProvider = () => aiService.getRecommendedProvider();

// Export usage analytics functions
export const getUsageStats = (options: {
  startDate?: string;
  endDate?: string;
  provider?: AIProvider;
  schoolId?: number;
} = {}) => aiService.getUsageStats(options);

// Export prompt library functions
export const getPrompts = (options: {
  category?: string;
  isSystem?: boolean;
  search?: string;
  limit?: number;
  page?: number;
} = {}) => aiService.getPrompts(options);

export const createPrompt = (prompt: {
  name: string;
  description?: string;
  promptText: string;
  category: string;
  variables?: string[];
  isSystem?: boolean;
}) => aiService.createPrompt(prompt);

// Export the service instance as default
export default aiService;