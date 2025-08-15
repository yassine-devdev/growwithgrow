import { secret } from "encore.dev/config";

// OpenRouter API configuration
export const openRouterApiKey = secret("OpenRouterApiKey");
export const openRouterBaseUrl = "https://openrouter.ai/api/v1";

// Ollama configuration
export const ollamaBaseUrl = "http://localhost:11434"; // Default Ollama URL

// Default models
export const defaultModels = {
  openrouter: {
    chat: "anthropic/claude-3-haiku",
    completion: "openai/gpt-3.5-turbo",
    embedding: "openai/text-embedding-ada-002"
  },
  ollama: {
    chat: "llama2",
    completion: "llama2",
    embedding: "nomic-embed-text"
  }
};

// Model pricing (per 1K tokens) for OpenRouter
export const modelPricing: Record<string, { input: number; output: number }> = {
  "anthropic/claude-3-haiku": { input: 0.00025, output: 0.00125 },
  "openai/gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
  "openai/gpt-4": { input: 0.03, output: 0.06 },
  "meta-llama/llama-2-70b-chat": { input: 0.0007, output: 0.0009 },
};
