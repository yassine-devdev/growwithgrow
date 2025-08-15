export interface Conversation {
    id: number;
    userId: number;
    title?: string;
    contextType: 'general' | 'academic' | 'administrative' | 'support';
    schoolId?: number;
    classId?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Message {
    id: number;
    conversationId: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: any;
    createdAt: Date;
  }
  
  export interface Prompt {
    id: number;
    name: string;
    description?: string;
    promptText: string;
    category: string;
    variables?: string[];
    isSystem: boolean;
    isActive: boolean;
    createdBy: number;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface AIUsage {
    id: number;
    userId: number;
    modelName: string;
    provider: 'openrouter' | 'ollama';
    tokensUsed: number;
    cost: number;
    requestType: 'chat' | 'completion' | 'embedding';
    schoolId?: number;
    createdAt: Date;
  }
  
  export interface ChatRequest {
    messages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>;
    model?: string;
    provider?: 'openrouter' | 'ollama';
    temperature?: number;
    maxTokens?: number;
  }
  
  export interface ChatResponse {
    content: string;
    model: string;
    provider: string;
    tokensUsed: number;
    cost: number;
  }
  