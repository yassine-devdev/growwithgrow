import Redis from 'ioredis';
import { createLogger } from '../monitoring/logger.js';
import { cacheHits, cacheMisses, cacheOperationDuration } from '../monitoring/metrics.js';

const logger = createLogger(undefined, undefined, 'cache');

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  serialize?: boolean;
  compress?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalOperations: number;
  averageResponseTime: number;
}

export class CacheManager {
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour
  private keyPrefix: string = 'app:';
  private stats = {
    hits: 0,
    misses: 0,
    totalResponseTime: 0,
    operations: 0
  };

  constructor(redisConfig?: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    defaultTTL?: number;
  }) {
    const config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: 'app:',
      defaultTTL: 3600,
      ...redisConfig
    };

    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      keyPrefix: config.keyPrefix
    });

    this.keyPrefix = config.keyPrefix;
    this.defaultTTL = config.defaultTTL;

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      logger.info('Redis connected');
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

  private formatKey(key: string, prefix?: string): string {
    const finalPrefix = prefix || '';
    return `${finalPrefix}${key}`;
  }

  private recordMetrics(operation: 'hit' | 'miss', responseTime: number, keyPattern: string): void {
    this.stats.operations++;
    this.stats.totalResponseTime += responseTime;

    if (operation === 'hit') {
      this.stats.hits++;
      cacheHits.inc({ cache_type: 'redis', key_pattern: keyPattern });
    } else {
      this.stats.misses++;
      cacheMisses.inc({ cache_type: 'redis', key_pattern: keyPattern });
    }

    cacheOperationDuration.observe(
      { operation: 'get', cache_type: 'redis' },
      responseTime / 1000
    );
  }

  // Get value from cache
  async get<T = any>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const startTime = Date.now();
    const formattedKey = this.formatKey(key, options.prefix);
    const keyPattern = this.getKeyPattern(key);

    try {
      const value = await this.redis.get(formattedKey);
      const responseTime = Date.now() - startTime;

      if (value === null) {
        this.recordMetrics('miss', responseTime, keyPattern);
        logger.debug('Cache miss', { key: formattedKey });
        return null;
      }

      this.recordMetrics('hit', responseTime, keyPattern);
      logger.debug('Cache hit', { key: formattedKey });

      // Deserialize if needed
      if (options.serialize !== false) {
        try {
          return JSON.parse(value);
        } catch (error) {
          logger.warn('Failed to parse cached value', { key: formattedKey, error });
          return value as T;
        }
      }

      return value as T;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordMetrics('miss', responseTime, keyPattern);
      logger.error('Cache get error', error, { key: formattedKey });
      return null;
    }
  }

  // Set value in cache
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    const startTime = Date.now();
    const formattedKey = this.formatKey(key, options.prefix);
    const ttl = options.ttl || this.defaultTTL;

    try {
      let serializedValue: string;

      // Serialize if needed
      if (options.serialize !== false && typeof value !== 'string') {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = value;
      }

      // Compress if needed (implement compression logic here if required)
      if (options.compress) {
        // Add compression logic here
      }

      await this.redis.setex(formattedKey, ttl, serializedValue);
      
      const responseTime = Date.now() - startTime;
      cacheOperationDuration.observe(
        { operation: 'set', cache_type: 'redis' },
        responseTime / 1000
      );

      logger.debug('Cache set', { key: formattedKey, ttl });
      return true;
    } catch (error) {
      logger.error('Cache set error', error, { key: formattedKey });
      return false;
    }
  }

  // Delete value from cache
  async del(key: string, options: CacheOptions = {}): Promise<boolean> {
    const startTime = Date.now();
    const formattedKey = this.formatKey(key, options.prefix);

    try {
      const result = await this.redis.del(formattedKey);
      
      const responseTime = Date.now() - startTime;
      cacheOperationDuration.observe(
        { operation: 'del', cache_type: 'redis' },
        responseTime / 1000
      );

      logger.debug('Cache delete', { key: formattedKey, deleted: result > 0 });
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error', error, { key: formattedKey });
      return false;
    }
  }

  // Get multiple values
  async mget<T = any>(keys: string[], options: CacheOptions = {}): Promise<(T | null)[]> {
    const startTime = Date.now();
    const formattedKeys = keys.map(key => this.formatKey(key, options.prefix));

    try {
      const values = await this.redis.mget(...formattedKeys);
      
      const responseTime = Date.now() - startTime;
      cacheOperationDuration.observe(
        { operation: 'mget', cache_type: 'redis' },
        responseTime / 1000
      );

      return values.map((value, index) => {
        const keyPattern = this.getKeyPattern(keys[index]);
        
        if (value === null) {
          this.recordMetrics('miss', responseTime / keys.length, keyPattern);
          return null;
        }

        this.recordMetrics('hit', responseTime / keys.length, keyPattern);

        if (options.serialize !== false) {
          try {
            return JSON.parse(value);
          } catch (error) {
            return value as T;
          }
        }

        return value as T;
      });
    } catch (error) {
      logger.error('Cache mget error', error, { keys: formattedKeys });
      return keys.map(() => null);
    }
  }

  // Set multiple values
  async mset(keyValuePairs: Array<[string, any]>, options: CacheOptions = {}): Promise<boolean> {
    const startTime = Date.now();
    const ttl = options.ttl || this.defaultTTL;

    try {
      const pipeline = this.redis.pipeline();

      keyValuePairs.forEach(([key, value]) => {
        const formattedKey = this.formatKey(key, options.prefix);
        let serializedValue: string;

        if (options.serialize !== false && typeof value !== 'string') {
          serializedValue = JSON.stringify(value);
        } else {
          serializedValue = value;
        }

        pipeline.setex(formattedKey, ttl, serializedValue);
      });

      await pipeline.exec();
      
      const responseTime = Date.now() - startTime;
      cacheOperationDuration.observe(
        { operation: 'mset', cache_type: 'redis' },
        responseTime / 1000
      );

      logger.debug('Cache mset', { count: keyValuePairs.length, ttl });
      return true;
    } catch (error) {
      logger.error('Cache mset error', error);
      return false;
    }
  }

  // Check if key exists
  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    const formattedKey = this.formatKey(key, options.prefix);

    try {
      const result = await this.redis.exists(formattedKey);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', error, { key: formattedKey });
      return false;
    }
  }

  // Set expiration time
  async expire(key: string, ttl: number, options: CacheOptions = {}): Promise<boolean> {
    const formattedKey = this.formatKey(key, options.prefix);

    try {
      const result = await this.redis.expire(formattedKey, ttl);
      return result === 1;
    } catch (error) {
      logger.error('Cache expire error', error, { key: formattedKey });
      return false;
    }
  }

  // Get time to live
  async ttl(key: string, options: CacheOptions = {}): Promise<number> {
    const formattedKey = this.formatKey(key, options.prefix);

    try {
      return await this.redis.ttl(formattedKey);
    } catch (error) {
      logger.error('Cache ttl error', error, { key: formattedKey });
      return -1;
    }
  }

  // Clear cache by pattern
  async clear(pattern: string = '*', options: CacheOptions = {}): Promise<number> {
    const formattedPattern = this.formatKey(pattern, options.prefix);

    try {
      const keys = await this.redis.keys(formattedPattern);
      if (keys.length === 0) return 0;

      const result = await this.redis.del(...keys);
      logger.info('Cache cleared', { pattern: formattedPattern, deleted: result });
      return result;
    } catch (error) {
      logger.error('Cache clear error', error, { pattern: formattedPattern });
      return 0;
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    const hitRate = this.stats.operations > 0 
      ? this.stats.hits / this.stats.operations 
      : 0;
    
    const averageResponseTime = this.stats.operations > 0
      ? this.stats.totalResponseTime / this.stats.operations
      : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      totalOperations: this.stats.operations,
      averageResponseTime
    };
  }

  // Reset statistics
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalResponseTime: 0,
      operations: 0
    };
  }

  // Get Redis info
  async getInfo(): Promise<any> {
    try {
      const info = await this.redis.info();
      return info;
    } catch (error) {
      logger.error('Failed to get Redis info', error);
      return null;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed', error);
      return false;
    }
  }

  private getKeyPattern(key: string): string {
    // Extract pattern from key for metrics
    return key.split(':')[0] || 'unknown';
  }

  // Close connection
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// Cache decorators for methods
export function cached(options: CacheOptions & { keyGenerator?: (...args: any[]) => string } = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = this.cache || cacheManager;
      
      // Generate cache key
      const key = options.keyGenerator 
        ? options.keyGenerator(...args)
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cachedResult = await cache.get(key, options);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cache.set(key, result, options);
      
      return result;
    };

    return descriptor;
  };
}

// Cache invalidation decorator
export function invalidateCache(patterns: string[] | ((result: any, ...args: any[]) => string[])) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      const cache = this.cache || cacheManager;

      // Determine patterns to invalidate
      const patternsToInvalidate = typeof patterns === 'function' 
        ? patterns(result, ...args)
        : patterns;

      // Invalidate cache patterns
      for (const pattern of patternsToInvalidate) {
        await cache.clear(pattern);
      }

      return result;
    };

    return descriptor;
  };
}

// Singleton cache manager instance
export const cacheManager = new CacheManager();