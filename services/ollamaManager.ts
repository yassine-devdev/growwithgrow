// Ollama Local Model Management
import { config } from './config';

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaModelInfo {
  modelfile: string;
  parameters: string;
  template: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaStatus {
  isRunning: boolean;
  version?: string;
  models: OllamaModel[];
  error?: string;
}

export interface ModelPullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

// Ollama Manager Class
export class OllamaManager {
  private static instance: OllamaManager;
  private baseUrl: string;
  private pullProgressCallbacks: Map<string, (progress: ModelPullProgress) => void> = new Map();

  private constructor() {
    this.baseUrl = config.ai.ollama.baseUrl;
  }

  static getInstance(): OllamaManager {
    if (!OllamaManager.instance) {
      OllamaManager.instance = new OllamaManager();
    }
    return OllamaManager.instance;
  }

  // Check if Ollama is running
  async checkStatus(): Promise<OllamaStatus> {
    try {
      // Check if Ollama is running
      const response = await fetch(`${this.baseUrl}/api/version`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return {
          isRunning: false,
          models: [],
          error: `Ollama not responding (${response.status})`,
        };
      }

      const versionData = await response.json();
      
      // Get list of models
      const models = await this.listModels();

      return {
        isRunning: true,
        version: versionData.version,
        models,
      };
    } catch (error) {
      return {
        isRunning: false,
        models: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // List installed models
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error listing Ollama models:', error);
      return [];
    }
  }

  // Get model information
  async getModelInfo(modelName: string): Promise<OllamaModelInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get model info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error getting model info for ${modelName}:`, error);
      return null;
    }
  }

  // Pull a model from Ollama registry
  async pullModel(
    modelName: string, 
    onProgress?: (progress: ModelPullProgress) => void
  ): Promise<boolean> {
    try {
      if (onProgress) {
        this.pullProgressCallbacks.set(modelName, onProgress);
      }

      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const progress = JSON.parse(line);
              if (onProgress) {
                onProgress(progress);
              }
            } catch (e) {
              // Ignore malformed JSON lines
            }
          }
        }
      }

      this.pullProgressCallbacks.delete(modelName);
      return true;
    } catch (error) {
      console.error(`Error pulling model ${modelName}:`, error);
      this.pullProgressCallbacks.delete(modelName);
      return false;
    }
  }

  // Delete a model
  async deleteModel(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
      });

      return response.ok;
    } catch (error) {
      console.error(`Error deleting model ${modelName}:`, error);
      return false;
    }
  }

  // Test model generation
  async testModel(modelName: string, prompt: string = 'Hello, how are you?'): Promise<{
    success: boolean;
    response?: string;
    error?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt,
          stream: false,
          options: {
            num_predict: 50,
            temperature: 0.7,
          },
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          responseTime,
        };
      }

      const data = await response.json();
      return {
        success: true,
        response: data.response,
        responseTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
      };
    }
  }

  // Get recommended models for different use cases
  getRecommendedModels(): Array<{
    name: string;
    description: string;
    size: string;
    useCase: string[];
    pullCommand: string;
  }> {
    return [
      {
        name: 'llama3.2',
        description: 'Latest Llama model, good balance of performance and size',
        size: '2.0GB',
        useCase: ['general', 'conversation', 'writing'],
        pullCommand: 'llama3.2',
      },
      {
        name: 'llama3.2:1b',
        description: 'Smallest Llama 3.2 model, very fast',
        size: '1.3GB',
        useCase: ['fast', 'lightweight', 'testing'],
        pullCommand: 'llama3.2:1b',
      },
      {
        name: 'codellama',
        description: 'Specialized for code generation and programming',
        size: '3.8GB',
        useCase: ['coding', 'programming', 'development'],
        pullCommand: 'codellama',
      },
      {
        name: 'phi3',
        description: 'Microsoft\'s efficient small model',
        size: '2.3GB',
        useCase: ['fast', 'efficient', 'general'],
        pullCommand: 'phi3',
      },
      {
        name: 'mistral',
        description: 'Good for creative and analytical tasks',
        size: '4.1GB',
        useCase: ['creative', 'analysis', 'reasoning'],
        pullCommand: 'mistral',
      },
      {
        name: 'llava',
        description: 'Vision-language model for image analysis',
        size: '4.7GB',
        useCase: ['vision', 'image-analysis', 'multimodal'],
        pullCommand: 'llava',
      },
      {
        name: 'deepseek-math',
        description: 'Specialized for mathematical reasoning',
        size: '4.4GB',
        useCase: ['math', 'reasoning', 'problem-solving'],
        pullCommand: 'deepseek-math',
      },
      {
        name: 'qwen2',
        description: 'Multilingual model with strong performance',
        size: '4.4GB',
        useCase: ['multilingual', 'translation', 'general'],
        pullCommand: 'qwen2',
      },
    ];
  }

  // Get model size in human-readable format
  formatModelSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // Check if a model is installed
  async isModelInstalled(modelName: string): Promise<boolean> {
    const models = await this.listModels();
    return models.some(model => model.name === modelName || model.name.startsWith(`${modelName}:`));
  }

  // Get installation instructions
  getInstallationInstructions(): {
    platform: string;
    instructions: string[];
    downloadUrl: string;
  }[] {
    return [
      {
        platform: 'Windows',
        instructions: [
          'Download Ollama for Windows from the official website',
          'Run the installer and follow the setup wizard',
          'Ollama will start automatically and run in the background',
          'Open Command Prompt or PowerShell to use Ollama commands',
        ],
        downloadUrl: 'https://ollama.ai/download/windows',
      },
      {
        platform: 'macOS',
        instructions: [
          'Download Ollama for macOS from the official website',
          'Open the downloaded .dmg file and drag Ollama to Applications',
          'Launch Ollama from Applications - it will run in the menu bar',
          'Open Terminal to use Ollama commands',
        ],
        downloadUrl: 'https://ollama.ai/download/mac',
      },
      {
        platform: 'Linux',
        instructions: [
          'Open terminal and run: curl -fsSL https://ollama.ai/install.sh | sh',
          'Or download the binary manually from the website',
          'Ollama will be installed and started as a service',
          'Use "ollama" command in terminal',
        ],
        downloadUrl: 'https://ollama.ai/download/linux',
      },
    ];
  }

  // Update base URL (for custom Ollama installations)
  updateBaseUrl(newUrl: string): void {
    this.baseUrl = newUrl;
  }

  // Get current base URL
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const ollamaManager = OllamaManager.getInstance();

// Export utility functions
export const checkOllamaStatus = () => ollamaManager.checkStatus();
export const listOllamaModels = () => ollamaManager.listModels();
export const pullOllamaModel = (modelName: string, onProgress?: (progress: ModelPullProgress) => void) => 
  ollamaManager.pullModel(modelName, onProgress);
export const deleteOllamaModel = (modelName: string) => ollamaManager.deleteModel(modelName);
export const testOllamaModel = (modelName: string, prompt?: string) => ollamaManager.testModel(modelName, prompt);
export const getRecommendedOllamaModels = () => ollamaManager.getRecommendedModels();
export const isOllamaModelInstalled = (modelName: string) => ollamaManager.isModelInstalled(modelName);
export const getOllamaInstallationInstructions = () => ollamaManager.getInstallationInstructions();