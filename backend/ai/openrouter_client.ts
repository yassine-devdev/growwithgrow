import { openRouterApiKey, openRouterBaseUrl, modelPricing } from "./config";
import type { ChatRequest, ChatResponse } from "./types";

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = openRouterApiKey();
    this.baseUrl = openRouterBaseUrl;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const model = request.model || "anthropic/claude-3-haiku";
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://grow-your-need.com",
        "X-Title": "GROW YouR NEED SaaS School"
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1000,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    const tokensUsed = data.usage?.total_tokens || 0;
    
    // Calculate cost based on model pricing
    const pricing = modelPricing[model] || { input: 0.001, output: 0.002 };
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    const cost = (inputTokens * pricing.input + outputTokens * pricing.output) / 1000;

    return {
      content,
      model,
      provider: "openrouter",
      tokensUsed,
      cost
    };
  }

  async completion(prompt: string, model?: string): Promise<ChatResponse> {
    return this.chat({
      messages: [{ role: "user", content: prompt }],
      model: model || "openai/gpt-3.5-turbo"
    });
  }

  async listModels(): Promise<Array<{ id: string; name: string; pricing?: any }>> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.data.map((model: any) => ({
      id: model.id,
      name: model.name || model.id,
      pricing: model.pricing
    }));
  }
}
