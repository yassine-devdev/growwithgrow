// AI Provider Configuration Management
import { AIProvider } from './aiService';
import { config } from './config';

export interface ProviderConfig {
  name: AIProvider;
  displayName: string;
  description: string;
  isEnabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  models: ModelConfig[];
  capabilities: ProviderCapabilities;
  pricing: PricingInfo;
  connectionStatus: 'online' | 'offline' | 'error' | 'unknown';
  lastChecked?: Date;
  responseTime?: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  inputPricing: number;
  outputPricing: number;
  capabilities: string[];
  isRecommended?: boolean;
  useCase?: string[];
}

export interface ProviderCapabilities {
  textGeneration: boolean;
  imageGeneration: boolean;
  visionAnalysis: boolean;
  codeGeneration: boolean;
  streaming: boolean;
  localDeployment: boolean;
  customModels: boolean;
  functionCalling: boolean;
  jsonMode: boolean;
}

export interface PricingInfo {
  type: 'free' | 'pay-per-use' | 'subscription';
  currency: string;
  inputTokenPrice?: number;
  outputTokenPrice?: number;
  imagePrice?: number;
  freeQuota?: {
    requests: number;
    tokens: number;
    period: 'day' | 'month';
  };
}

export interface UsageTracking {
  provider: AIProvider;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  lastUsed: Date;
  dailyUsage: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

// Provider Configuration Manager
export class AIProviderConfigManager {
  private static instance: AIProviderConfigManager;
  private providers: Map<AIProvider, ProviderConfig> = new Map();
  private usageTracking: Map<AIProvider, UsageTracking> = new Map();

  private constructor() {
    this.initializeProviders();
  }

  static getInstance(): AIProviderConfigManager {
    if (!AIProviderConfigManager.instance) {
      AIProviderConfigManager.instance = new AIProviderConfigManager();
    }
    return AIProviderConfigManager.instance;
  }

