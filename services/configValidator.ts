// Configuration validator for production readiness
import { config } from './config';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export function validateConfiguration(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check required environment variables
  if (!config.trpc.httpUrl) {
    errors.push('VITE_TRPC_HTTP_URL is not configured');
  }

  if (!config.trpc.wsUrl) {
    warnings.push('VITE_TRPC_WS_URL is not configured - WebSocket features will be disabled');
  }

  // Check AI provider configurations
  const hasOpenRouter = !!config.ai.openrouter.apiKey;
  const hasGemini = !!config.ai.gemini.apiKey;
  const hasOllama = config.ai.ollama.enabled;

  if (!hasOpenRouter && !hasGemini && !hasOllama) {
    errors.push('No AI providers are configured. Please set up at least one provider.');
  }

  if (!hasOpenRouter) {
    warnings.push('OpenRouter API key not configured - OpenRouter features will be disabled');
    recommendations.push('Consider setting up OpenRouter for access to multiple AI models');
  }

  if (!hasGemini) {
    warnings.push('Gemini API key not configured - Gemini features will be disabled');
    recommendations.push('Consider setting up Google Gemini for advanced AI capabilities');
  }

  if (!hasOllama) {
    warnings.push('Ollama is disabled - Local AI features will be unavailable');
    recommendations.push('Consider enabling Ollama for cost-effective local AI processing');
  }

  // Check application configuration
  if (!config.app.name) {
    warnings.push('Application name not configured - using default');
  }

  // Check cost limits
  if (config.ai.dailyCostLimit <= 0) {
    warnings.push('Daily cost limit is not set or invalid - unlimited spending possible');
    recommendations.push('Set VITE_AI_DAILY_COST_LIMIT to prevent unexpected costs');
  }

  if (config.ai.monthlyCostLimit <= 0) {
    warnings.push('Monthly cost limit is not set or invalid - unlimited spending possible');
    recommendations.push('Set VITE_AI_MONTHLY_COST_LIMIT to prevent unexpected costs');
  }

  // Production-specific checks
  if (config.app.isProduction) {
    if (config.trpc.httpUrl.includes('localhost')) {
      errors.push('Production build is using localhost URLs - update VITE_TRPC_HTTP_URL');
    }

    if (config.ai.openrouter.siteUrl.includes('localhost')) {
      warnings.push('Production build is using localhost site URL - update VITE_APP_URL');
    }

    if (!config.ai.trackUsage) {
      recommendations.push('Enable usage tracking in production for cost monitoring');
    }
  }

  // Development-specific recommendations
  if (config.app.isDevelopment) {
    if (hasOpenRouter && hasGemini) {
      recommendations.push('Multiple AI providers configured - great for testing fallback mechanisms');
    }

    if (!config.ai.trackUsage) {
      recommendations.push('Enable usage tracking in development to test cost monitoring features');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations,
  };
}

export function logValidationResults(results: ValidationResult): void {
  console.group('🔧 Configuration Validation');

  if (results.isValid) {
    console.log('✅ Configuration is valid');
  } else {
    console.error('❌ Configuration has errors');
  }

  if (results.errors.length > 0) {
    console.group('❌ Errors (must be fixed):');
    results.errors.forEach(error => console.error(`  • ${error}`));
    console.groupEnd();
  }

  if (results.warnings.length > 0) {
    console.group('⚠️ Warnings:');
    results.warnings.forEach(warning => console.warn(`  • ${warning}`));
    console.groupEnd();
  }

  if (results.recommendations.length > 0) {
    console.group('💡 Recommendations:');
    results.recommendations.forEach(rec => console.info(`  • ${rec}`));
    console.groupEnd();
  }

  console.groupEnd();
}

// Auto-validate on import in development
if (config.app.isDevelopment) {
  const results = validateConfiguration();
  logValidationResults(results);
  
  if (!results.isValid) {
    console.error('⚠️ Please fix configuration errors before proceeding');
  }
}