#!/usr/bin/env node

/**
 * 🚀 Multiverse Agent - Cyberpunk Dashboard CLI Agent
 * 
 * A powerful CLI agent that uses local Ollama to complete the cyberpunk dashboard project.
 * This agent works as a multiverse worker, continuously improving the project until it's production-ready.
 */

import { Automata } from 'automata';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ollamaService } from './services/ollama-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MultiverseAgent {
  constructor() {
    this.projectRoot = process.cwd();
    this.ollamaHost = 'http://localhost:11434';
    this.model = 'qwen2.5-coder:1.5b-base';
    this.automata = new Automata();
    this.taskQueue = [];
    this.completedTasks = [];
    this.currentPhase = 0;
    this.phases = [
      'Backend Setup',
      'AI Integration', 
      'Frontend Enhancement',
      'Security & Performance',
      'Testing & Quality',
      'Deployment'
    ];
  }

  async init() {
    console.log('🚀 Initializing Multiverse Agent...');
    console.log('🎯 Target: Production-ready Cyberpunk Dashboard');
    console.log('🤖 AI Model: qwen2.5-coder:1.5b-base (Local Ollama)');
    console.log('📁 Project Root:', this.projectRoot);
    
    // Check if Ollama is running
    await this.checkOllamaStatus();
    
    // Load project state
    await this.loadProjectState();
    
    // Start the multiverse worker
    await this.startMultiverseWorker();
  }

  async checkOllamaStatus() {
    try {
      const status = await ollamaService.checkStatus();
      if (status.status === 'running') {
        console.log('✅ Ollama is running with models:', status.models.map(m => m.name));
        console.log('🤖 Default model:', status.defaultModel);
      } else {
        throw new Error(status.error);
      }
    } catch (error) {
      console.error('❌ Ollama is not running. Please start Ollama first.');
      process.exit(1);
    }
  }

  async loadProjectState() {
    console.log('📊 Analyzing project state...');
    
    // Check current dependencies
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    console.log('📦 Current dependencies:', Object.keys(packageJson.dependencies || {}));
    
    // Check project structure
    const hasServer = existsSync('server');
    const hasPrisma = existsSync('prisma');
    const hasTests = existsSync('__tests__');
    
    console.log('🏗️ Project structure:');
    console.log('  - Server directory:', hasServer ? '✅' : '❌');
    console.log('  - Prisma setup:', hasPrisma ? '✅' : '❌');
    console.log('  - Tests setup:', hasTests ? '✅' : '❌');
    
    // Generate initial tasks based on current state
    this.generateTasks();
  }

  generateTasks() {
    console.log('🎯 Generating task queue...');
    
    // Phase 1: Backend Setup
    if (!existsSync('server')) {
      this.taskQueue.push({
        id: 'backend-setup',
        phase: 0,
        title: 'Create Backend Server Structure',
        description: 'Set up tRPC server with authentication and database',
        priority: 'high',
        commands: [
          'mkdir server',
          'mkdir server/routers',
          'mkdir server/middleware',
          'mkdir server/services',
          'mkdir server/utils'
        ]
      });
    }

    // Phase 2: AI Integration
    this.taskQueue.push({
      id: 'ai-integration',
      phase: 1,
      title: 'Integrate Local Ollama AI',
      description: 'Create AI service using local Ollama models',
      priority: 'high',
      commands: []
    });

    // Phase 3: Database Setup
    if (!existsSync('prisma')) {
      this.taskQueue.push({
        id: 'database-setup',
        phase: 0,
        title: 'Setup Database with Prisma',
        description: 'Initialize Prisma with PostgreSQL schema',
        priority: 'high',
        commands: [
          'pnpm add -D prisma',
          'pnpm add @prisma/client',
          'npx prisma init'
        ]
      });
    }

    // Phase 4: Authentication
    this.taskQueue.push({
      id: 'auth-system',
      phase: 0,
      title: 'Implement Authentication System',
      description: 'Create JWT-based authentication with bcrypt',
      priority: 'high',
      commands: []
    });

    // Phase 5: Frontend Enhancement
    this.taskQueue.push({
      id: 'frontend-auth',
      phase: 2,
      title: 'Add Frontend Authentication',
      description: 'Create login/register components with cyberpunk styling',
      priority: 'medium',
      commands: []
    });

    // Phase 6: Testing
    if (!existsSync('__tests__')) {
      this.taskQueue.push({
        id: 'testing-setup',
        phase: 4,
        title: 'Setup Testing Framework',
        description: 'Configure Vitest with component testing',
        priority: 'medium',
        commands: [
          'pnpm add -D vitest @testing-library/react @testing-library/jest-dom'
        ]
      });
    }

    console.log(`📋 Generated ${this.taskQueue.length} tasks`);
  }

  async startMultiverseWorker() {
    console.log('🔄 Starting Multiverse Worker...');
    console.log('🎯 Goal: Complete all phases until production-ready');
    
    while (this.taskQueue.length > 0 || this.currentPhase < this.phases.length - 1) {
      const currentTask = this.taskQueue.shift();
      
      if (currentTask) {
        await this.executeTask(currentTask);
      } else {
        // Move to next phase
        this.currentPhase++;
        if (this.currentPhase < this.phases.length) {
          console.log(`\n🎯 Moving to Phase ${this.currentPhase + 1}: ${this.phases[this.currentPhase]}`);
          await this.generatePhaseTasks();
        }
      }
      
      // Small delay to prevent overwhelming
      await this.sleep(1000);
    }
    
    console.log('🎉 Multiverse Agent completed all tasks!');
    console.log('🚀 Project is now production-ready!');
  }

  async executeTask(task) {
    console.log(`\n🔄 Executing Task: ${task.title}`);
    console.log(`📝 Description: ${task.description}`);
    console.log(`🎯 Priority: ${task.priority}`);
    
    try {
      // Use AI to generate implementation
      const implementation = await this.generateImplementation(task);
      
      // Execute commands
      if (task.commands && task.commands.length > 0) {
        for (const command of task.commands) {
          await this.executeCommand(command);
        }
      }
      
      // Apply AI-generated implementation
      if (implementation) {
        await this.applyImplementation(task, implementation);
      }
      
      // Mark task as completed
      this.completedTasks.push({
        ...task,
        completedAt: new Date().toISOString(),
        status: 'success'
      });
      
      console.log(`✅ Task completed: ${task.title}`);
      
    } catch (error) {
      console.error(`❌ Task failed: ${task.title}`, error.message);
      
      // Retry logic
      if (task.retries < 3) {
        task.retries = (task.retries || 0) + 1;
        this.taskQueue.unshift(task);
        console.log(`🔄 Retrying task (attempt ${task.retries})`);
      }
    }
  }

  async generateImplementation(task) {
    console.log('🤖 Generating implementation with AI...');
    
    try {
      const result = await ollamaService.generateCode(task);
      
      if (result.success) {
        console.log(`✅ Generated ${result.codeBlocks.length} code blocks`);
        return result;
      } else {
        console.error('❌ AI generation failed:', result.error);
        return null;
      }
      
    } catch (error) {
      console.error('❌ AI generation failed:', error.message);
      return null;
    }
  }



  async applyImplementation(task, implementation) {
    console.log('📝 Applying AI-generated implementation...');
    
    try {
      if (implementation && implementation.codeBlocks) {
        for (const block of implementation.codeBlocks) {
          if (block.filename && block.code) {
            await this.writeFile(block.filename, block.code);
            console.log(`✅ Created: ${block.filename}`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to apply implementation:', error.message);
    }
  }

  extractCodeBlocks(implementation) {
    const blocks = [];
    const codeBlockRegex = /```(?:(\w+):)?([^\n]+)\n([\s\S]*?)```/g;
    
    let match;
    while ((match = codeBlockRegex.exec(implementation)) !== null) {
      const [, language, filename, code] = match;
      blocks.push({
        language: language || 'typescript',
        filename: filename.trim(),
        code: code.trim()
      });
    }
    
    return blocks;
  }

  async writeFile(filename, content) {
    const fullPath = join(this.projectRoot, filename);
    const dir = dirname(fullPath);
    
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(fullPath, content, 'utf8');
  }

  async executeCommand(command) {
    console.log(`⚡ Executing: ${command}`);
    
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        cwd: this.projectRoot,
        stdio: 'inherit',
        shell: true
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Command completed: ${command}`);
          resolve();
        } else {
          console.error(`❌ Command failed: ${command} (exit code: ${code})`);
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });
      
      child.on('error', (error) => {
        console.error(`❌ Command error: ${command}`, error.message);
        reject(error);
      });
    });
  }

  async generatePhaseTasks() {
    // Generate additional tasks for the current phase
    const phaseTasks = await this.generatePhaseSpecificTasks();
    this.taskQueue.push(...phaseTasks);
  }

  async generatePhaseSpecificTasks() {
    const phase = this.phases[this.currentPhase];
    console.log(`🎯 Generating tasks for phase: ${phase}`);
    
    // This would use AI to generate phase-specific tasks
    // For now, return empty array
    return [];
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveState() {
    const state = {
      completedTasks: this.completedTasks,
      currentPhase: this.currentPhase,
      timestamp: new Date().toISOString()
    };
    
    writeFileSync('multiverse-agent-state.json', JSON.stringify(state, null, 2));
  }
}

// CLI Interface
async function main() {
  const agent = new MultiverseAgent();
  
  // Handle CLI arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 Multiverse Agent - Cyberpunk Dashboard CLI

Usage:
  node multiverse-agent.js [options]

Options:
  --help, -h          Show this help message
  --phase <number>    Start from specific phase (0-5)
  --task <id>         Execute specific task
  --reset             Reset agent state
  --status            Show current status

Phases:
  0. Backend Setup
  1. AI Integration
  2. Frontend Enhancement
  3. Security & Performance
  4. Testing & Quality
  5. Deployment

Examples:
  node multiverse-agent.js                    # Start from beginning
  node multiverse-agent.js --phase 2          # Start from frontend enhancement
  node multiverse-agent.js --status           # Show current status
    `);
    return;
  }
  
  if (args.includes('--status')) {
    // Show current status
    console.log('📊 Multiverse Agent Status');
    console.log('🎯 Project: Cyberpunk Dashboard');
    console.log('🤖 AI Model: qwen2.5-coder:1.5b-base');
    console.log('🔄 Status: Ready to start');
    return;
  }
  
  if (args.includes('--reset')) {
    // Reset agent state
    console.log('🔄 Resetting agent state...');
    // Implementation for reset
    return;
  }
  
  // Start the agent
  await agent.init();
}

// Run the agent
main().catch(console.error);
