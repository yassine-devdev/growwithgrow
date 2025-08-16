import { Request, Response, NextFunction } from 'express';
import { redisCache } from './redis-cache.js';
import { createLogger } from '../monitoring/logger.js';
import crypto from 'crypto';

const logger = createLogger(undefined, undefined, 'cache-middleware');

export interface CacheMiddlewareOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request, res: Response) => boolean;
  skipCache?: (req: Request) => boolean;
  varyBy?: string[];
  compress?: boolean;
}

// Response caching middleware
export function cacheMiddleware(options: CacheMiddlewareOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = defaultKeyGenerator,
    condition = defaultCondition,
    skipCache = () => false,
    varyBy = [],
    compress = false
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests or when condition is not met
    if (req.method !== 'GET' || skipCache(req) || !condition(req, res)) {
      return next();
    }

    const cacheKey = keyGenerator(req);
    
    try {
      // Try to get cached response
      const cached = await redisCache.get<{
        statusCode: number;
        headers: Record<string, string>;
        body: string;
        timestamp: number;
      }>(cacheKey);

      if (cached) {
        // Set cached headers
        Object.entries(cached.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        
        // Add cache headers
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-Timestamp', new Date(cached.timestamp).toISOString());
        
        logger.debug('Cache hit', { cacheKey, url: req.url });
        
        return res.status(cached.statusCode).send(cached.body);
      }

      // Cache miss - intercept response
      const originalSend = res.send;
      const originalJson = res.json;
      
      res.send = function(body: any) {
        cacheResponse(cacheKey, res.statusCode, res.getHeaders(), body, ttl, compress);
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        return originalSend.call(this, body);
      };
      
      res.json = function(obj: any) {
        const body = JSON.stringify(obj);
        cacheResponse(cacheKey, res.statusCode, res.getHeaders(), body, ttl, compress);
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        return originalJson.call(this, obj);
      };

      logger.debug('Cache miss', { cacheKey, url: req.url });
      next();
      
    } catch (error) {
      logger.error('Cache middleware error', error, { cacheKey, url: req.url });
      next();
    }
  };
}

// Cache response helper
async function cacheResponse(
  key: string,
  statusCode: number,
  headers: any,
  body: any,
  ttl: number,
  compress: boolean
) {
  // Only cache successful responses
  if (statusCode >= 200 && statusCode < 300) {
    const cacheData = {
      statusCode,
      headers: sanitizeHeaders(headers),
      body: typeof body === 'string' ? body : JSON.stringify(body),
      timestamp: Date.now()
    };

    await redisCache.set(key, cacheData, { ttl, compress });
  }
}

// Default key generator
function defaultKeyGenerator(req: Request): string {
  const url = req.originalUrl || req.url;
  const query = JSON.stringify(req.query);
  const userId = (req as any).user?.id || 'anonymous';
  
  const keyData = `${req.method}:${url}:${query}:${userId}`;
  return `response:${crypto.createHash('md5').update(keyData).digest('hex')}`;
}

// Default caching condition
function defaultCondition(req: Request, res: Response): boolean {
  // Don't cache if there are authentication headers that might affect the response
  if (req.headers.authorization) {
    return false;
  }
  
  // Don't cache if response has set-cookie headers
  if (res.getHeader('set-cookie')) {
    return false;
  }
  
  return true;
}

// Sanitize headers for caching
function sanitizeHeaders(headers: any): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  // Only cache safe headers
  const safeHeaders = [
    'content-type',
    'content-length',
    'cache-control',
    'expires',
    'last-modified',
    'etag'
  ];
  
  Object.entries(headers).forEach(([key, value]) => {
    if (safeHeaders.includes(key.toLowerCase()) && typeof value === 'string') {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
}

// Method-level caching decorator
export function cached(options: {
  ttl?: number;
  keyPrefix?: string;
  keyGenerator?: (...args: any[]) => string;
  condition?: (...args: any[]) => boolean;
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const {
        ttl = 300,
        keyPrefix = `method:${target.constructor.name}:${propertyName}`,
        keyGenerator = (...args) => crypto.createHash('md5').update(JSON.stringify(args)).digest('hex'),
        condition = () => true
      } = options;
      
      if (!condition(...args)) {
        return method.apply(this, args);
      }
      
      const cacheKey = `${keyPrefix}:${keyGenerator(...args)}`;
      
      try {
        const cached = await redisCache.get(cacheKey);
        if (cached !== null) {
          logger.debug('Method cache hit', { method: propertyName, cacheKey });
          return cached;
        }
        
        const result = await method.apply(this, args);
        
        if (result !== undefined) {
          await redisCache.set(cacheKey, result, { ttl });
          logger.debug('Method cache set', { method: propertyName, cacheKey });
        }
        
        return result;
      } catch (error) {
        logger.error('Method cache error', error, { method: propertyName, cacheKey });
        return method.apply(this, args);
      }
    };
  };
}

// Cache invalidation utilities
export class CacheInvalidator {
  // Invalidate by pattern
  static async invalidatePattern(pattern: string): Promise<number> {
    try {
      const count = await redisCache.clearByPattern(pattern);
      logger.info('Cache invalidated by pattern', { pattern, count });
      return count;
    } catch (error) {
      logger.error('Cache invalidation error', error, { pattern });
      return 0;
    }
  }

  // Invalidate by tags
  static async invalidateByTags(tags: string[]): Promise<void> {
    const promises = tags.map(tag => redisCache.clearByPattern(`*:tag:${tag}:*`));
    await Promise.all(promises);
    logger.info('Cache invalidated by tags', { tags });
  }

  // Invalidate user-specific cache
  static async invalidateUser(userId: string): Promise<void> {
    await redisCache.clearByPattern(`*:user:${userId}:*`);
    logger.info('User cache invalidated', { userId });
  }

  // Invalidate API endpoint cache
  static async invalidateEndpoint(endpoint: string): Promise<void> {
    await redisCache.clearByPattern(`response:*${endpoint}*`);
    logger.info('Endpoint cache invalidated', { endpoint });
  }
}

// Cache warming utilities
export class CacheWarmer {
  private static warmingTasks = new Map<string, Promise<void>>();

  // Warm cache with data
  static async warmCache(
    key: string,
    dataFetcher: () => Promise<any>,
    ttl: number = 3600
  ): Promise<void> {
    if (this.warmingTasks.has(key)) {
      return this.warmingTasks.get(key);
    }

    const warmingTask = this.performWarmup(key, dataFetcher, ttl);
    this.warmingTasks.set(key, warmingTask);

    try {
      await warmingTask;
    } finally {
      this.warmingTasks.delete(key);
    }
  }

  private static async performWarmup(
    key: string,
    dataFetcher: () => Promise<any>,
    ttl: number
  ): Promise<void> {
    try {
      logger.info('Starting cache warmup', { key });
      
      const data = await dataFetcher();
      await redisCache.set(key, data, { ttl });
      
      logger.info('Cache warmup completed', { key });
    } catch (error) {
      logger.error('Cache warmup failed', error, { key });
      throw error;
    }
  }

  // Warm multiple cache entries
  static async warmMultiple(
    entries: Array<{
      key: string;
      dataFetcher: () => Promise<any>;
      ttl?: number;
    }>
  ): Promise<void> {
    const promises = entries.map(({ key, dataFetcher, ttl = 3600 }) =>
      this.warmCache(key, dataFetcher, ttl)
    );

    await Promise.allSettled(promises);
  }

  // Schedule cache warming
  static scheduleWarmup(
    key: string,
    dataFetcher: () => Promise<any>,
    intervalMs: number,
    ttl: number = 3600
  ): NodeJS.Timeout {
    const warmupInterval = setInterval(async () => {
      try {
        await this.warmCache(key, dataFetcher, ttl);
      } catch (error) {
        logger.error('Scheduled cache warmup failed', error, { key });
      }
    }, intervalMs);

    // Initial warmup
    this.warmCache(key, dataFetcher, ttl).catch(error => {
      logger.error('Initial cache warmup failed', error, { key });
    });

    return warmupInterval;
  }
}

// Cache statistics middleware
export function cacheStatsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/api/cache/stats') {
    const stats = redisCache.getStats();
    return res.json({
      ...stats,
      timestamp: new Date().toISOString()
    });
  }
  next();
}