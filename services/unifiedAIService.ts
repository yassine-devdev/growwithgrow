// Unified AI Service Interface for Multiple Providers
import { config } from './config';
import { aiProviderConfig, trackUsage, ProviderConfig } from './aiProviderConfig';
import { ollamaManager } from './ollamaManager';
import { GoogleGenAI } from "@google/genai";

export type AIProvider = 'openrouter' | 'ollama' | 'gemini';

export interface AIServiceConfig {
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  contextType?: 'general' | 'academic' | 'administrative' | 'support';
  stream?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  response: string;
  provider: AIProvider;
  model: string;
  tokensUsed: number;
  cost: number;
  conversationId?: number;
  messageId?: number;
  responseTime: number;
}

export interface ProviderStatus {
  name: string;
  displayName: string;
  status: 'online' | 'offline' | 'error';
  responseTime: number;
  modelCount: number;
  lastChecked: string;
  capabilities: string[];
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byProvider: Array<{
    provider: AIProvider;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  byDay: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  contextLength: number;
  inputPricing: number;
  outputPricing: number;
  capabilities: string[];
  isRecommended?: boolean;
  useCase?: string[];
}

/**
 * Unified AI Service that manages multiple AI providers
 * Provides fallback mechanisms, cost tracking, and provider selection
 */
export class UnifiedAIService {
  private static instance: UnifiedAIService;
  private geminiClient: GoogleGenAI | null = null;
  private fallbackChain: AIProvider[] = ['openrouter', 'ollama', 'gemini'];
  
  private constructor() {
    this.initializeProviders();
  }
  
  static getInstance(): UnifiedAIService {
    if (!UnifiedAIService.instance) {
      UnifiedAIService.instance = new UnifiedAIService();
    }
    return UnifiedAIService.instance;
  }

  private initializeProviders(): void {
    // Initialize Gemini client if API key is available
    if (config.ai.gemini.apiKey) {
      this.geminiClient = new GoogleGenAI({ apiKey: config.ai.gemini.apiKey });
    }
    
    // Load provider configurations
    aiProviderConfig.loadConfiguration();
  }

  /**
   * Generate text using the specified provider with fallback support
   */
  async generateText(
    prompt: string,
    options: AIServiceConfig = {}
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    const config = this.getDefaultConfig(options);
    
    // Try primary provider first
    try {
      const response = await this.callProvider(config.provider!, prompt, config);
      const responseTime = Date.now() - startTime;
      
      // Track usage
      trackUsage(config.provider!, response.tokensUsed, response.cost);
      
      return {
        ...response,
        responseTime,
      };
    } catch (error) {
      console.warn(`Primary provider ${config.provider} failed:`, error);
      
      // Try fallback providers
      return await this.tryFallbackProviders(prompt, config, startTime, config.provider!);
    }
  }

  /**
   * Smart text generation with automatic provider selection based on use case
   */
  async smartGenerateText(
    prompt: string,
    useCase: 'general' | 'creative' | 'coding' | 'analysis' | 'fast' | 'cost-effective' = 'general',
    systemPrompt?: string,
    options: Partial<AIServiceConfig> = {}
  ): Promise<ChatResponse> {
    const recommendedProvider = this.getRecommendedProviderForUseCase(useCase);
    const recommendedModel = this.getRecommendedModelForUseCase(recommendedProvider, useCase);
    
    return await this.generateText(prompt, {
      ...options,
      provider: recommendedProvider,
      model: recommendedModel,
      systemPrompt,
    });
  }

