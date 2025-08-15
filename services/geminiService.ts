
import { GoogleGenAI, Type } from "@google/genai";
import { UiLayout } from '../modules/studio/designer/types';
import { AudienceSuggestion, CampaignBrief, CampaignPlan, SeoMetadata } from "../modules/tools/types";
import { config } from './config';
import { aiProviderConfig, trackUsage } from './aiProviderConfig';
import { ollamaManager } from './ollamaManager';

// Import the new unified AI service
import { unifiedAIService, AIProvider as UnifiedAIProvider, AIServiceConfig as UnifiedAIServiceConfig, ChatResponse as UnifiedChatResponse } from './unifiedAIService';

// Initialize Gemini AI for specialized functions (fallback)
const geminiAI = config.ai.gemini.apiKey ? new GoogleGenAI({ apiKey: config.ai.gemini.apiKey }) : null;

// Multi-provider AI Service with specialized functions
export class MultiProviderAIService {
  private static instance: MultiProviderAIService;
  
  private constructor() {}
  
  static getInstance(): MultiProviderAIService {
    if (!MultiProviderAIService.instance) {
      MultiProviderAIService.instance = new MultiProviderAIService();
    }
    return MultiProviderAIService.instance;
  }

  /**
   * Generate text using the unified AI service with provider selection
   */
  async generateText(
    prompt: string, 
    systemInstruction?: string, 
    options: Partial<UnifiedAIServiceConfig> = {}
  ): Promise<UnifiedChatResponse> {
    return await unifiedAIService.generateText(prompt, {
      ...options,
      systemPrompt: systemInstruction,
    });
  }

  /**
   * Smart text generation with automatic provider selection based on use case
   */
  async smartGenerateText(
    prompt: string,
    useCase: 'general' | 'creative' | 'coding' | 'analysis' | 'fast' | 'cost-effective' = 'general',
    systemInstruction?: string,
    options: Partial<UnifiedAIServiceConfig> = {}
  ): Promise<UnifiedChatResponse> {
    return await unifiedAIService.smartGenerateText(prompt, useCase, systemInstruction, options);
  }

  /**
   * Get available models from all providers
   */
  async getAvailableModels(provider?: UnifiedAIProvider): Promise<any[]> {
    return await unifiedAIService.getAvailableModels(provider);
  }

