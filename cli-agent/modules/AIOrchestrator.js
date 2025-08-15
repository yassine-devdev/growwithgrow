/**
 * AI Orchestrator Module
 * Manages multi-model AI integration with intelligent fallbacks
 */

class AIOrchestrator {
  constructor() {
    this.models = {
      ollama: {
        primary: 'qwen2.5-coder:1.5b-base',
        fallback: 'llama3.1:8b',
        large: 'gpt-oss:20b'
      },
      cloud: {
        openai: process.env.OPENAI_API_KEY,
        anthropic: process.env.ANTHROPIC_API_KEY
      }
    };
    this.modelPerformance = new Map();
    this.requestHistory = [];
    this.ollamaAvailable = false;
    this.cloudAvailable = false;
  }

  async initialize() {
    this.log('🤖 Initializing AI Orchestrator...', 'info');
    
    // Check Ollama availability
    try {
      execSync('ollama list', { stdio: 'pipe' });
      this.ollamaAvailable = true;
      this.log('✅ Ollama is available', 'success');
    } catch (error) {
      this.log('⚠️ Ollama is not available', 'warning');
      this.ollamaAvailable = false;
    }

    // Initialize cloud models if API keys are available
    this.cloudAvailable = !!(this.models.cloud.openai || this.models.cloud.anthropic);
    if (this.cloudAvailable) {
      this.log('✅ Cloud AI models are available', 'success');
    } else {
      this.log('⚠️ No cloud AI models configured', 'warning');
    }

    this.log(`🤖 AI Orchestrator initialized with ${this.getAvailableModelsCount()} models`, 'success');
  }

  getAvailableModelsCount() {
    let count = 0;
    if (this.ollamaAvailable) count += 3; // primary, fallback, large
    if (this.models.cloud.openai) count++;
    if (this.models.cloud.anthropic) count++;
    return count;
  }

  async queryAI(prompt, context = {}, preferredModel = 'auto') {
    this.log('🤖 Processing AI query...', 'info');
    
    const startTime = Date.now();
    const models = this.selectOptimalModels(context, preferredModel);
    
    for (const model of models) {
      try {
        const response = await this.queryModel(model, prompt, context);
        const responseTime = Date.now() - startTime;
        
        this.recordModelPerformance(model, true, responseTime);
        this.recordRequest(prompt, response, model, responseTime);
        
        this.log(`🤖 AI response received from ${model.name} (${responseTime}ms)`, 'success');
        return response;
      } catch (error) {
        this.recordModelPerformance(model, false);
        this.log(`⚠️ Model ${model.name} failed: ${error.message}`, 'warning');
      }
    }

    throw new Error('All AI models failed to respond');
  }

  selectOptimalModels(context, preferredModel) {
    const models = [];

    if (preferredModel === 'auto') {
      // Select based on context and performance history
      if (context.type === 'code_analysis') {
        models.push({ type: 'ollama', name: this.models.ollama.primary });
      } else if (context.type === 'complex_reasoning') {
        models.push({ type: 'ollama', name: this.models.ollama.large });
      } else if (context.type === 'security_analysis') {
        models.push({ type: 'ollama', name: this.models.ollama.primary });
      } else {
        models.push({ type: 'ollama', name: this.models.ollama.primary });
      }

      // Add fallbacks
      models.push({ type: 'ollama', name: this.models.ollama.fallback });
      
      if (this.cloudAvailable) {
        if (this.models.cloud.openai) {
          models.push({ type: 'openai', name: 'gpt-4' });
        }
        if (this.models.cloud.anthropic) {
          models.push({ type: 'anthropic', name: 'claude-3-sonnet-20240229' });
        }
      }
    } else {
      // Use specific model if requested
      const [modelType, modelName] = preferredModel.split(':');
      models.push({ type: modelType, name: modelName || this.models.ollama.primary });
    }

    return models.filter(model => this.isModelAvailable(model));
  }

  async queryModel(model, prompt, context) {
    const startTime = Date.now();

    switch (model.type) {
      case 'ollama':
        return await this.queryOllama(model.name, prompt, context);
      case 'openai':
        return await this.queryOpenAI(model.name, prompt, context);
      case 'anthropic':
        return await this.queryAnthropic(model.name, prompt, context);
      default:
        throw new Error(`Unknown model type: ${model.type}`);
    }
  }

