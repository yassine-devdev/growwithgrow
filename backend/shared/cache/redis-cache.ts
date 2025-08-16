import Redis from 'ioredis';
import { createLogger } from '../monitoring/logger.js';
import { cacheHits, cacheMisses, cacheOperationDuration } from '../monitoring/metrics.js';

const logger = createLogger(undefined, undefined, 'redis-cache');

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  compress?: boolean;
  serialize?: boolean;
  keyPrefix?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalOperations: number;
}

export class RedisCache {
  private redis: Redis;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalOperations: 0
  };

  constructor(options?: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    maxRetriesPerRequest?: number;
    retryDelayOnFailover?: number;
  }) {
    const {
      host = process.env.REDIS_HOST || 'localhost',
      port = parseInt(process.env.REDIS_PORT || '6379'),
      password = process.env.REDIS_PASSWORD,
      db = parseInt(process.env.REDIS_DB || '0'),
      keyPrefix = 'app:',
      maxRetriesPerRequest = 3,
      retryDelayOnFailover = 100
    } = options || {};

    this.redis = new Redis({
      host,
      port,
      password,
      db,
      keyPrefix,
      maxRetriesPerRequest,
      retryDelayOnFailover,
      lazyConnect: true,
      enableReadyCheck: true,
      maxLoadingTimeout: 5000,
      // Connection pool settings
      family: 4,
      keepAlive: true,
      // Retry strategy
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      // Reconnect on error
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        return err.message.includes(targetError);
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      logger.info('Redis connected');
    });

    this.redis.on('ready', () => {
      logger.info('Redis ready');
    });

    this.redis.on('error', (error) => {
      logger.error('Redis error', error);
    });

    this.redis.on('close', () => {
      logger.warn('Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      logger.info('Redis reconnecting');
    });
  }

  // Get value from cache
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      const value = await this.redis.get(key);
      const duration = (Date.now() - startTime) / 1000;
      
      cacheOperationDuration.observe({ operation: 'get', cache_type: 'redis' }, duration);
      
      if (value === null) {
        this.recordMiss(key);
        return null;
      }
      
      this.recordHit(key);
      
      // Deserialize if needed
      if (options?.serialize !== false) {
        try {
          return JSON.parse(value);
        } catch (error) {
          logger.warn('Failed to parse cached value', { key, error });
          return value as T;
        }
      }
      
      return value as T;
    } catch (error) {
      logger.error('Cache get error', error, { key });
      this.recordMiss(key);
      return null;
    }
  }

  // Set value in cache
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      let serializedValue: string;
      
      // Serialize if needed
      if (options?.serialize !== false && typeof value !== 'string') {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = value as string;
      }
      
      // Compress if needed (simplified - in production use a proper compression library)
      if (options?.compress && serializedValue.length > 1000) {
        // This would use actual compression like gzip
        logger.debug('Compressing large cache value', { key, size: serializedValue.length });
      }
      
      const ttl = options?.ttl || 3600; // Default 1 hour
      const result = await this.redis.setex(key, ttl, serializedValue);
      
      const duration = (Date.now() - startTime) / 1000;
      cacheOperationDuration.observe({ operation: 'set', cache_type: 'redis' }, duration);
      
      return result === 'OK';
    } catch (error) {
      logger.error('Cache set error', error, { key });
      return false;
    }
  }

  // Delete from cache
  async del(key: string | string[]): Promise<number> {
    const startTime = Date.now();
    
    try {
      const result = await this.redis.del(key);
      
      const duration = (Date.now() - startTime) / 1000;
      cacheOperationDuration.observe({ operation: 'del', cache_type: 'redis' }, duration);
      
      return result;
    } catch (error) {
      logger.error('Cache delete error', error, { key });
      return 0;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', error, { key });
      return false;
    }
  }

  // Set expiration time
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      logger.error('Cache expire error', error, { key });
      return false;
    }
  }

  // Get multiple values
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const startTime = Date.now();
    
    try {
      const values = await this.redis.mget(...keys);
      
      const duration = (Date.now() - startTime) / 1000;
      cacheOperationDuration.observe({ operation: 'mget', cache_type: 'redis' }, duration);
      
      return values.map((value, index) => {
        if (value === null) {
          this.recordMiss(keys[index]);
          return null;
        }
        
        this.recordHit(keys[index]);
        
        try {
          return JSON.parse(value);
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      logger.error('Cache mget error', error, { keys });
      keys.forEach(key => this.recordMiss(key));
      return keys.map(() => null);
    }
  }

  // Set multiple values
  async mset(keyValuePairs: Record<string, any>, ttl?: number): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const pipeline = this.redis.pipeline();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        if (ttl) {
          pipeline.setex(key, ttl, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }
      });
      
      const results = await pipeline.exec();
      
      const duration = (Date.now() - startTime) / 1000;
      cacheOperationDuration.observe({ operation: 'mset', cache_type: 'redis' }, duration);
      
      return results?.every(([error, result]) => error === null && result === 'OK') || false;
    } catch (error) {
      logger.error('Cache mset error', error, { keys: Object.keys(keyValuePairs) });
      return false;
    }
  }

  // Increment counter
  async incr(key: string, by: number = 1): Promise<number> {
    try {
      if (by === 1) {
        return await this.redis.incr(key);
      } else {
        return await this.redis.incrby(key, by);
      }
    } catch (error) {
      logger.error('Cache incr error', error, { key });
      return 0;
    }
  }

  // Add to set
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.sadd(key, ...members);
    } catch (error) {
      logger.error('Cache sadd error', error, { key });
      return 0;
    }
  }

  // Get set members
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch (error) {
      logger.error('Cache smembers error', error, { key });
      return [];
    }
  }

  // Cache with fallback function
  async getOrSet<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    
    if (cached !== null) {
      return cached;
    }
    
    // Execute fallback function
    const value = await fallbackFn();
    
    // Cache the result
    await this.set(key, value, options);
    
    return value;
  }

  // Batch operations with pipeline
  async batch(operations: Array<{
    operation: 'get' | 'set' | 'del' | 'incr';
    key: string;
    value?: any;
    ttl?: number;
  }>): Promise<any[]> {
    const pipeline = this.redis.pipeline();
    
    operations.forEach(({ operation, key, value, ttl }) => {
      switch (operation) {
        case 'get':
          pipeline.get(key);
          break;
        case 'set':
          const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
          if (ttl) {
            pipeline.setex(key, ttl, serializedValue);
          } else {
            pipeline.set(key, serializedValue);
          }
          break;
        case 'del':
          pipeline.del(key);
          break;
        case 'incr':
          pipeline.incr(key);
          break;
      }
    });
    
    const results = await pipeline.exec();
    return results?.map(([error, result]) => error ? null : result) || [];
  }

  // Clear cache by pattern
  async clearByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      return await this.redis.del(...keys);
    } catch (error) {
      logger.error('Cache clear by pattern error', error, { pattern });
      return 0;
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Reset statistics
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalOperations: 0
    };
  }

  // Health check
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      await this.redis.ping();
      const latency = Date.now() - startTime;
      
      return { healthy: true, latency };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Close connection
  async close(): Promise<void> {
    await this.redis.quit();
  }

  // Private methods for statistics
  private recordHit(key: string): void {
    this.stats.hits++;
    this.stats.totalOperations++;
    this.stats.hitRate = this.stats.hits / this.stats.totalOperations;
    
    cacheHits.inc({ cache_type: 'redis', key_pattern: this.getKeyPattern(key) });
  }

  private recordMiss(key: string): void {
    this.stats.misses++;
    this.stats.totalOperations++;
    this.stats.hitRate = this.stats.hits / this.stats.totalOperations;
    
    cacheMisses.inc({ cache_type: 'redis', key_pattern: this.getKeyPattern(key) });
  }

  private getKeyPattern(key: string): string {
    // Extract pattern from key (e.g., "user:123" -> "user:*")
    const parts = key.split(':');
    if (parts.length > 1) {
      return `${parts[0]}:*`;
    }
    return 'other';
  }
}

// Singleton instance
export const redisCache = new RedisCache();