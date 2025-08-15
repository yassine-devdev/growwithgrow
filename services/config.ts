// Environment configuration for the frontend application
export const config = {
  // tRPC Configuration
  trpc: {
    httpUrl: import.meta.env.VITE_TRPC_HTTP_URL || 'http://localhost:4000/trpc',
    wsUrl: import.meta.env.VITE_TRPC_WS_URL || 'ws://localhost:3001',
  },
  
  // AI Provider Configuration
  ai: {
    gemini: {
      apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY || '',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    },
    openrouter: {
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
      baseUrl: 'https://openrouter.ai/api/v1',
      siteName: import.meta.env.VITE_APP_NAME || 'Grow Your Need SaaS',
      siteUrl: import.meta.env.VITE_APP_URL || window.location.origin,
    },
    ollama: {
      baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
      enabled: import.meta.env.VITE_OLLAMA_ENABLED !== 'false',
    },
    // Default provider preferences
    defaultProvider: (import.meta.env.VITE_DEFAULT_AI_PROVIDER as 'openrouter' | 'ollama' | 'gemini') || 'openrouter',
    fallbackChain: ['openrouter', 'ollama', 'gemini'] as const,
    // Usage tracking
    trackUsage: import.meta.env.VITE_TRACK_AI_USAGE !== 'false',
    // Cost limits (in USD)
    dailyCostLimit: parseFloat(import.meta.env.VITE_AI_DAILY_COST_LIMIT || '10'),
    monthlyCostLimit: parseFloat(import.meta.env.VITE_AI_MONTHLY_COST_LIMIT || '100'),
  },
  
  // Application Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Grow Your Need SaaS',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },
  
  // Feature Flags
  features: {
    enableWebSocket: true,
    enableOfflineMode: true,
    enableAnalytics: true,
    enableErrorReporting: true,
  },
} as const;

// Type-safe environment variable access
export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }
  return value || defaultValue || '';
};

// Validate required environment variables
export const validateEnvironment = (): boolean => {
  const requiredVars = [
    'VITE_TRPC_HTTP_URL',
    'VITE_TRPC_WS_URL',
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    return false;
  }
  
  return true;
};