import { api } from "encore.dev/api";
import { OpenRouterClient } from "./openrouter_client";
import { OllamaClient } from "./ollama_client";

export interface GetModelsRequest {
  provider?: 'openrouter' | 'ollama' | 'all';
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  pricing?: any;
}

export interface GetModelsResponse {
  models: ModelInfo[];
}

// Retrieves available AI models from providers.
export const getModels = api<GetModelsRequest, GetModelsResponse>(
  { expose: true, method: "GET", path: "/ai/models" },
  async (req) => {
    const models: ModelInfo[] = [];
    const provider = req.provider || 'all';

    if (provider === 'openrouter' || provider === 'all') {
      try {
        const openRouterClient = new OpenRouterClient();
        const openRouterModels = await openRouterClient.listModels();
        models.push(...openRouterModels.map(model => ({
          ...model,
          provider: 'openrouter'
        })));
      } catch (error) {
        console.warn("Failed to fetch OpenRouter models:", error);
      }
    }

    if (provider === 'ollama' || provider === 'all') {
      try {
        const ollamaClient = new OllamaClient();
        const ollamaModels = await ollamaClient.listModels();
        models.push(...ollamaModels.map(model => ({
          ...model,
          provider: 'ollama'
        })));
      } catch (error) {
        console.warn("Failed to fetch Ollama models:", error);
      }
    }

    return { models };
  }
);
