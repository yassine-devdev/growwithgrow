import { createLogger } from './logger.js';

const logger = createLogger(undefined, undefined, 'health-check');

export interface HealthCheckResult {
  healthy: boolean;
  responseTime: number;
  error?: string;
  metadata?: any;
}

export interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    [key: string]: HealthCheckResult;
  };
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
}

// Base health check class
export abstract class HealthCheck {
  abstract name: string;
  abstract timeout: number;

  abstract check(): Promise<HealthCheckResult>;

  async execute(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const timeoutPromise = new Promise<HealthCheckResult>((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), this.timeout);
      });
      
      const checkPromise = this.check();
      const result = await Promise.race([checkPromise, timeoutPromise]);
      
      logger.debug(`Health check ${this.name} completed`, {
        healthy: result.healthy,
        responseTime: result.responseTime
      });
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.warn(`Health check ${this.name} failed`, {
        error: errorMessage,
        responseTime
      });
      
      return {
        healthy: false,
        responseTime,
        error: errorMessage
      };
    }
  }
}

// Database health check
export class DatabaseHealthCheck extends HealthCheck {
  name = 'database';
  timeout = 5000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // This would be replaced with actual database ping
      // For now, simulate a database check
      await this.simulateDatabasePing();
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: true,
        responseTime,
        metadata: {
          connections: {
            active: 5,
            idle: 10,
            total: 15
          }
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Database connection failed'
      };
    }
  }

  private async simulateDatabasePing(): Promise<void> {
    // Simulate database ping - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.05) {
      throw new Error('Database connection timeout');
    }
  }
}

// Redis health check
export class RedisHealthCheck extends HealthCheck {
  name = 'redis';
  timeout = 3000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      await this.simulateRedisPing();
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: true,
        responseTime,
        metadata: {
          connected: true,
          memory_usage: '10MB'
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Redis connection failed'
      };
    }
  }

  private async simulateRedisPing(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 20));
    
    if (Math.random() < 0.02) {
      throw new Error('Redis connection refused');
    }
  }
}

// External API health check
export class ExternalAPIHealthCheck extends HealthCheck {
  name: string;
  timeout = 10000;
  private apiUrl: string;
  private apiName: string;

  constructor(apiName: string, apiUrl: string) {
    super();
    this.apiName = apiName;
    this.apiUrl = apiUrl;
    this.name = `external_api_${apiName}`;
  }

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simulate API health check
      await this.simulateAPICheck();
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: true,
        responseTime,
        metadata: {
          api: this.apiName,
          url: this.apiUrl,
          quota_remaining: Math.floor(Math.random() * 1000)
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : `${this.apiName} API check failed`
      };
    }
  }

  private async simulateAPICheck(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    if (Math.random() < 0.1) {
      throw new Error(`${this.apiName} API rate limit exceeded`);
    }
  }
}

// Disk space health check
export class DiskSpaceHealthCheck extends HealthCheck {
  name = 'disk_space';
  timeout = 2000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const diskInfo = await this.getDiskInfo();
      const responseTime = Date.now() - startTime;
      
      const usagePercent = (diskInfo.used / diskInfo.total) * 100;
      const healthy = usagePercent < 90; // Consider unhealthy if > 90% full
      
      return {
        healthy,
        responseTime,
        metadata: {
          total: diskInfo.total,
          used: diskInfo.used,
          available: diskInfo.available,
          usage_percent: usagePercent
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Disk space check failed'
      };
    }
  }

  private async getDiskInfo(): Promise<{ total: number; used: number; available: number }> {
    // Simulate disk info - in production, use actual filesystem stats
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const total = 100 * 1024 * 1024 * 1024; // 100GB
    const used = Math.floor(total * (0.3 + Math.random() * 0.4)); // 30-70% used
    const available = total - used;
    
    return { total, used, available };
  }
}

// Memory health check
export class MemoryHealthCheck extends HealthCheck {
  name = 'memory';
  timeout = 1000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const memInfo = process.memoryUsage();
      const responseTime = Date.now() - startTime;
      
      // Consider unhealthy if heap usage > 1GB
      const healthy = memInfo.heapUsed < 1024 * 1024 * 1024;
      
      return {
        healthy,
        responseTime,
        metadata: {
          heap_used: memInfo.heapUsed,
          heap_total: memInfo.heapTotal,
          external: memInfo.external,
          rss: memInfo.rss
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Memory check failed'
      };
    }
  }
}

// Health check manager
export class HealthCheckManager {
  private checks: HealthCheck[] = [];
  private cache: SystemHealthStatus | null = null;
  private cacheExpiry: number = 0;
  private cacheTTL: number = 30000; // 30 seconds

  constructor() {
    this.registerDefaultChecks();
  }

  private registerDefaultChecks() {
    this.addCheck(new DatabaseHealthCheck());
    this.addCheck(new RedisHealthCheck());
    this.addCheck(new ExternalAPIHealthCheck('google_ai', 'https://generativelanguage.googleapis.com'));
    this.addCheck(new ExternalAPIHealthCheck('openai', 'https://api.openai.com'));
    this.addCheck(new DiskSpaceHealthCheck());
    this.addCheck(new MemoryHealthCheck());
  }

  addCheck(check: HealthCheck) {
    this.checks.push(check);
  }

  removeCheck(name: string) {
    this.checks = this.checks.filter(check => check.name !== name);
  }

  async runHealthChecks(useCache: boolean = true): Promise<SystemHealthStatus> {
    // Return cached result if still valid
    if (useCache && this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    logger.info('Running health checks', { checkCount: this.checks.length });

    const checkPromises = this.checks.map(check => 
      check.execute().then(result => ({ name: check.name, result }))
    );

    const checkResults = await Promise.all(checkPromises);
    
    const checks: { [key: string]: HealthCheckResult } = {};
    let healthyCount = 0;
    let unhealthyCount = 0;

    checkResults.forEach(({ name, result }) => {
      checks[name] = result;
      if (result.healthy) {
        healthyCount++;
      } else {
        unhealthyCount++;
      }
    });

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyCount === 0) {
      status = 'healthy';
    } else if (unhealthyCount < this.checks.length / 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    const healthStatus: SystemHealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
      summary: {
        total: this.checks.length,
        healthy: healthyCount,
        unhealthy: unhealthyCount
      }
    };

    // Cache the result
    this.cache = healthStatus;
    this.cacheExpiry = Date.now() + this.cacheTTL;

    logger.info('Health checks completed', {
      status,
      healthy: healthyCount,
      unhealthy: unhealthyCount,
      total: this.checks.length
    });

    return healthStatus;
  }

  // Get health status for specific check
  async getCheckStatus(checkName: string): Promise<HealthCheckResult | null> {
    const check = this.checks.find(c => c.name === checkName);
    if (!check) {
      return null;
    }

    return await check.execute();
  }

  // Get list of all registered checks
  getRegisteredChecks(): string[] {
    return this.checks.map(check => check.name);
  }
}

// Singleton instance
export const healthCheckManager = new HealthCheckManager();