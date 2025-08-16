#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EnvironmentManager {
  constructor() {
    this.configDir = path.join(process.cwd(), 'config', 'environments');
    this.currentEnvFile = path.join(process.cwd(), '.env');
    this.backupDir = path.join(process.cwd(), 'config', 'backups');
  }

  async initialize() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  getAvailableEnvironments() {
    if (!fs.existsSync(this.configDir)) {
      return [];
    }
    
    return fs.readdirSync(this.configDir)
      .filter(file => file.endsWith('.env'))
      .map(file => file.replace('.env', ''));
  }

  getCurrentEnvironment() {
    if (!fs.existsSync(this.currentEnvFile)) {
      return null;
    }
    
    const content = fs.readFileSync(this.currentEnvFile, 'utf8');
    const nodeEnvMatch = content.match(/NODE_ENV=(.+)/);
    return nodeEnvMatch ? nodeEnvMatch[1].trim() : null;
  }

  backupCurrentEnvironment() {
    if (!fs.existsSync(this.currentEnvFile)) {
      return null;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const currentEnv = this.getCurrentEnvironment() || 'unknown';
    const backupPath = path.join(this.backupDir, `${currentEnv}-${timestamp}.env`);
    
    fs.copyFileSync(this.currentEnvFile, backupPath);
    console.log(`📦 Current environment backed up to: ${backupPath}`);
    
    return backupPath;
  }

  switchEnvironment(targetEnv) {
    const envFile = path.join(this.configDir, `${targetEnv}.env`);
    
    if (!fs.existsSync(envFile)) {
      throw new Error(`Environment file not found: ${envFile}`);
    }
    
    // Backup current environment
    this.backupCurrentEnvironment();
    
    // Copy target environment
    fs.copyFileSync(envFile, this.currentEnvFile);
    
    console.log(`✅ Switched to ${targetEnv} environment`);
    return true;
  }

  validateEnvironment(envName) {
    const envFile = path.join(this.configDir, `${envName}.env`);
    
    if (!fs.existsSync(envFile)) {
      throw new Error(`Environment file not found: ${envFile}`);
    }
    
    const content = fs.readFileSync(envFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    const requiredVars = [
      'NODE_ENV',
      'PORT',
      'DB_HOST',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
      'JWT_SECRET'
    ];
    
    const missingVars = [];
    const presentVars = [];
    
    requiredVars.forEach(varName => {
      const found = lines.some(line => line.startsWith(`${varName}=`));
      if (found) {
        presentVars.push(varName);
      } else {
        missingVars.push(varName);
      }
    });
    
    console.log(`📋 Environment validation for ${envName}:`);
    console.log(`  ✅ Present variables: ${presentVars.join(', ')}`);
    
    if (missingVars.length > 0) {
      console.log(`  ❌ Missing variables: ${missingVars.join(', ')}`);
      return { valid: false, missing: missingVars };
    }
    
    console.log(`  🎉 All required variables present`);
    return { valid: true, missing: [] };
  }

  compareEnvironments(env1, env2) {
    const env1File = path.join(this.configDir, `${env1}.env`);
    const env2File = path.join(this.configDir, `${env2}.env`);
    
    if (!fs.existsSync(env1File) || !fs.existsSync(env2File)) {
      throw new Error('One or both environment files not found');
    }
    
    const parseEnvFile = (filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      const vars = {};
      
      content.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          vars[key] = valueParts.join('=');
        }
      });
      
      return vars;
    };
    
    const vars1 = parseEnvFile(env1File);
    const vars2 = parseEnvFile(env2File);
    
    const allKeys = new Set([...Object.keys(vars1), ...Object.keys(vars2)]);
    const differences = [];
    const onlyIn1 = [];
    const onlyIn2 = [];
    
    allKeys.forEach(key => {
      if (key in vars1 && key in vars2) {
        if (vars1[key] !== vars2[key]) {
          differences.push({
            key,
            [env1]: vars1[key],
            [env2]: vars2[key]
          });
        }
      } else if (key in vars1) {
        onlyIn1.push(key);
      } else {
        onlyIn2.push(key);
      }
    });
    
    console.log(`📊 Environment comparison: ${env1} vs ${env2}`);
    
    if (differences.length > 0) {
      console.log('\n🔄 Different values:');
      differences.forEach(diff => {
        console.log(`  ${diff.key}:`);
        console.log(`    ${env1}: ${diff[env1]}`);
        console.log(`    ${env2}: ${diff[env2]}`);
      });
    }
    
    if (onlyIn1.length > 0) {
      console.log(`\n📝 Only in ${env1}: ${onlyIn1.join(', ')}`);
    }
    
    if (onlyIn2.length > 0) {
      console.log(`\n📝 Only in ${env2}: ${onlyIn2.join(', ')}`);
    }
    
    if (differences.length === 0 && onlyIn1.length === 0 && onlyIn2.length === 0) {
      console.log('\n✅ Environments are identical');
    }
    
    return { differences, onlyIn1, onlyIn2 };
  }

  createEnvironmentTemplate(envName) {
    const templatePath = path.join(this.configDir, `${envName}.env`);
    
    if (fs.existsSync(templatePath)) {
      throw new Error(`Environment file already exists: ${templatePath}`);
    }
    
    const template = `# ${envName.toUpperCase()} Environment Configuration
NODE_ENV=${envName}
PORT=4000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${envName}_app
DB_USER=postgres
DB_PASSWORD=
DB_SSL=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Authentication
JWT_SECRET=
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# External APIs
GOOGLE_AI_API_KEY=
OPENAI_API_KEY=

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_MONITORING=false
ENABLE_CACHING=true

# Security
HELMET_ENABLED=true
RATE_LIMITING_ENABLED=true
CORS_ENABLED=true
`;
    
    fs.writeFileSync(templatePath, template);
    console.log(`✅ Environment template created: ${templatePath}`);
    
    return templatePath;
  }

  promoteEnvironment(sourceEnv, targetEnv) {
    console.log(`🚀 Promoting ${sourceEnv} configuration to ${targetEnv}...`);
    
    const sourceFile = path.join(this.configDir, `${sourceEnv}.env`);
    const targetFile = path.join(this.configDir, `${targetEnv}.env`);
    
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`Source environment file not found: ${sourceFile}`);
    }
    
    // Backup target environment if it exists
    if (fs.existsSync(targetFile)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `${targetEnv}-${timestamp}.env`);
      fs.copyFileSync(targetFile, backupPath);
      console.log(`📦 Target environment backed up to: ${backupPath}`);
    }
    
    // Copy source to target
    let content = fs.readFileSync(sourceFile, 'utf8');
    
    // Update NODE_ENV to match target environment
    content = content.replace(/NODE_ENV=.+/, `NODE_ENV=${targetEnv}`);
    
    // Update database name if it follows the pattern
    content = content.replace(
      new RegExp(`DB_NAME=${sourceEnv}_app`, 'g'),
      `DB_NAME=${targetEnv}_app`
    );
    
    fs.writeFileSync(targetFile, content);
    console.log(`✅ Environment promoted from ${sourceEnv} to ${targetEnv}`);
    
    return targetFile;
  }

  listBackups() {
    if (!fs.existsSync(this.backupDir)) {
      console.log('📁 No backups directory found');
      return [];
    }
    
    const backups = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('.env'))
      .map(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          file,
          path: filePath,
          created: stats.mtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.created - a.created);
    
    console.log('📋 Environment backups:');
    backups.forEach(backup => {
      console.log(`  ${backup.file} (${backup.created.toISOString()}, ${backup.size} bytes)`);
    });
    
    return backups;
  }
}