  async queryOllama(modelName, prompt, context) {
    const startTime = Date.now();
    
    const fullPrompt = this.buildPrompt(prompt, context);
    
    try {
      const result = execSync(`ollama run ${modelName} "${fullPrompt}"`, { 
        encoding: 'utf8',
        timeout: 60000 
      });

      return {
        response: result.trim(),
        model: modelName,
        type: 'ollama',
        responseTime: Date.now() - startTime,
        confidence: this.calculateConfidence(result, context)
      };
    } catch (error) {
      throw new Error(`Ollama query failed: ${error.message}`);
    }
  }

  async queryOpenAI(modelName, prompt, context) {
    if (!this.models.cloud.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const startTime = Date.now();
    
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: modelName,
        messages: [
          { role: 'system', content: this.buildSystemPrompt(context) },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.models.cloud.openai}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return {
        response: response.data.choices[0].message.content,
        model: modelName,
        type: 'openai',
        responseTime: Date.now() - startTime,
        confidence: this.calculateConfidence(response.data.choices[0].message.content, context)
      };
    } catch (error) {
      throw new Error(`OpenAI query failed: ${error.message}`);
    }
  }

  async queryAnthropic(modelName, prompt, context) {
    if (!this.models.cloud.anthropic) {
      throw new Error('Anthropic API key not configured');
    }

    const startTime = Date.now();
    
    try {
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: modelName,
        max_tokens: 2000,
        messages: [
          { role: 'user', content: prompt }
        ]
      }, {
        headers: {
          'x-api-key': this.models.cloud.anthropic,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      });

      return {
        response: response.data.content[0].text,
        model: modelName,
        type: 'anthropic',
        responseTime: Date.now() - startTime,
        confidence: this.calculateConfidence(response.data.content[0].text, context)
      };
    } catch (error) {
      throw new Error(`Anthropic query failed: ${error.message}`);
    }
  }

  buildPrompt(prompt, context) {
    let fullPrompt = '';
    
    if (context.type === 'code_analysis') {
      fullPrompt = `You are an expert software engineer analyzing code. Focus on code quality, performance, and best practices. ${prompt}`;
    } else if (context.type === 'production_optimization') {
      fullPrompt = `You are a DevOps expert optimizing for production. Focus on deployment, scalability, and reliability. ${prompt}`;
    } else if (context.type === 'security_analysis') {
      fullPrompt = `You are a security expert analyzing potential vulnerabilities. Focus on security best practices and threat mitigation. ${prompt}`;
    } else if (context.type === 'architecture_design') {
      fullPrompt = `You are a software architect designing systems. Focus on scalability, maintainability, and best practices. ${prompt}`;
    } else {
      fullPrompt = `You are an expert software development assistant. ${prompt}`;
    }

    return fullPrompt;
  }

  buildSystemPrompt(context) {
    const basePrompt = 'You are an expert software development assistant.';
    
    if (context.type === 'code_analysis') {
      return `${basePrompt} You specialize in code quality, performance, and best practices. Provide detailed, actionable feedback.`;
    } else if (context.type === 'production_optimization') {
      return `${basePrompt} You specialize in production deployment, DevOps, and system optimization. Focus on practical, implementable solutions.`;
    } else if (context.type === 'security_analysis') {
      return `${basePrompt} You specialize in security analysis, vulnerability assessment, and secure coding practices. Be thorough and specific.`;
    } else if (context.type === 'architecture_design') {
      return `${basePrompt} You specialize in software architecture, system design, and scalability. Provide well-reasoned recommendations.`;
    }

    return basePrompt;
  }

  calculateConfidence(response, context) {
    // Simple confidence calculation based on response quality
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for longer, detailed responses
    if (response.length > 200) confidence += 0.2;
    if (response.length > 500) confidence += 0.1;
    
    // Increase confidence for structured responses
    if (response.includes('\n') && response.split('\n').length > 3) confidence += 0.1;
    
    // Context-specific confidence adjustments
    if (context.type === 'code_analysis') {
      confidence += 0.1;
    } else if (context.type === 'security_analysis') {
      confidence += 0.15;
    } else if (context.type === 'production_optimization') {
      confidence += 0.1;
    }
    
    return Math.min(1.0, confidence);
  }

  recordModelPerformance(model, success, responseTime = 0) {
    const key = `${model.type}:${model.name}`;
    if (!this.modelPerformance.has(key)) {
      this.modelPerformance.set(key, {
        successes: 0,
        failures: 0,
        avgResponseTime: 0,
        totalRequests: 0,
        lastUsed: new Date().toISOString()
      });
    }

    const stats = this.modelPerformance.get(key);
    stats.totalRequests++;
    stats.lastUsed = new Date().toISOString();
    
    if (success) {
      stats.successes++;
      if (responseTime > 0) {
        stats.avgResponseTime = (stats.avgResponseTime * (stats.successes - 1) + responseTime) / stats.successes;
      }
    } else {
      stats.failures++;
    }

    this.modelPerformance.set(key, stats);
  }

  recordRequest(prompt, response, model, responseTime) {
    this.requestHistory.push({
      timestamp: new Date().toISOString(),
      prompt: prompt.substring(0, 100) + '...', // Truncate for storage
      model: `${model.type}:${model.name}`,
      responseTime,
      confidence: response.confidence,
      responseLength: response.response.length
    });

    // Keep only last 100 requests
    if (this.requestHistory.length > 100) {
      this.requestHistory = this.requestHistory.slice(-100);
    }
  }

  isModelAvailable(model) {
    if (model.type === 'ollama') {
      return this.ollamaAvailable;
    } else if (model.type === 'openai') {
      return !!this.models.cloud.openai;
    } else if (model.type === 'anthropic') {
      return !!this.models.cloud.anthropic;
    }
    return false;
  }

  async generateOptimizations(analysis) {
    const prompt = `
    Analyze this project and suggest specific optimizations:
    
    Structure Score: ${analysis.structure.score}
    Code Quality Score: ${analysis.codeQuality.score}
    Security Issues: ${analysis.security.vulnerabilities.length}
    Performance Score: ${analysis.performance.score}
    Production Readiness: ${analysis.production.score}
    
    Provide specific, actionable optimizations in JSON format with the following structure:
    {
      "optimizations": [
        {
          "type": "optimization_type",
          "description": "Detailed description",
          "priority": "high|medium|low",
          "estimatedImpact": "Expected improvement",
          "actions": ["Action 1", "Action 2"]
        }
      ]
    }
    `;

    const response = await this.queryAI(prompt, { type: 'production_optimization' });
    
    try {
      const parsed = JSON.parse(response.response);
      return parsed.optimizations || [];
    } catch (error) {
      // Fallback to simple parsing
      return this.parseOptimizationsFromText(response.response);
    }
  }

  parseOptimizationsFromText(text) {
    const optimizations = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.includes('optimize') || line.includes('improve') || line.includes('add')) {
        optimizations.push({
          type: 'general',
          description: line.trim(),
          priority: 'medium',
          estimatedImpact: 'Unknown',
          actions: [line.trim()]
        });
      }
    });

    return optimizations;
  }

  getModelPerformanceStats() {
    const stats = {};
    for (const [key, data] of this.modelPerformance) {
      stats[key] = {
        successRate: data.successes / data.totalRequests,
        avgResponseTime: data.avgResponseTime,
        totalRequests: data.totalRequests,
        lastUsed: data.lastUsed
      };
    }
    return stats;
  }

  getBestModelForContext(context) {
    const availableModels = this.modelPerformance;
    let bestModel = null;
    let bestScore = -1;

    for (const [key, stats] of availableModels) {
      if (this.isModelAvailable(this.parseModelKey(key))) {
        const score = this.calculateModelScore(stats, context);
        if (score > bestScore) {
          bestScore = score;
          bestModel = this.parseModelKey(key);
        }
      }
    }

    return bestModel;
  }

  calculateModelScore(stats, context) {
    let score = stats.successRate || 0.5;
    
    // Penalize slow response times
    if (stats.avgResponseTime > 10000) score -= 0.2;
    else if (stats.avgResponseTime > 5000) score -= 0.1;
    
    // Boost recent usage
    const lastUsed = new Date(stats.lastUsed);
    const daysSinceLastUse = (Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastUse < 1) score += 0.1;
    
    // Context-specific adjustments
    if (context.type === 'code_analysis' && stats.successRate > 0.8) score += 0.1;
    if (context.type === 'security_analysis' && stats.successRate > 0.9) score += 0.15;
    
    return Math.max(0, Math.min(1, score));
  }

  parseModelKey(key) {
    const [type, name] = key.split(':');
    return { type, name };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.cyan,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };
    
    const prefix = `[${timestamp}] 🤖 AI ORCHESTRATOR:`;
    const coloredMessage = colors[type] ? colors[type](message) : message;
    
    console.log(`${prefix} ${coloredMessage}`);
  }
}

module.exports = AIOrchestrator;
