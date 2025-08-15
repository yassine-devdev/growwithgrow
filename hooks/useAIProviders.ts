// React hooks for AI provider management
import { useState, useEffect, useCallback } from 'react';
import { AIProvider } from '../services/unifiedAIService';
import { 
  aiProviderConfig, 
  ProviderConfig, 
  UsageTracking,
  getAllProviders,
  getEnabledProviders,
  getUsageStats,
} from '../services/aiProviderConfig';
import { 
  ollamaManager, 
  OllamaStatus, 
  OllamaModel,
  checkOllamaStatus,
  listOllamaModels,
} from '../services/ollamaManager';

// Hook for managing AI provider configurations
export function useAIProviders() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load configuration from localStorage
      aiProviderConfig.loadConfiguration();
      
      // Get all providers
      const allProviders = getAllProviders();
      setProviders(allProviders);
      
      // Check provider status
      await checkProviderStatus();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkProviderStatus = useCallback(async () => {
    const enabledProviders = getEnabledProviders();
    
    for (const provider of enabledProviders) {
      try {
        let status: 'online' | 'offline' | 'error' = 'offline';
        let responseTime = 0;
        
        if (provider.name === 'ollama') {
          const startTime = Date.now();
          const ollamaStatus = await checkOllamaStatus();
          responseTime = Date.now() - startTime;
          status = ollamaStatus.isRunning ? 'online' : 'offline';
        } else if (provider.apiKey) {
          // For API-based providers, assume online if API key is configured
          status = 'online';
          responseTime = 100; // Placeholder
        }
        
        aiProviderConfig.updateConnectionStatus(provider.name, status, responseTime);
      } catch (error) {
        aiProviderConfig.updateConnectionStatus(provider.name, 'error');
      }
    }
    
    // Save updated configuration
    aiProviderConfig.saveConfiguration();
    
    // Refresh providers state
    setProviders(getAllProviders());
  }, []);

  const updateProvider = useCallback((name: AIProvider, updates: Partial<ProviderConfig>) => {
    aiProviderConfig.updateProvider(name, updates);
    aiProviderConfig.saveConfiguration();
    setProviders(getAllProviders());
  }, []);

  const toggleProvider = useCallback((name: AIProvider, enabled: boolean) => {
    aiProviderConfig.setProviderEnabled(name, enabled);
    aiProviderConfig.saveConfiguration();
    setProviders(getAllProviders());
  }, []);

  useEffect(() => {
    refreshProviders();
  }, [refreshProviders]);

  return {
    providers,
    enabledProviders: providers.filter(p => p.isEnabled),
    loading,
    error,
    refreshProviders,
    checkProviderStatus,
    updateProvider,
    toggleProvider,
  };
}

// Hook for AI usage statistics
export function useAIUsage(provider?: AIProvider) {
  const [usage, setUsage] = useState<UsageTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stats = getUsageStats(provider);
      setUsage(stats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage stats');
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  return {
    usage,
    totalRequests: usage.reduce((sum, u) => sum + u.totalRequests, 0),
    totalTokens: usage.reduce((sum, u) => sum + u.totalTokens, 0),
    totalCost: usage.reduce((sum, u) => sum + u.totalCost, 0),
    loading,
    error,
    refreshUsage,
  };
}

// Hook for Ollama management
export function useOllama() {
  const [status, setStatus] = useState<OllamaStatus>({ isRunning: false, models: [] });
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ollamaStatus = await checkOllamaStatus();
      setStatus(ollamaStatus);
      
      if (ollamaStatus.isRunning) {
        const modelList = await listOllamaModels();
        setModels(modelList);
      } else {
        setModels([]);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check Ollama status');
    } finally {
      setLoading(false);
    }
  }, []);

  const pullModel = useCallback(async (
    modelName: string,
    onProgress?: (progress: { status: string; completed?: number; total?: number }) => void
  ) => {
    try {
      const success = await ollamaManager.pullModel(modelName, onProgress);
      if (success) {
        await refreshStatus(); // Refresh to show new model
      }
      return success;
    } catch (error) {
      console.error('Failed to pull model:', error);
      return false;
    }
  }, [refreshStatus]);

  const deleteModel = useCallback(async (modelName: string) => {
    try {
      const success = await ollamaManager.deleteModel(modelName);
      if (success) {
        await refreshStatus(); // Refresh to remove deleted model
      }
      return success;
    } catch (error) {
      console.error('Failed to delete model:', error);
      return false;
    }
  }, [refreshStatus]);

  const testModel = useCallback(async (modelName: string, prompt?: string) => {
    return await ollamaManager.testModel(modelName, prompt);
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    status,
    models,
    loading,
    error,
    refreshStatus,
    pullModel,
    deleteModel,
    testModel,
    recommendedModels: ollamaManager.getRecommendedModels(),
    installationInstructions: ollamaManager.getInstallationInstructions(),
  };
}