async function main() {
  const manager = new EnvironmentManager();
  await manager.initialize();
  
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];
  
  try {
    switch (command) {
      case 'list':
        const environments = manager.getAvailableEnvironments();
        const current = manager.getCurrentEnvironment();
        console.log('📋 Available environments:');
        environments.forEach(env => {
          const marker = env === current ? ' (current)' : '';
          console.log(`  ${env}${marker}`);
        });
        break;
        
      case 'current':
        const currentEnv = manager.getCurrentEnvironment();
        console.log(`Current environment: ${currentEnv || 'none'}`);
        break;
        
      case 'switch':
        if (!arg1) {
          console.log('Usage: node env-manager.js switch <environment>');
          process.exit(1);
        }
        manager.switchEnvironment(arg1);
        break;
        
      case 'validate':
        if (!arg1) {
          console.log('Usage: node env-manager.js validate <environment>');
          process.exit(1);
        }
        manager.validateEnvironment(arg1);
        break;
        
      case 'compare':
        if (!arg1 || !arg2) {
          console.log('Usage: node env-manager.js compare <env1> <env2>');
          process.exit(1);
        }
        manager.compareEnvironments(arg1, arg2);
        break;
        
      case 'create':
        if (!arg1) {
          console.log('Usage: node env-manager.js create <environment>');
          process.exit(1);
        }
        manager.createEnvironmentTemplate(arg1);
        break;
        
      case 'promote':
        if (!arg1 || !arg2) {
          console.log('Usage: node env-manager.js promote <source> <target>');
          process.exit(1);
        }
        manager.promoteEnvironment(arg1, arg2);
        break;
        
      case 'backups':
        manager.listBackups();
        break;
        
      default:
        console.log('Usage: node env-manager.js <command> [args]');
        console.log('Commands:');
        console.log('  list                    - List available environments');
        console.log('  current                 - Show current environment');
        console.log('  switch <env>            - Switch to environment');
        console.log('  validate <env>          - Validate environment configuration');
        console.log('  compare <env1> <env2>   - Compare two environments');
        console.log('  create <env>            - Create new environment template');
        console.log('  promote <source> <target> - Promote source config to target');
        console.log('  backups                 - List environment backups');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = EnvironmentManager;