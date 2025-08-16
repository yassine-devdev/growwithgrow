import { RateLimitStore, SecurityContext, SecurityViolation, SecurityViolationType } from './types';
import { securityConfig } from './config';

// In-memory rate limit store (for development/testing)
// In production, this should be replaced with Redis
class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  
  async get(key: string): Promise<number | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return null;
    }
    
    return entry.count;
  }
  
  async set(key: string, value: number, ttl: number): Promise<void> {
    this.store.set(key, {
      count: value,
      resetTime: Date.now() + ttl
    });
  }
  
  async increment(key: string, ttl: number): Promise<number> {
    const current = await this.get(key);
    const newCount = (current || 0) + 1;
    await this.set(key, newCount, ttl);
    return newCount;
  }
  
  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
  
  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Rate limiter class
export class RateLimiter {
  private store: RateLimitStore;
  private config = securityConfig.rateLimit;
  
  constructor(store?: RateLimitStore) {
    this.store = store || new MemoryRateLimitStore();
    
    // Start cleanup interval for memory store
    if (this.store instanceof MemoryRateLimitStore) {
      setInterval(() => {
        (this.store as MemoryRateLimitStore).cleanup();
      }, 60000); // Cleanup every minute
    }
  }
  
  // Generate rate limit key based on IP and optional user ID
  private generateKey(context: SecurityContext): string {
    const baseKey = `rate_limit:${context.ip}`;
    return context.userId ? `${baseKey}:user:${context.userId}` : baseKey;
  }
  
  // Check if request should be rate limited
  async checkRateLimit(context: SecurityContext): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    violation?: SecurityViolation;
  }> {
    const key = this.generateKey(context);
    const windowMs = this.config.windowMs;
    const maxRequests = this.config.max;
    
    try {
      const currentCount = await this.store.increment(key, windowMs);
      const remaining = Math.max(0, maxRequests - currentCount);
      const resetTime = Date.now() + windowMs;
      
      if (currentCount > maxRequests) {
        // Rate limit exceeded
        const violation: SecurityViolation = {
          type: SecurityViolationType.RATE_LIMIT_EXCEEDED,
          ip: context.ip,
          userAgent: context.userAgent,
          details: {
            currentCount,
            maxRequests,
            windowMs,
            userId: context.userId
          },
          timestamp: context.timestamp,
          severity: 'medium'
        };
        
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          violation
        };
      }
      
      return {
        allowed: true,
        remaining,
        resetTime
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On error, allow the request but log the issue
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: Date.now() + windowMs
      };
    }
  }
  
  // Reset rate limit for a specific context (useful for testing or admin override)
  async resetRateLimit(context: SecurityContext): Promise<void> {
    const key = this.generateKey(context);
    await this.store.reset(key);
  }
  
  // Get current rate limit status without incrementing
  async getRateLimitStatus(context: SecurityContext): Promise<{
    current: number;
    remaining: number;
    resetTime: number;
  }> {
    const key = this.generateKey(context);
    const current = await this.store.get(key) || 0;
    const remaining = Math.max(0, this.config.max - current);
    const resetTime = Date.now() + this.config.windowMs;
    
    return {
      current,
      remaining,
      resetTime
    };
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();