  /**
   * Get provider status
   */
  async getProviderStatus() {
    return await unifiedAIService.getProviderStatus();
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(options: {
    startDate?: string;
    endDate?: string;
    provider?: UnifiedAIProvider;
  } = {}) {
    return await unifiedAIService.getUsageStats(options);
  }

  /**
   * Test provider connectivity
   */
  async testProvider(provider: UnifiedAIProvider): Promise<boolean> {
    return await unifiedAIService.testProvider(provider);
  }

  /**
   * Get recommended provider based on current status
   */
  async getRecommendedProvider(): Promise<UnifiedAIProvider> {
    return await unifiedAIService.getRecommendedProvider();
  }

  /**
   * Provider-specific model recommendations
   */
  getRecommendedModels(): Record<UnifiedAIProvider, Record<string, string>> {
    return unifiedAIService.getRecommendedModels();
  }

  /**
   * Cost estimation for different providers
   */
  estimateCost(provider: UnifiedAIProvider, model: string, inputTokens: number, outputTokens: number = 0): number {
    return unifiedAIService.estimateCost(provider, model, inputTokens, outputTokens);
  }

  /**
   * Get provider capabilities
   */
  getProviderCapabilities(): Record<UnifiedAIProvider, {
    textGeneration: boolean;
    imageGeneration: boolean;
    visionAnalysis: boolean;
    codeGeneration: boolean;
    streaming: boolean;
    localDeployment: boolean;
    customModels: boolean;
  }> {
    return unifiedAIService.getProviderCapabilities();
  }

  /**
   * Get recommended provider for a specific use case
   */
  getRecommendedProviderForUseCase(useCase: string): UnifiedAIProvider {
    // Use case-based provider selection
    const useCasePreferences: Record<string, UnifiedAIProvider> = {
      'cost-effective': 'ollama',
      'fast': 'ollama',
      'creative': 'openrouter',
      'coding': 'openrouter',
      'analysis': 'openrouter',
      'general': 'openrouter',
    };
    
    return useCasePreferences[useCase] || 'openrouter';
  }

  /**
   * Provider management methods
   */
  async refreshProviderStatus() {
    return await unifiedAIService.getProviderStatus();
  }

  /**
   * Get Ollama-specific information
   */
  async getOllamaInfo() {
    const status = await ollamaManager.checkStatus();
    const recommendedModels = ollamaManager.getRecommendedModels();
    const installationInstructions = ollamaManager.getInstallationInstructions();
    
    return {
      status,
      recommendedModels,
      installationInstructions,
    };
  }

  /**
   * Ollama model management
   */
  async pullOllamaModel(modelName: string, onProgress?: (progress: any) => void): Promise<boolean> {
    return await ollamaManager.pullModel(modelName, onProgress);
  }

  async deleteOllamaModel(modelName: string): Promise<boolean> {
    return await ollamaManager.deleteModel(modelName);
  }

  async testOllamaModel(modelName: string, prompt?: string) {
    return await ollamaManager.testModel(modelName, prompt);
  }

  /**
   * Provider configuration management
   */
  updateProviderConfig(provider: UnifiedAIProvider, config: any) {
    aiProviderConfig.updateProvider(provider, config);
    aiProviderConfig.saveConfiguration();
  }

  toggleProvider(provider: UnifiedAIProvider, enabled: boolean) {
    aiProviderConfig.setProviderEnabled(provider, enabled);
    aiProviderConfig.saveConfiguration();
  }

  getProviderConfig(provider: UnifiedAIProvider) {
    return aiProviderConfig.getProvider(provider);
  }

  getAllProviderConfigs() {
    return aiProviderConfig.getAllProviders();
  }

  getEnabledProviders() {
    return aiProviderConfig.getEnabledProviders();
  }
}

// Create singleton instance
export const multiProviderAI = MultiProviderAIService.getInstance();

// Legacy compatibility functions
export const generateText = async (
  prompt: string, 
  systemInstruction?: string, 
  options: Partial<UnifiedAIServiceConfig> = {}
): Promise<string> => {
  const result = await multiProviderAI.generateText(prompt, systemInstruction, options);
  return result.response;
};

// Export types for backward compatibility
export type AIProvider = UnifiedAIProvider;
export type AIServiceConfig = UnifiedAIServiceConfig;
export type ChatResponse = UnifiedChatResponse;

// Export additional utility functions
export const getProviderStatus = () => multiProviderAI.getProviderStatus();
export const getUsageStats = (options?: any) => multiProviderAI.getUsageStats(options);
export const getAvailableModels = (provider?: UnifiedAIProvider) => multiProviderAI.getAvailableModels(provider);
export const testProvider = (provider: UnifiedAIProvider) => multiProviderAI.testProvider(provider);
export const getRecommendedProvider = (useCase?: string) => multiProviderAI.getRecommendedProvider();
export const estimateCost = (provider: UnifiedAIProvider, model: string, inputTokens: number, outputTokens?: number) => 
  multiProviderAI.estimateCost(provider, model, inputTokens, outputTokens);

// Ollama-specific exports
export const getOllamaInfo = () => multiProviderAI.getOllamaInfo();
export const pullOllamaModel = (modelName: string, onProgress?: any) => multiProviderAI.pullOllamaModel(modelName, onProgress);
export const deleteOllamaModel = (modelName: string) => multiProviderAI.deleteOllamaModel(modelName);
export const testOllamaModel = (modelName: string, prompt?: string) => multiProviderAI.testOllamaModel(modelName, prompt);

// Provider configuration exports
export const updateProviderConfig = (provider: UnifiedAIProvider, config: any) => multiProviderAI.updateProviderConfig(provider, config);
export const toggleProvider = (provider: UnifiedAIProvider, enabled: boolean) => multiProviderAI.toggleProvider(provider, enabled);
export const getProviderConfig = (provider: UnifiedAIProvider) => multiProviderAI.getProviderConfig(provider);
export const getAllProviderConfigs = () => multiProviderAI.getAllProviderConfigs();
export const getEnabledProviders = () => multiProviderAI.getEnabledProviders();

const chartResponseSchema = {
  type: Type.OBJECT,
  properties: {
    chartType: {
      type: Type.STRING,
      description: "Type of chart. Recommended: 'bar', 'line', or 'pie'.",
    },
    data: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER },
        },
        required: ['name', 'value']
      },
    },
    description: {
      type: Type.STRING,
      description: "A very brief, one-sentence description of the chart's content."
    }
  },
  required: ['chartType', 'data', 'description']
};

