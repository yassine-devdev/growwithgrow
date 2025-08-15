import { ollamaBaseUrl } from "./config";
import type { ChatRequest, ChatResponse } from "./types";

export class OllamaClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ollamaBaseUrl;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const model = request.model || "llama2";
    
    // Convert messages to Ollama format
    const prompt = this.formatMessages(request.messages);
    
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || 1000
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.response || "";
    
    // Ollama doesn't provide token usage, so we estimate
    const tokensUsed = Math.ceil(content.length / 4); // Rough estimation
    
    return {
      content,
      model,
      provider: "ollama",
      tokensUsed,
      cost: 0 // Ollama is free for local usage
    };
  }

  async completion(prompt: string, model?: string): Promise<ChatResponse> {
    return this.chat({
      messages: [{ role: "user", content: prompt }],
      model: model || "llama2"
    });
  }

  async listModels(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Ollama models: ${response.status}`);
      }

      const data = await response.json();
      return data.models?.map((model: any) => ({
        id: model.name,
        name: model.name
      })) || [];
    } catch (error) {
      // If Ollama is not running, return empty array
      console.warn("Ollama not available:", error);
      return [];
    }
  }

  async pullModel(modelName: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/pull`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: modelName
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model ${modelName}: ${response.status}`);
    }
  }

  private formatMessages(messages: Array<{ role: string; content: string }>): string {
    return messages.map(msg => {
      if (msg.role === "system") {
        return `System: ${msg.content}`;
      } else if (msg.role === "assistant") {
        return `Assistant: ${msg.content}`;
      } else {
        return `Human: ${msg.content}`;
      }
    }).join("\n\n");
  }
}
