/**
 * 🤖 Ollama Service for Multiverse Agent
 * 
 * Handles all interactions with local Ollama models
 */

export class OllamaService {
  constructor(host = 'http://localhost:11434') {
    this.host = host;
    this.defaultModel = 'qwen2.5-coder:1.5b-base';
  }

  async checkStatus() {
    try {
      const response = await fetch(`${this.host}/api/tags`);
      const data = await response.json();
      return {
        status: 'running',
        models: data.models,
        defaultModel: this.defaultModel
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async generateText(prompt, options = {}) {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      top_p = 0.9,
      max_tokens = 4000,
      stream = false
    } = options;

    try {
      const response = await fetch(`${this.host}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream,
          options: {
            temperature,
            top_p,
            num_predict: max_tokens
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        text: data.response,
        model: data.model,
        usage: data.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateCode(task, context = '') {
    const prompt = this.buildCodePrompt(task, context);
    
    const result = await this.generateText(prompt, {
      temperature: 0.3, // Lower temperature for more consistent code
      max_tokens: 6000
    });

    if (result.success) {
      return this.parseCodeResponse(result.text);
    }

    return {
      success: false,
      error: result.error
    };
  }

  buildCodePrompt(task, context) {
    return `You are a senior full-stack developer working on a cyberpunk dashboard project.

PROJECT CONTEXT:
- React + TypeScript + Vite frontend
- tRPC + Node.js backend  
- PostgreSQL database with Prisma ORM
- Tailwind CSS with cyberpunk theme
- Local Ollama AI integration

CURRENT TASK: ${task.title}
DESCRIPTION: ${task.description}

${context ? `ADDITIONAL CONTEXT: ${context}` : ''}

REQUIREMENTS:
1. Generate production-ready code
2. Follow TypeScript best practices
3. Maintain cyberpunk aesthetic
4. Include proper error handling
5. Add comprehensive comments
6. Ensure security best practices

Please provide the complete implementation including:
1. File structure and organization
2. Complete code files with imports
3. TypeScript types and interfaces
4. Error handling and validation
5. Security considerations
6. Testing recommendations

Format your response with code blocks like this:
\`\`\`typescript:filename.ts
// Your code here
\`\`\`

Generate the complete implementation that can be directly applied to the project.`;
  }

  parseCodeResponse(response) {
    const codeBlocks = [];
    const codeBlockRegex = /```(?:(\w+):)?([^\n]+)\n([\s\S]*?)```/g;
    
    let match;
    while ((match = codeBlockRegex.exec(response)) !== null) {
      const [, language, filename, code] = match;
      codeBlocks.push({
        language: language || 'typescript',
        filename: filename.trim(),
        code: code.trim()
      });
    }

    return {
      success: true,
      codeBlocks,
      rawResponse: response
    };
  }

  async listModels() {
    try {
      const response = await fetch(`${this.host}/api/tags`);
      const data = await response.json();
      return data.models;
    } catch (error) {
      throw new Error(`Failed to list models: ${error.message}`);
    }
  }

  async pullModel(modelName) {
    try {
      const response = await fetch(`${this.host}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to pull model: ${error.message}`);
    }
  }
}

// Export singleton instance
export const ollamaService = new OllamaService();