export const generateChartData = async (prompt: string, provider?: UnifiedAIProvider): Promise<any> => {
    try {
        const fullPrompt = `Based on the following request, generate the data for a chart. If the request is ambiguous or lacks sufficient data, create a sensible example related to the topic. The data array should not be empty. Return valid JSON with chartType, data array, and description. Request: "${prompt}"`;
        
        // Try using the unified AI service first
        try {
            const response = await multiProviderAI.smartGenerateText(
                fullPrompt,
                'analysis',
                'You are a data visualization expert. Generate structured chart data in JSON format.',
                { provider: provider || 'gemini', temperature: 0.3 }
            );
            
            // Parse the response as JSON
            const jsonMatch = response.response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No valid JSON found in response');
        } catch (unifiedError) {
            console.warn('Unified AI service failed, falling back to direct Gemini:', unifiedError);
            
            // Fallback to direct Gemini API
            if (!geminiAI) {
                throw new Error('Gemini API key not configured and unified service failed');
            }
            
            const response = await geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent({
                contents: fullPrompt,
                generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema: chartResponseSchema,
                }
            });
            const jsonText = response.response.text().trim();
            return JSON.parse(jsonText);
        }
    } catch (error) {
        console.error("Error generating chart data:", error);
        if (error instanceof Error) {
            if (error.name === 'SyntaxError') {
                 throw new Error(`AI returned invalid data format. Please try rephrasing your request.`);
            }
            throw new Error(`AI Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating chart data.");
    }
};


export const generateImages = async (prompt: string, provider?: UnifiedAIProvider): Promise<string> => {
    try {
        // Try different providers based on availability and capabilities
        const preferredProvider = provider || 'gemini';
        
        if (preferredProvider === 'gemini' && geminiAI) {
            try {
                const response = await geminiAI.getImageGenerationModel('imagen-3.0-generate-001').generateImages({
                    prompt: prompt,
                    numberOfImages: 1,
                    outputOptions: {
                      mimeType: 'image/png',
                      aspectRatio: '1:1',
                    },
                });

                if (response.generatedImages && response.generatedImages.length > 0) {
                    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                    return `data:image/png;base64,${base64ImageBytes}`;
                }
                throw new Error("No images were generated by Gemini.");
            } catch (geminiError) {
                console.warn('Gemini image generation failed, trying OpenRouter:', geminiError);
                // Fall through to OpenRouter attempt
            }
        }
        
        // Try OpenRouter with DALL-E or other image models
        if (preferredProvider === 'openrouter' || preferredProvider === 'gemini') {
            try {
                const response = await fetch(`${config.ai.openrouter.baseUrl}/images/generations`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${config.ai.openrouter.apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": window.location.origin,
                        "X-Title": config.app.name,
                    },
                    body: JSON.stringify({
                        "model": "openai/dall-e-3",
                        "prompt": prompt,
                        "n": 1,
                        "size": "1024x1024",
                        "response_format": "b64_json"
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.data && data.data.length > 0) {
                        return `data:image/png;base64,${data.data[0].b64_json}`;
                    }
                }
                throw new Error("OpenRouter image generation failed");
            } catch (openrouterError) {
                console.warn('OpenRouter image generation failed:', openrouterError);
            }
        }
        
        // If all providers fail, throw an error
        throw new Error("All image generation providers failed");

    } catch (error) {
        console.error("Error generating image:", error);
         if (error instanceof Error) {
            throw new Error(`Image Generation Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the image.");
    }
};

const hobbyInfoSchema = {
    type: Type.OBJECT,
    properties: {
        introduction: {
            type: Type.STRING,
            description: "A brief, engaging, one-paragraph introduction to the hobby.",
        },
        gettingStartedTips: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
            description: "A list of 3-5 actionable tips for a beginner to get started with this hobby.",
        },
        projectIdeas: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
            description: "A list of 3-5 simple project ideas suitable for a beginner.",
        },
    },
    required: ['introduction', 'gettingStartedTips', 'projectIdeas'],
};

export const generateHobbyInfo = async (hobbyName: string, provider?: UnifiedAIProvider): Promise<any> => {
    try {
        const prompt = `Provide a brief introduction, a few getting started tips, and some beginner project ideas for the hobby: "${hobbyName}". Return the response in JSON format with introduction, gettingStartedTips array, and projectIdeas array.`;
        
        // Try using the unified AI service first
        try {
            const response = await multiProviderAI.smartGenerateText(
                prompt,
                'general',
                'You are a helpful hobby expert. Provide structured information in JSON format.',
                { provider: provider || 'openrouter', temperature: 0.7 }
            );
            
            // Parse the response as JSON
            const jsonMatch = response.response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No valid JSON found in response');
        } catch (unifiedError) {
            console.warn('Unified AI service failed, falling back to direct Gemini:', unifiedError);
            
            // Fallback to direct Gemini API
            if (!geminiAI) {
                throw new Error('Gemini API key not configured and unified service failed');
            }
            
            const response = await geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent({
                contents: prompt,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: hobbyInfoSchema,
                }
            });
            const jsonText = response.response.text().trim();
            return JSON.parse(jsonText);
        }
    } catch (error) {
        console.error("Error generating hobby info:", error);
        if (error instanceof Error) {
            if (error.name === 'SyntaxError') {
                 throw new Error(`AI returned invalid data format.`);
            }
            throw new Error(`AI Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating hobby information.");
    }
};

const uiElementSchema = {
    type: Type.OBJECT,
    properties: {
        type: {
            type: Type.STRING,
            description: "Component type. e.g., 'logo', 'search', 'button', 'nav-item', 'title', 'paragraph', 'card'.",
        },
        label: {
            type: Type.STRING,
            description: "Optional label for the element, like button text.",
        },
    },
    required: ['type'],
};

const uiLayoutSchema = {
    type: Type.OBJECT,
    properties: {
        theme: {
            type: Type.STRING,
            description: "The overall visual theme. Recommended: 'dark', 'light', or 'corporate'.",
        },
        layout: {
            type: Type.OBJECT,
            properties: {
                type: {
                    type: Type.STRING,
                    description: "Main layout structure. Recommended: 'header-sidebar-content'.",
                },
                header: {
                    type: Type.OBJECT,
                    properties: {
                        elements: {
                            type: Type.ARRAY,
                            items: uiElementSchema,
                            description: "An array of UI elements for the header.",
                        },
                    },
                },
                sidebar: {
                    type: Type.OBJECT,
                    properties: {
                        elements: {
                            type: Type.ARRAY,
                            items: uiElementSchema,
                            description: "An array of UI elements for the sidebar.",
                        },
                    },
                },
                content: {
                    type: Type.OBJECT,
                    properties: {
                        elements: {
                            type: Type.ARRAY,
                            items: uiElementSchema,
                            description: "An array of UI elements for the main content area.",
                        },
                    },
                },
            },
            required: ['type'],
        },
    },
    required: ['theme', 'layout'],
};

export const generateUiLayout = async (prompt: string, toolType: string, provider?: UnifiedAIProvider): Promise<UiLayout> => {
    try {
        const fullPrompt = `Based on the following request for a "${toolType}", generate a simple UI layout structure. Return JSON with theme and layout properties. Include header, sidebar, and content sections with appropriate UI elements. Request: "${prompt}"`;

        // Try using the unified AI service first
        try {
            const response = await multiProviderAI.smartGenerateText(
                fullPrompt,
                'creative',
                'You are a UI/UX designer. Generate structured UI layout data in JSON format.',
                { provider: provider || 'openrouter', temperature: 0.5 }
            );
            
            // Parse the response as JSON
            const jsonMatch = response.response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]) as UiLayout;
            }
            throw new Error('No valid JSON found in response');
        } catch (unifiedError) {
            console.warn('Unified AI service failed, falling back to direct Gemini:', unifiedError);
            
            // Fallback to direct Gemini API
            if (!geminiAI) {
                throw new Error('Gemini API key not configured and unified service failed');
            }

            const response = await geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent({
                contents: fullPrompt,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: uiLayoutSchema,
                }
            });

            const jsonText = response.response.text().trim();
            return JSON.parse(jsonText) as UiLayout;
        }
    } catch (error) {
        console.error("Error generating UI layout:", error);
        if (error instanceof Error) {
            if (error.name === 'SyntaxError') {
                 throw new Error(`AI returned invalid data format. Please try rephrasing your request.`);
            }
            throw new Error(`AI Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the UI layout.");
    }
};

const audienceSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        demographics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of key demographic targeting criteria (e.g., 'Age: 25-40', 'Location: Urban areas')."
        },
        interests: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of interests the target audience might have (e.g., 'Technology', 'Science Fiction', 'Startups')."
        },
        behaviors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of online behaviors or characteristics (e.g., 'Engaged Shoppers', 'Early Adopters of Technology')."
        },
    },
    required: ['demographics', 'interests', 'behaviors'],
};