  /**
   * Get available models from all or specific providers
   */
  async getAvailableModels(provider?: AIProvider): Promise<ModelInfo[]> {
    const models: ModelInfo[] = [];
    
    if (provider) {
      const providerConfig = aiProviderConfig.getProvider(provider);
      if (providerConfig) {
        models.push(...this.convertToModelInfo(providerConfig));
      }
    } else {
      const enabledProviders = aiProviderConfig.getEnabledProviders();
      for (const providerConfig of enabledProviders) {
        models.push(...this.convertToModelInfo(providerConfig));
      }
    }
    
    // For Ollama, get live model list if available
    if (!provider || provider === 'ollama') {
      try {
        const ollamaStatus = await ollamaManager.checkStatus();
        if (ollamaStatus.isRunning) {
          const ollamaModels = ollamaStatus.models.map(model => ({
            id: model.name,
            name: model.name,
            provider: 'ollama' as AIProvider,
            description: `Local Ollama model (${this.formatBytes(model.size)})`,
            contextLength: 4096, // Default, could be model-specific
            inputPricing: 0,
            outputPricing: 0,
            capabilities: ['text', 'code'],
            isRecommended: false,
          }));
          
          // Replace static Ollama models with live ones
          const nonOllamaModels = models.filter(m => m.provider !== 'ollama');
          models.splice(0, models.length, ...nonOllamaModels, ...ollamaModels);
        }
      } catch (error) {
        console.warn('Failed to get live Ollama models:', error);
      }
    }
    
    return models;
  }

  /**
   * Get provider status for all enabled providers
   */
  async getProviderStatus(): Promise<ProviderStatus[]> {
    const providers = aiProviderConfig.getEnabledProviders();
    const statusPromises = providers.map(async (provider) => {
      try {
        const startTime = Date.now();
        let status: 'online' | 'offline' | 'error' = 'offline';
        let modelCount = provider.models.length;
        
        if (provider.name === 'ollama') {
          // Check Ollama status
          const ollamaStatus = await ollamaManager.checkStatus();
          status = ollamaStatus.isRunning ? 'online' : 'offline';
          modelCount = ollamaStatus.models.length;
        } else if (provider.name === 'openrouter' && provider.apiKey) {
          // Test OpenRouter with a simple request
          status = await this.testOpenRouterConnection(provider.apiKey) ? 'online' : 'error';
        } else if (provider.name === 'gemini' && provider.apiKey) {
          // Test Gemini connection
          status = await this.testGeminiConnection() ? 'online' : 'error';
        } else {
          status = provider.apiKey ? 'online' : 'offline';
        }
        
        const responseTime = Date.now() - startTime;
        
        // Update provider status
        aiProviderConfig.updateConnectionStatus(provider.name, status, responseTime);
        
        return {
          name: provider.name,
          displayName: provider.displayName,
          status,
          responseTime,
          modelCount,
          lastChecked: new Date().toISOString(),
          capabilities: Object.keys(provider.capabilities).filter(
            key => provider.capabilities[key as keyof typeof provider.capabilities]
          ),
        };
      } catch (error) {
        aiProviderConfig.updateConnectionStatus(provider.name, 'error');
        return {
          name: provider.name,
          displayName: provider.displayName,
          status: 'error' as const,
          responseTime: 0,
          modelCount: 0,
          lastChecked: new Date().toISOString(),
          capabilities: [],
        };
      }
    });
    
    const results = await Promise.all(statusPromises);
    
    // Save updated configuration
    aiProviderConfig.saveConfiguration();
    
    return results;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(options: {
    startDate?: string;
    endDate?: string;
    provider?: AIProvider;
  } = {}): Promise<UsageStats> {
    const usageData = aiProviderConfig.getUsageStats(options.provider);
    
    const totalRequests = usageData.reduce((sum, u) => sum + u.totalRequests, 0);
    const totalTokens = usageData.reduce((sum, u) => sum + u.totalTokens, 0);
    const totalCost = usageData.reduce((sum, u) => sum + u.totalCost, 0);
    
    const byProvider = usageData.map(u => ({
      provider: u.provider,
      requests: u.totalRequests,
      tokens: u.totalTokens,
      cost: u.totalCost,
    }));
    
    // Aggregate daily usage across all providers
    const dailyUsageMap = new Map<string, { requests: number; tokens: number; cost: number }>();
    
    usageData.forEach(usage => {
      usage.dailyUsage.forEach(day => {
        const existing = dailyUsageMap.get(day.date) || { requests: 0, tokens: 0, cost: 0 };
        dailyUsageMap.set(day.date, {
          requests: existing.requests + day.requests,
          tokens: existing.tokens + day.tokens,
          cost: existing.cost + day.cost,
        });
      });
    });
    
    const byDay = Array.from(dailyUsageMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      totalRequests,
      totalTokens,
      totalCost,
      byProvider,
      byDay,
    };
  }

  /**
   * Test provider connectivity
   */
  async testProvider(provider: AIProvider): Promise<boolean> {
    try {
      const response = await this.generateText('Hello, this is a connectivity test.', {
        provider,
        maxTokens: 50,
      });
      console.log(`✅ Provider ${provider} test successful`);
      return !!response.response;
    } catch (error) {
      console.error(`❌ Provider ${provider} test failed:`, error);
      
      // Provide specific error messages for different providers
      if (provider === 'ollama') {
        console.error('💡 Ollama troubleshooting:');
        console.error('   1. Make sure Ollama is installed and running');
        console.error('   2. Install a model: ollama pull llama3.2');
        console.error('   3. Check if Ollama is accessible at http://localhost:11434');
      } else if (provider === 'openrouter') {
        console.error('💡 OpenRouter troubleshooting:');
        console.error('   1. Check your VITE_OPENROUTER_API_KEY environment variable');
        console.error('   2. Verify your API key is valid at openrouter.ai');
      } else if (provider === 'gemini') {
        console.error('💡 Gemini troubleshooting:');
        console.error('   1. Check your VITE_GOOGLE_GEMINI_API_KEY environment variable');
        console.error('   2. Verify your API key is valid at Google AI Studio');
      }
      
      return false;
    }
  }

  /**
   * Get recommended provider based on current status and use case
   */
  async getRecommendedProvider(useCase: string = 'general'): Promise<AIProvider> {
    const providers = await this.getProviderStatus();
    const onlineProviders = providers.filter(p => p.status === 'online');
    
    if (onlineProviders.length === 0) {
      console.warn('No AI providers are online. Check your API keys and Ollama installation.');
      return this.fallbackChain[0]; // Return first fallback if none are online
    }
    
    // Use case-based provider selection
    const useCasePreferences: Record<string, AIProvider[]> = {
      'cost-effective': ['ollama', 'gemini', 'openrouter'],
      'fast': ['ollama', 'gemini', 'openrouter'],
      'creative': ['openrouter', 'gemini', 'ollama'],
      'coding': ['openrouter', 'ollama', 'gemini'],
      'analysis': ['openrouter', 'gemini', 'ollama'],
      'general': ['openrouter', 'ollama', 'gemini'],
    };
    
    const preferences = useCasePreferences[useCase] || useCasePreferences['general'];
    
    // Find the first preferred provider that's online
    for (const preferred of preferences) {
      const provider = onlineProviders.find(p => p.name === preferred);
      if (provider) {
        return preferred;
      }
    }
    
    // Fallback to first online provider
    return onlineProviders[0].name as AIProvider;
  }

  /**
   * Provider-specific model recommendations
   */
  getRecommendedModels(): Record<AIProvider, Record<string, string>> {
    return {
      openrouter: {
        general: 'openai/gpt-3.5-turbo',
        coding: 'openai/gpt-4',
        creative: 'anthropic/claude-3-sonnet',
        analysis: 'anthropic/claude-3-opus',
        fast: 'anthropic/claude-3-haiku',
        'cost-effective': 'meta-llama/llama-3-8b-instruct',
        multilingual: 'google/gemini-pro',
        vision: 'openai/gpt-4-vision-preview',
      },
      ollama: {
        general: 'llama3.1:8b',
        coding: 'qwen2.5-coder:1.5b-base',
        fast: 'qwen2.5-coder:1.5b-base',
        creative: 'llama3.1:8b',
        large: 'gpt-oss:20b',
        small: 'qwen2.5-coder:1.5b-base',
        multilingual: 'llama3.1:8b',
        math: 'llama3.1:8b',
        vision: 'llava',
      },
      gemini: {
        general: 'gemini-pro',
        vision: 'gemini-pro-vision',
        fast: 'gemini-1.5-flash',
        advanced: 'gemini-1.5-pro',
        experimental: 'gemini-1.5-pro-exp',
      },
    };
  }

  /**
   * Cost estimation for different providers
   */
  estimateCost(provider: AIProvider, model: string, inputTokens: number, outputTokens: number = 0): number {
    return aiProviderConfig.estimateCost(provider, model, inputTokens, outputTokens);
  }

  /**
   * Get provider capabilities
   */
  getProviderCapabilities(): Record<AIProvider, {
    textGeneration: boolean;
    imageGeneration: boolean;
    visionAnalysis: boolean;
    codeGeneration: boolean;
    streaming: boolean;
    localDeployment: boolean;
    customModels: boolean;
  }> {
    const capabilities: Record<AIProvider, any> = {};
    
    const providers = aiProviderConfig.getAllProviders();
    providers.forEach(provider => {
      capabilities[provider.name] = provider.capabilities;
    });
    
    return capabilities;
  }

  // Private helper methods

  private getDefaultConfig(options: AIServiceConfig): Required<AIServiceConfig> {
    return {
      provider: options.provider || config.ai.defaultProvider,
      model: options.model || 'auto',
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens || 2000,
      systemPrompt: options.systemPrompt || '',
      contextType: options.contextType || 'general',
      stream: options.stream ?? false,
    };
  }

  private async callProvider(
    provider: AIProvider,
    prompt: string,
    config: Required<AIServiceConfig>
  ): Promise<Omit<ChatResponse, 'responseTime'>> {
    const startTime = Date.now();
    
    switch (provider) {
      case 'openrouter':
        return await this.callOpenRouter(prompt, config);
      case 'ollama':
        return await this.callOllama(prompt, config);
      case 'gemini':
        return await this.callGemini(prompt, config);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async callOpenRouter(
    prompt: string,
    config: Required<AIServiceConfig>
  ): Promise<Omit<ChatResponse, 'responseTime'>> {
    const providerConfig = aiProviderConfig.getProvider('openrouter');
    if (!providerConfig?.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const model = config.model === 'auto' ? 'openai/gpt-3.5-turbo' : config.model;
    
    const messages = [];
    if (config.systemPrompt) {
      messages.push({ role: 'system', content: config.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`${providerConfig.baseUrl || 'https://openrouter.ai/api/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${providerConfig.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Grow Your Need SaaS',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: config.stream,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenRouter');
    }

    const tokensUsed = data.usage?.total_tokens || 0;
    const cost = this.estimateCost('openrouter', model, tokensUsed);

    return {
      response: data.choices[0].message.content,
      provider: 'openrouter',
      model,
      tokensUsed,
      cost,
    };
  }

  private async callOllama(
    prompt: string,
    config: Required<AIServiceConfig>
  ): Promise<Omit<ChatResponse, 'responseTime'>> {
    const status = await ollamaManager.checkStatus();
    if (!status.isRunning) {
      throw new Error('Ollama is not running. Please start Ollama service or install it from https://ollama.ai');
    }

    let model = config.model === 'auto' ? 'llama3.1:8b' : config.model;
    
    // Check if model is installed, if not try to use available models
    const isInstalled = await ollamaManager.isModelInstalled(model);
    if (!isInstalled) {
      // Try to get available models and use the first one
      const availableModels = status.models;
      if (availableModels.length > 0) {
        const fallbackModel = availableModels[0].name;
        console.warn(`Model ${model} not found, using ${fallbackModel} instead`);
        model = fallbackModel;
      } else {
        throw new Error(`No models are installed in Ollama. Please install a model first with: ollama pull llama3.2`);
      }
    }

    const fullPrompt = config.systemPrompt 
      ? `${config.systemPrompt}\n\nUser: ${prompt}\nAssistant:`
      : prompt;

    const response = await fetch(`http://localhost:11434/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.response) {
      throw new Error('Invalid response from Ollama');
    }

    // Ollama doesn't provide token count, estimate it
    const tokensUsed = Math.ceil((prompt.length + data.response.length) / 4);

    return {
      response: data.response,
      provider: 'ollama',
      model,
      tokensUsed,
      cost: 0, // Ollama is free
    };
  }

  private async callGemini(
    prompt: string,
    config: Required<AIServiceConfig>
  ): Promise<Omit<ChatResponse, 'responseTime'>> {
    if (!this.geminiClient) {
      throw new Error('Gemini API key not configured');
    }

    const model = config.model === 'auto' ? 'gemini-pro' : config.model;
    
    const generativeModel = this.geminiClient.getGenerativeModel({ model });
    
    const fullPrompt = config.systemPrompt 
      ? `${config.systemPrompt}\n\n${prompt}`
      : prompt;

    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
      },
    });

    const response = result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Invalid response from Gemini');
    }

    // Estimate token usage
    const tokensUsed = Math.ceil((prompt.length + text.length) / 4);
    const cost = this.estimateCost('gemini', model, tokensUsed);

    return {
      response: text,
      provider: 'gemini',
      model,
      tokensUsed,
      cost,
    };
  }

  private async tryFallbackProviders(
    prompt: string,
    config: Required<AIServiceConfig>,
    startTime: number,
    excludeProvider: AIProvider
  ): Promise<ChatResponse> {
    const fallbackProviders = this.fallbackChain.filter(p => p !== excludeProvider);
    
    for (const provider of fallbackProviders) {
      try {
        const providerConfig = aiProviderConfig.getProvider(provider);
        if (!providerConfig?.isEnabled) continue;
        
        console.log(`Trying fallback provider: ${provider}`);
        const response = await this.callProvider(provider, prompt, { ...config, provider });
        const responseTime = Date.now() - startTime;
        
        // Track usage
        trackUsage(provider, response.tokensUsed, response.cost);
        
        return {
          ...response,
          responseTime,
        };
      } catch (error) {
        console.warn(`Fallback provider ${provider} also failed:`, error);
      }
    }
    
    throw new Error('All AI providers failed');
  }

  private getRecommendedProviderForUseCase(useCase: string): AIProvider {
    const preferences: Record<string, AIProvider> = {
      'cost-effective': 'ollama',
      'fast': 'ollama',
      'creative': 'openrouter',
      'coding': 'openrouter',
      'analysis': 'openrouter',
      'general': 'openrouter',
    };
    
    return preferences[useCase] || 'openrouter';
  }

  private getRecommendedModelForUseCase(provider: AIProvider, useCase: string): string {
    const recommendations = this.getRecommendedModels();
    return recommendations[provider]?.[useCase] || recommendations[provider]?.['general'] || 'auto';
  }

  private convertToModelInfo(providerConfig: ProviderConfig): ModelInfo[] {
    return providerConfig.models.map(model => ({
      id: model.id,
      name: model.name,
      provider: providerConfig.name,
      description: model.description,
      contextLength: model.contextLength,
      inputPricing: model.inputPricing,
      outputPricing: model.outputPricing,
      capabilities: model.capabilities,
      isRecommended: model.isRecommended,
      useCase: model.useCase,
    }));
  }

  private async testOpenRouterConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${config.ai.openrouter.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async testGeminiConnection(): Promise<boolean> {
    try {
      if (!this.geminiClient) return false;
      
      const model = this.geminiClient.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('Hello');
      return !!result.response.text();
    } catch {
      return false;
    }
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

// Export singleton instance
export const unifiedAIService = UnifiedAIService.getInstance();

// Export types and interfaces
export type {
  AIProvider,
  AIServiceConfig,
  ChatMessage,
  ChatResponse,
  ProviderStatus,
  UsageStats,
  ModelInfo,
};