  private initializeProviders() {
    // OpenRouter Configuration
    this.providers.set('openrouter', {
      name: 'openrouter',
      displayName: 'OpenRouter',
      description: 'Access to multiple AI models through a unified API',
      isEnabled: !!config.ai.openrouter.apiKey,
      apiKey: config.ai.openrouter.apiKey,
      baseUrl: config.ai.openrouter.baseUrl,
      models: [
        {
          id: 'openai/gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and efficient for most tasks',
          contextLength: 16385,
          inputPricing: 0.0000015,
          outputPricing: 0.000002,
          capabilities: ['text', 'code', 'analysis'],
          isRecommended: true,
          useCase: ['general', 'fast'],
        },
        {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          description: 'Most capable model for complex tasks',
          contextLength: 8192,
          inputPricing: 0.00003,
          outputPricing: 0.00006,
          capabilities: ['text', 'code', 'analysis', 'reasoning'],
          isRecommended: true,
          useCase: ['coding', 'analysis'],
        },
        {
          id: 'anthropic/claude-3-haiku',
          name: 'Claude 3 Haiku',
          description: 'Fast and cost-effective',
          contextLength: 200000,
          inputPricing: 0.00000025,
          outputPricing: 0.00000125,
          capabilities: ['text', 'analysis'],
          useCase: ['fast', 'cost-effective'],
        },
        {
          id: 'anthropic/claude-3-sonnet',
          name: 'Claude 3 Sonnet',
          description: 'Balanced performance and capability',
          contextLength: 200000,
          inputPricing: 0.000003,
          outputPricing: 0.000015,
          capabilities: ['text', 'code', 'analysis', 'creative'],
          isRecommended: true,
          useCase: ['creative', 'analysis'],
        },
      ],
      capabilities: {
        textGeneration: true,
        imageGeneration: true,
        visionAnalysis: true,
        codeGeneration: true,
        streaming: true,
        localDeployment: false,
        customModels: false,
        functionCalling: true,
        jsonMode: true,
      },
      pricing: {
        type: 'pay-per-use',
        currency: 'USD',
        inputTokenPrice: 0.000001,
        outputTokenPrice: 0.000002,
      },
      connectionStatus: 'unknown',
    });

    // Ollama Configuration
    this.providers.set('ollama', {
      name: 'ollama',
      displayName: 'Ollama',
      description: 'Local AI models running on your machine',
      isEnabled: true, // Always enabled, but may not be available
      baseUrl: config.ai.ollama.baseUrl,
      models: [
        {
          id: 'llama3.2',
          name: 'Llama 3.2',
          description: 'Latest Llama model, good for general tasks',
          contextLength: 128000,
          inputPricing: 0,
          outputPricing: 0,
          capabilities: ['text', 'code'],
          isRecommended: true,
          useCase: ['general', 'cost-effective'],
        },
        {
          id: 'codellama',
          name: 'Code Llama',
          description: 'Specialized for code generation',
          contextLength: 16384,
          inputPricing: 0,
          outputPricing: 0,
          capabilities: ['code', 'text'],
          isRecommended: true,
          useCase: ['coding'],
        },
        {
          id: 'phi3',
          name: 'Phi-3',
          description: 'Small, fast model for quick tasks',
          contextLength: 128000,
          inputPricing: 0,
          outputPricing: 0,
          capabilities: ['text'],
          useCase: ['fast'],
        },
        {
          id: 'mistral',
          name: 'Mistral',
          description: 'Good for creative and analytical tasks',
          contextLength: 32768,
          inputPricing: 0,
          outputPricing: 0,
          capabilities: ['text', 'creative', 'analysis'],
          useCase: ['creative'],
        },
      ],
      capabilities: {
        textGeneration: true,
        imageGeneration: false,
        visionAnalysis: true,
        codeGeneration: true,
        streaming: true,
        localDeployment: true,
        customModels: true,
        functionCalling: false,
        jsonMode: false,
      },
      pricing: {
        type: 'free',
        currency: 'USD',
        freeQuota: {
          requests: 1000000,
          tokens: 1000000000,
          period: 'month',
        },
      },
      connectionStatus: 'unknown',
    });

    // Gemini Configuration
    this.providers.set('gemini', {
      name: 'gemini',
      displayName: 'Google Gemini',
      description: 'Google\'s advanced AI model with multimodal capabilities',
      isEnabled: !!config.ai.gemini.apiKey,
      apiKey: config.ai.gemini.apiKey,
      models: [
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          description: 'Balanced performance for text tasks',
          contextLength: 32768,
          inputPricing: 0.0000005,
          outputPricing: 0.0000015,
          capabilities: ['text', 'code', 'analysis'],
          isRecommended: true,
          useCase: ['general', 'analysis'],
        },
        {
          id: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          description: 'Fast and efficient for most tasks',
          contextLength: 1000000,
          inputPricing: 0.00000035,
          outputPricing: 0.00000105,
          capabilities: ['text', 'code', 'analysis'],
          isRecommended: true,
          useCase: ['fast', 'cost-effective'],
        },
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          description: 'Most capable Gemini model',
          contextLength: 2000000,
          inputPricing: 0.0000035,
          outputPricing: 0.0000105,
          capabilities: ['text', 'code', 'analysis', 'reasoning'],
          useCase: ['analysis', 'coding'],
        },
        {
          id: 'gemini-pro-vision',
          name: 'Gemini Pro Vision',
          description: 'Multimodal model with vision capabilities',
          contextLength: 16384,
          inputPricing: 0.00000025,
          outputPricing: 0.0000005,
          capabilities: ['text', 'vision', 'analysis'],
          useCase: ['vision'],
        },
      ],
      capabilities: {
        textGeneration: true,
        imageGeneration: true,
        visionAnalysis: true,
        codeGeneration: true,
        streaming: true,
        localDeployment: false,
        customModels: false,
        functionCalling: true,
        jsonMode: true,
      },
      pricing: {
        type: 'pay-per-use',
        currency: 'USD',
        inputTokenPrice: 0.0000005,
        outputTokenPrice: 0.0000015,
        freeQuota: {
          requests: 60,
          tokens: 32000,
          period: 'day',
        },
      },
      connectionStatus: 'unknown',
    });
  }

  // Get all provider configurations
  getAllProviders(): ProviderConfig[] {
    return Array.from(this.providers.values());
  }

  // Get enabled providers only
  getEnabledProviders(): ProviderConfig[] {
    return this.getAllProviders().filter(p => p.isEnabled);
  }

  // Get provider configuration
  getProvider(name: AIProvider): ProviderConfig | undefined {
    return this.providers.get(name);
  }

  // Update provider configuration
  updateProvider(name: AIProvider, updates: Partial<ProviderConfig>): void {
    const provider = this.providers.get(name);
    if (provider) {
      this.providers.set(name, { ...provider, ...updates });
    }
  }

  // Enable/disable provider
  setProviderEnabled(name: AIProvider, enabled: boolean): void {
    this.updateProvider(name, { isEnabled: enabled });
  }

  // Update provider connection status
  updateConnectionStatus(name: AIProvider, status: 'online' | 'offline' | 'error', responseTime?: number): void {
    this.updateProvider(name, {
      connectionStatus: status,
      lastChecked: new Date(),
      responseTime,
    });
  }

  // Get models for a provider
  getProviderModels(name: AIProvider): ModelConfig[] {
    const provider = this.providers.get(name);
    return provider?.models || [];
  }

  // Get recommended models for a use case
  getRecommendedModels(useCase: string): Array<{ provider: AIProvider; model: ModelConfig }> {
    const recommendations: Array<{ provider: AIProvider; model: ModelConfig }> = [];
    
    for (const [providerName, provider] of this.providers) {
      if (!provider.isEnabled) continue;
      
      const suitableModels = provider.models.filter(model => 
        model.useCase?.includes(useCase) || model.isRecommended
      );
      
      suitableModels.forEach(model => {
        recommendations.push({ provider: providerName, model });
      });
    }
    
    // Sort by pricing (free first, then by cost)
    return recommendations.sort((a, b) => {
      if (a.model.inputPricing === 0 && b.model.inputPricing > 0) return -1;
      if (a.model.inputPricing > 0 && b.model.inputPricing === 0) return 1;
      return a.model.inputPricing - b.model.inputPricing;
    });
  }

  // Track usage
  trackUsage(provider: AIProvider, tokens: number, cost: number): void {
    const today = new Date().toISOString().split('T')[0];
    let usage = this.usageTracking.get(provider);
    
    if (!usage) {
      usage = {
        provider,
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        lastUsed: new Date(),
        dailyUsage: [],
      };
      this.usageTracking.set(provider, usage);
    }
    
    usage.totalRequests += 1;
    usage.totalTokens += tokens;
    usage.totalCost += cost;
    usage.lastUsed = new Date();
    
    // Update daily usage
    let dailyEntry = usage.dailyUsage.find(d => d.date === today);
    if (!dailyEntry) {
      dailyEntry = { date: today, requests: 0, tokens: 0, cost: 0 };
      usage.dailyUsage.push(dailyEntry);
    }
    
    dailyEntry.requests += 1;
    dailyEntry.tokens += tokens;
    dailyEntry.cost += cost;
    
    // Keep only last 30 days
    usage.dailyUsage = usage.dailyUsage
      .filter(d => new Date(d.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Get usage statistics
  getUsageStats(provider?: AIProvider): UsageTracking[] {
    if (provider) {
      const usage = this.usageTracking.get(provider);
      return usage ? [usage] : [];
    }
    return Array.from(this.usageTracking.values());
  }

  // Estimate cost for a request
  estimateCost(provider: AIProvider, modelId: string, inputTokens: number, outputTokens: number = 0): number {
    const providerConfig = this.providers.get(provider);
    if (!providerConfig) return 0;
    
    const model = providerConfig.models.find(m => m.id === modelId);
    if (!model) return 0;
    
    return (inputTokens * model.inputPricing) + (outputTokens * model.outputPricing);
  }

  // Get provider health status
  getProviderHealth(): Array<{ provider: AIProvider; status: string; details: string }> {
    return this.getAllProviders().map(provider => ({
      provider: provider.name,
      status: provider.connectionStatus,
      details: this.getHealthDetails(provider),
    }));
  }

  private getHealthDetails(provider: ProviderConfig): string {
    switch (provider.connectionStatus) {
      case 'online':
        return `Responding in ${provider.responseTime}ms`;
      case 'offline':
        return 'Service unavailable';
      case 'error':
        return 'Configuration or API error';
      default:
        return 'Status unknown';
    }
  }

  // Save configuration to localStorage
  saveConfiguration(): void {
    const config = {
      providers: Array.from(this.providers.entries()),
      usage: Array.from(this.usageTracking.entries()),
    };
    localStorage.setItem('aiProviderConfig', JSON.stringify(config));
  }

  // Load configuration from localStorage
  loadConfiguration(): void {
    try {
      const saved = localStorage.getItem('aiProviderConfig');
      if (saved) {
        const config = JSON.parse(saved);
        if (config.providers) {
          this.providers = new Map(config.providers);
        }
        if (config.usage) {
          this.usageTracking = new Map(config.usage);
        }
      }
    } catch (error) {
      console.warn('Failed to load AI provider configuration:', error);
    }
  }
}

// Export singleton instance
export const aiProviderConfig = AIProviderConfigManager.getInstance();

// Export utility functions
export const getAllProviders = () => aiProviderConfig.getAllProviders();
export const getEnabledProviders = () => aiProviderConfig.getEnabledProviders();
export const getProvider = (name: AIProvider) => aiProviderConfig.getProvider(name);
export const getProviderModels = (name: AIProvider) => aiProviderConfig.getProviderModels(name);
export const getRecommendedModels = (useCase: string) => aiProviderConfig.getRecommendedModels(useCase);
export const trackUsage = (provider: AIProvider, tokens: number, cost: number) => 
  aiProviderConfig.trackUsage(provider, tokens, cost);
export const getUsageStats = (provider?: AIProvider) => aiProviderConfig.getUsageStats(provider);
export const estimateCost = (provider: AIProvider, modelId: string, inputTokens: number, outputTokens?: number) => 
  aiProviderConfig.estimateCost(provider, modelId, inputTokens, outputTokens);