export const generateAudienceSuggestions = async (prompt: string, provider?: UnifiedAIProvider): Promise<AudienceSuggestion> => {
    try {
        const fullPrompt = `Based on the following product/service description, generate a detailed target audience profile for a marketing campaign. Return JSON with demographics, interests, and behaviors arrays. Description: "${prompt}"`;
        
        // Try using the unified AI service first
        try {
            const response = await multiProviderAI.smartGenerateText(
                fullPrompt,
                'analysis',
                'You are a marketing expert. Generate structured audience analysis in JSON format.',
                { provider: provider || 'openrouter', temperature: 0.6 }
            );
            
            // Parse the response as JSON
            const jsonMatch = response.response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No valid JSON found in response');
        } catch (unifiedError) {
            console.warn('Unified AI service failed, falling back to direct Gemini:', unifiedError);
            
            // Fallback to direct Gemini API
            if (!geminiAI) {
                throw new Error('Gemini API key not configured and unified service failed');
            }
            
            const response = await geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent({
                contents: fullPrompt,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: audienceSuggestionSchema,
                }
            });
            const jsonText = response.response.text().trim();
            return JSON.parse(jsonText);
        }
    } catch (error) {
        console.error("Error generating audience suggestions:", error);
        if (error instanceof Error) {
            if (error.name === 'SyntaxError') {
                 throw new Error(`AI returned invalid data format.`);
            }
            throw new Error(`AI Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating audience suggestions.");
    }
};

const campaignPlanSchema = {
    type: Type.OBJECT,
    properties: {
        campaignTitle: { type: Type.STRING, description: "A catchy, short title for the campaign." },
        slogan: { type: Type.STRING, description: "A memorable slogan for the campaign." },
        targetPersona: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "A descriptive name for the persona (e.g., 'Tech-Forward Tina')." },
                demographics: { type: Type.STRING, description: "A summary of the persona's key demographics." },
                painPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of key problems or challenges the persona faces." },
            },
            required: ["name", "demographics", "painPoints"]
        },
        coreMessaging: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of the main messages the campaign should communicate." },
        strategicAngles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of unique angles or hooks for the campaign." },
        channelStrategy: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING, description: "The recommended marketing platform (e.g., 'Instagram', 'LinkedIn')." },
                    rationale: { type: Type.STRING, description: "Why this platform is a good fit for the target audience." },
                    contentIdeas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific content ideas for this platform." },
                },
                required: ["platform", "rationale", "contentIdeas"]
            }
        },
        sampleAdCopy: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING },
                    body: { type: Type.STRING }
                },
                required: ["headline", "body"]
            }
        },
        kpis: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of Key Performance Indicators to measure success." },
    },
    required: ["campaignTitle", "slogan", "targetPersona", "coreMessaging", "strategicAngles", "channelStrategy", "sampleAdCopy", "kpis"]
};

export const generateCampaignPlan = async (brief: CampaignBrief, provider?: UnifiedAIProvider): Promise<CampaignPlan> => {
     try {
        const fullPrompt = `Act as an expert marketing strategist. Based on the following campaign brief, generate a comprehensive marketing plan in JSON format.
        
        Product Name: ${brief.productName}
        Description: ${brief.productDescription}
        Campaign Goal: ${brief.campaignGoal}
        Target Audience: ${brief.targetAudience}
        Budget: ${brief.budget}
        
        Create a detailed, structured plan that includes a campaign title, slogan, a target persona, core messaging points, strategic angles, a multi-channel strategy with content ideas, sample ad copy, and relevant KPIs.`;

        // Try using the unified AI service first
        try {
            const response = await multiProviderAI.smartGenerateText(
                fullPrompt,
                'creative',
                'You are an expert marketing strategist. Generate comprehensive campaign plans in JSON format.',
                { provider: provider || 'openrouter', temperature: 0.7 }
            );
            
            // Parse the response as JSON
            const jsonMatch = response.response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]) as CampaignPlan;
            }
            throw new Error('No valid JSON found in response');
        } catch (unifiedError) {
            console.warn('Unified AI service failed, falling back to direct Gemini:', unifiedError);
            
            // Fallback to direct Gemini API
            if (!geminiAI) {
                throw new Error('Gemini API key not configured and unified service failed');
            }

            const response = await geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent({
                contents: fullPrompt,
                generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema: campaignPlanSchema,
                }
            });

            const jsonText = response.response.text().trim();
            return JSON.parse(jsonText) as CampaignPlan;
        }
    } catch (error) {
        console.error("Error generating campaign plan:", error);
        if (error instanceof Error) {
            if (error.name === 'SyntaxError') {
                 throw new Error(`AI returned invalid data format. Please try rephrasing your request.`);
            }
            throw new Error(`AI Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the campaign plan.");
    }
};

const seoMetadataSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'A compelling, SEO-friendly title, under 60 characters.'
      },
      description: {
        type: Type.STRING,
        description: 'An engaging meta description, under 160 characters, with a call to action.'
      }
    },
    required: ['title', 'description']
  }
};

