#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BlueGreenDeployment {
  constructor() {
    this.currentColor = this.getCurrentColor();
    this.targetColor = this.currentColor === 'blue' ? 'green' : 'blue';
    this.deploymentDir = path.join(process.cwd(), 'deployments');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  getCurrentColor() {
    const colorFile = path.join(process.cwd(), '.current-color');
    if (fs.existsSync(colorFile)) {
      return fs.readFileSync(colorFile, 'utf8').trim();
    }
    return 'blue'; // Default to blue
  }

  setCurrentColor(color) {
    const colorFile = path.join(process.cwd(), '.current-color');
    fs.writeFileSync(colorFile, color);
  }

  async initialize() {
    if (!fs.existsSync(this.deploymentDir)) {
      fs.mkdirSync(this.deploymentDir, { recursive: true });
    }
  }

  async buildImages() {
    console.log(`🔨 Building images for ${this.targetColor} deployment...`);
    
    try {
      // Build frontend image
      console.log('📦 Building frontend image...');
      execSync(`docker build -f Dockerfile.frontend -t app-frontend:${this.targetColor} .`, {
        stdio: 'inherit'
      });
      
      // Build backend image
      console.log('🔧 Building backend image...');
      execSync(`docker build -f Dockerfile.backend -t app-backend:${this.targetColor} .`, {
        stdio: 'inherit'
      });
      
      console.log(`✅ Images built successfully for ${this.targetColor} deployment`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to build images:', error.message);
      return { success: false, error: error.message };
    }
  }

  async createDeploymentConfig() {
    console.log(`📝 Creating deployment configuration for ${this.targetColor}...`);
    
    const composeConfig = `
version: '3.8'

services:
  postgres-${this.targetColor}:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: \${DB_NAME:-production_app}
      POSTGRES_USER: \${DB_USER:-postgres}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-postgres}
    volumes:
      - postgres_data_${this.targetColor}:/var/lib/postgresql/data
    ports:
      - "${this.targetColor === 'blue' ? '5432' : '5433'}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app-network-${this.targetColor}

  redis-${this.targetColor}:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD:-redis123}
    volumes:
      - redis_data_${this.targetColor}:/data
    ports:
      - "${this.targetColor === 'blue' ? '6379' : '6380'}:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    restart: unless-stopped
    networks:
      - app-network-${this.targetColor}

  backend-${this.targetColor}:
    image: app-backend:${this.targetColor}
    environment:
      NODE_ENV: production
      PORT: 4000
      DB_HOST: postgres-${this.targetColor}
      DB_PORT: 5432
      DB_NAME: \${DB_NAME:-production_app}
      DB_USER: \${DB_USER:-postgres}
      DB_PASSWORD: \${DB_PASSWORD:-postgres}
      REDIS_HOST: redis-${this.targetColor}
      REDIS_PORT: 6379
      REDIS_PASSWORD: \${REDIS_PASSWORD:-redis123}
      JWT_SECRET: \${JWT_SECRET:-your-super-secret-jwt-key}
      CORS_ORIGIN: \${CORS_ORIGIN:-http://localhost}
    depends_on:
      postgres-${this.targetColor}:
        condition: service_healthy
      redis-${this.targetColor}:
        condition: service_healthy
    ports:
      - "${this.targetColor === 'blue' ? '4000' : '4001'}:4000"
    healthcheck:
      test: ["CMD", "/usr/local/bin/health-check.sh"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    restart: unless-stopped
    networks:
      - app-network-${this.targetColor}

  frontend-${this.targetColor}:
    image: app-frontend:${this.targetColor}
    ports:
      - "${this.targetColor === 'blue' ? '80' : '8080'}:80"
    depends_on:
      backend-${this.targetColor}:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "/usr/local/bin/health-check.sh"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    restart: unless-stopped
    networks:
      - app-network-${this.targetColor}

volumes:
  postgres_data_${this.targetColor}:
    driver: local
  redis_data_${this.targetColor}:
    driver: local

networks:
  app-network-${this.targetColor}:
    driver: bridge
`;

    const configPath = path.join(this.deploymentDir, `docker-compose.${this.targetColor}.yml`);
    fs.writeFileSync(configPath, composeConfig);
    
    console.log(`✅ Deployment configuration created: ${configPath}`);
    return configPath;
  }

  async deployToTarget() {
    console.log(`🚀 Deploying to ${this.targetColor} environment...`);
    
    try {
      const configPath = await this.createDeploymentConfig();
      
      // Start the target environment
      console.log(`🔄 Starting ${this.targetColor} environment...`);
      execSync(`docker-compose -f ${configPath} up -d`, { stdio: 'inherit' });
      
      // Wait for services to be healthy
      console.log('⏳ Waiting for services to be healthy...');
      await this.waitForHealthy(configPath);
      
      console.log(`✅ ${this.targetColor} environment is running and healthy`);
      return { success: true, configPath };
    } catch (error) {
      console.error(`❌ Failed to deploy to ${this.targetColor}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async waitForHealthy(configPath, maxWaitTime = 300000) { // 5 minutes
    const startTime = Date.now();
    const checkInterval = 10000; // 10 seconds
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const result = execSync(`docker-compose -f ${configPath} ps --format json`, {
          encoding: 'utf8'
        });
        
        const services = JSON.parse(`[${result.trim().split('\n').join(',')}]`);
        const unhealthyServices = services.filter(service => 
          service.Health && service.Health !== 'healthy'
        );
        
        if (unhealthyServices.length === 0) {
          console.log('✅ All services are healthy');
          return true;
        }
        
        console.log(`⏳ Waiting for ${unhealthyServices.length} services to be healthy...`);
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      } catch (error) {
        console.log('⏳ Services still starting up...');
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    }
    
    throw new Error('Services did not become healthy within the timeout period');
  }

  async runSmokeTests() {
    console.log(`🧪 Running smoke tests on ${this.targetColor} environment...`);
    
    const port = this.targetColor === 'blue' ? '80' : '8080';
    const backendPort = this.targetColor === 'blue' ? '4000' : '4001';
    
    try {
      // Test frontend
      console.log('🌐 Testing frontend...');
      execSync(`curl -f http://localhost:${port}/health`, { stdio: 'inherit' });
      
      // Test backend
      console.log('🔧 Testing backend...');
      execSync(`curl -f http://localhost:${backendPort}/api/health`, { stdio: 'inherit' });
      
      // Test API endpoints
      console.log('🔌 Testing API endpoints...');
      execSync(`curl -f -I http://localhost:${backendPort}/trpc`, { stdio: 'inherit' });
      
      console.log(`✅ Smoke tests passed for ${this.targetColor} environment`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Smoke tests failed for ${this.targetColor}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async switchTraffic() {
    console.log(`🔄 Switching traffic from ${this.currentColor} to ${this.targetColor}...`);
    
    try {
      // Update load balancer or reverse proxy configuration
      // This would typically involve updating nginx config or cloud load balancer
      
      // For this example, we'll update the current color marker
      this.setCurrentColor(this.targetColor);
      
      console.log(`✅ Traffic switched to ${this.targetColor} environment`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to switch traffic:', error.message);
      return { success: false, error: error.message };
    }
  }

  async cleanupOldEnvironment() {
    console.log(`🧹 Cleaning up ${this.currentColor} environment...`);
    
    try {
      const oldConfigPath = path.join(this.deploymentDir, `docker-compose.${this.currentColor}.yml`);
      
      if (fs.existsSync(oldConfigPath)) {
        execSync(`docker-compose -f ${oldConfigPath} down -v`, { stdio: 'inherit' });
        console.log(`✅ ${this.currentColor} environment cleaned up`);
      }
      
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to cleanup ${this.currentColor} environment:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async rollback() {
    console.log(`🔄 Rolling back to ${this.currentColor} environment...`);
    
    try {
      // Stop the target environment
      const targetConfigPath = path.join(this.deploymentDir, `docker-compose.${this.targetColor}.yml`);
      if (fs.existsSync(targetConfigPath)) {
        execSync(`docker-compose -f ${targetConfigPath} down`, { stdio: 'inherit' });
      }
      
      // Ensure current environment is running
      const currentConfigPath = path.join(this.deploymentDir, `docker-compose.${this.currentColor}.yml`);
      if (fs.existsSync(currentConfigPath)) {
        execSync(`docker-compose -f ${currentConfigPath} up -d`, { stdio: 'inherit' });
        await this.waitForHealthy(currentConfigPath);
      }
      
      console.log(`✅ Rollback to ${this.currentColor} completed`);
      return { success: true };
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async deploy() {
    console.log(`🚀 Starting blue-green deployment from ${this.currentColor} to ${this.targetColor}...`);
    
    try {
      await this.initialize();
      
      // Build new images
      const buildResult = await this.buildImages();
      if (!buildResult.success) {
        throw new Error('Build failed');
      }
      
      // Deploy to target environment
      const deployResult = await this.deployToTarget();
      if (!deployResult.success) {
        throw new Error('Deployment failed');
      }
      
      // Run smoke tests
      const testResult = await this.runSmokeTests();
      if (!testResult.success) {
        console.log('🔄 Smoke tests failed, initiating rollback...');
        await this.rollback();
        throw new Error('Smoke tests failed');
      }
      
      // Switch traffic
      const switchResult = await this.switchTraffic();
      if (!switchResult.success) {
        console.log('🔄 Traffic switch failed, initiating rollback...');
        await this.rollback();
        throw new Error('Traffic switch failed');
      }
      
      // Cleanup old environment (optional, can be done later)
      setTimeout(() => {
        this.cleanupOldEnvironment();
      }, 300000); // Cleanup after 5 minutes
      
      console.log(`🎉 Blue-green deployment completed successfully!`);
      console.log(`   Previous: ${this.currentColor}`);
      console.log(`   Current:  ${this.targetColor}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

async function main() {
  const deployment = new BlueGreenDeployment();
  
  const command = process.argv[2] || 'deploy';
  
  switch (command) {
    case 'deploy':
      await deployment.deploy();
      break;
      
    case 'rollback':
      await deployment.rollback();
      break;
      
    case 'status':
      console.log(`Current environment: ${deployment.currentColor}`);
      console.log(`Target environment: ${deployment.targetColor}`);
      break;
      
    case 'cleanup':
      await deployment.cleanupOldEnvironment();
      break;
      
    default:
      console.log('Usage: node blue-green-deploy.js [deploy|rollback|status|cleanup]');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BlueGreenDeployment;