// Hook for provider recommendations
export function useProviderRecommendations() {
  const [recommendations, setRecommendations] = useState<Array<{
    provider: AIProvider;
    model: any;
    reason: string;
    score: number;
  }>>([]);

  const getRecommendations = useCallback((useCase: string, requirements?: {
    maxCost?: number;
    minSpeed?: number;
    capabilities?: string[];
  }) => {
    const providers = getEnabledProviders();
    const recs: Array<{ provider: AIProvider; model: any; reason: string; score: number }> = [];

    for (const provider of providers) {
      if (provider.connectionStatus !== 'online') continue;

      const suitableModels = provider.models.filter(model => {
        // Check use case
        if (!model.useCase?.includes(useCase) && !model.isRecommended) return false;
        
        // Check cost requirements
        if (requirements?.maxCost && model.inputPricing > requirements.maxCost) return false;
        
        // Check capabilities
        if (requirements?.capabilities) {
          const hasAllCapabilities = requirements.capabilities.every(cap => 
            model.capabilities.includes(cap)
          );
          if (!hasAllCapabilities) return false;
        }
        
        return true;
      });

      for (const model of suitableModels) {
        let score = 0;
        let reason = '';

        // Score based on cost (lower is better)
        if (model.inputPricing === 0) {
          score += 50; // Free models get high score
          reason += 'Free to use. ';
        } else {
          score += Math.max(0, 30 - (model.inputPricing * 1000000)); // Inverse of cost
        }

        // Score based on use case match
        if (model.useCase?.includes(useCase)) {
          score += 30;
          reason += `Optimized for ${useCase}. `;
        }

        // Score based on provider reliability
        if (provider.connectionStatus === 'online') {
          score += 20;
          reason += 'Currently available. ';
        }

        recs.push({
          provider: provider.name,
          model,
          reason: reason.trim(),
          score,
        });
      }
    }

    // Sort by score (highest first)
    recs.sort((a, b) => b.score - a.score);
    
    setRecommendations(recs.slice(0, 5)); // Top 5 recommendations
    return recs.slice(0, 5);
  }, []);

  return {
    recommendations,
    getRecommendations,
  };
}

// Hook for cost estimation
export function useCostEstimation() {
  const estimateCost = useCallback((
    provider: AIProvider,
    modelId: string,
    inputTokens: number,
    outputTokens: number = 0
  ) => {
    return aiProviderConfig.estimateCost(provider, modelId, inputTokens, outputTokens);
  }, []);

  const estimateRequestCost = useCallback((
    provider: AIProvider,
    modelId: string,
    inputText: string,
    expectedOutputLength: number = 100
  ) => {
    // Rough estimation: 1 token ≈ 4 characters
    const inputTokens = Math.ceil(inputText.length / 4);
    const outputTokens = Math.ceil(expectedOutputLength / 4);
    
    return estimateCost(provider, modelId, inputTokens, outputTokens);
  }, [estimateCost]);

  return {
    estimateCost,
    estimateRequestCost,
  };
}