export const generateSeoMetadata = async (topic: string, audience: string, tone: string, provider?: UnifiedAIProvider): Promise<SeoMetadata[]> => {
    try {
        const fullPrompt = `As an expert SEO copywriter, generate 3-5 compelling and unique title and meta description pairs for a web page about "${topic}".
        ${audience ? `The target audience is ${audience}.` : ''}
        ${tone ? `The tone of voice should be ${tone}.` : ''}
        Ensure titles are under 60 characters and descriptions are under 160 characters. Each description should include a subtle call to action. Return as JSON array.`;

        // Try using the unified AI service first
        try {
            const response = await multiProviderAI.smartGenerateText(
                fullPrompt,
                'creative',
                'You are an expert SEO copywriter. Generate structured SEO metadata in JSON format.',
                { provider: provider || 'openrouter', temperature: 0.6 }
            );
            
            // Parse the response as JSON
            const jsonMatch = response.response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]) as SeoMetadata[];
            }
            throw new Error('No valid JSON array found in response');
        } catch (unifiedError) {
            console.warn('Unified AI service failed, falling back to direct Gemini:', unifiedError);
            
            // Fallback to direct Gemini API
            if (!geminiAI) {
                throw new Error('Gemini API key not configured and unified service failed');
            }

            const response = await geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent({
                contents: fullPrompt,
                generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema: seoMetadataSchema,
                }
            });

            const jsonText = response.response.text().trim();
            return JSON.parse(jsonText) as SeoMetadata[];
        }
    } catch (error) {
        console.error("Error generating SEO metadata:", error);
        if (error instanceof Error) {
            if (error.name === 'SyntaxError') {
                 throw new Error(`AI returned invalid data format. Please try rephrasing your request.`);
            }
            throw new Error(`AI Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the SEO metadata.");
    }
};

// Export additional utility functions for multi-provider management
export const getProviderCapabilities = () => multiProviderAI.getProviderCapabilities();
export const getRecommendedModels = () => multiProviderAI.getRecommendedModels();

// Re-export unified AI service for direct access
export { unifiedAIService } from './unifiedAIService';
