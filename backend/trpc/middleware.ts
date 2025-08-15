import { TRPCError } from '@trpc/server';
import { Context } from './context';

// Request logging middleware
export const createLoggingMiddleware = () => {
  return async (opts: {
    next: () => Promise<any>;
    ctx: Context;
    path: string;
    type: 'query' | 'mutation' | 'subscription';
    input: any;
  }) => {
    const { next, ctx, path, type, input } = opts;
    const start = Date.now();
    
    // Generate request ID for tracing
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log request start
    console.log(`🚀 [${requestId}] ${type.toUpperCase()} ${path}`, {
      userId: ctx.user?.id,
      userRole: ctx.user?.role,
      timestamp: new Date().toISOString(),
      input: type === 'mutation' ? '[REDACTED]' : input,
    });
    
    try {
      const result = await next();
      const duration = Date.now() - start;
      
      // Log successful completion
      console.log(`✅ [${requestId}] ${type.toUpperCase()} ${path} completed in ${duration}ms`, {
        userId: ctx.user?.id,
        duration,
        success: true,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      // Log error
      console.error(`❌ [${requestId}] ${type.toUpperCase()} ${path} failed in ${duration}ms`, {
        userId: ctx.user?.id,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      throw error;
    }
  };
};

// Rate limiting middleware
export const createRateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 60000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return async (opts: {
    next: () => Promise<any>;
    ctx: Context;
    path: string;
    type: 'query' | 'mutation' | 'subscription';
  }) => {
    const { next, ctx, path, type } = opts;
    
    // Use user ID or IP address as identifier
    const identifier = ctx.user?.id?.toString() || ctx.req.headers['x-forwarded-for'] || 'anonymous';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, value] of requests.entries()) {
      if (now > value.resetTime) {
        requests.delete(key);
      }
    }
    
    // Get or create rate limit entry
    let rateLimitEntry = requests.get(identifier);
    if (!rateLimitEntry || now > rateLimitEntry.resetTime) {
      rateLimitEntry = {
        count: 0,
        resetTime: now + windowMs,
      };
      requests.set(identifier, rateLimitEntry);
    }
    
    // Check rate limit
    if (rateLimitEntry.count >= maxRequests) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`,
      });
    }
    
    // Increment counter
    rateLimitEntry.count++;
    
    return next();
  };
};

// Input validation middleware
export const createValidationMiddleware = () => {
  return async (opts: {
    next: () => Promise<any>;
    ctx: Context;
    input: any;
    path: string;
  }) => {
    const { next, ctx, input, path } = opts;
    
    // Sanitize input to prevent XSS and injection attacks
    if (input && typeof input === 'object') {
      sanitizeInput(input);
    }
    
    // Check for suspicious patterns
    if (containsSuspiciousPatterns(input)) {
      console.warn(`🚨 Suspicious input detected on ${path}`, {
        userId: ctx.user?.id,
        input: JSON.stringify(input).substring(0, 200),
      });
    }
    
    return next();
  };
};

// Security middleware for sensitive operations
export const createSecurityMiddleware = () => {
  return async (opts: {
    next: () => Promise<any>;
    ctx: Context;
    path: string;
    type: 'query' | 'mutation' | 'subscription';
  }) => {
    const { next, ctx, path, type } = opts;
    
    // Check for admin-only operations
    if (path.includes('admin') && ctx.user?.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin access required for this operation',
      });
    }
    
    // Check for school-specific operations
    if (path.includes('school') && !ctx.user?.schoolId && ctx.user?.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'School association required for this operation',
      });
    }
    
    // Log sensitive operations
    if (type === 'mutation' && (path.includes('delete') || path.includes('admin'))) {
      console.warn(`🔒 Sensitive operation: ${type.toUpperCase()} ${path}`, {
        userId: ctx.user?.id,
        userRole: ctx.user?.role,
        timestamp: new Date().toISOString(),
      });
    }
    
    return next();
  };
};

// Helper functions
function sanitizeInput(obj: any): void {
  if (typeof obj !== 'object' || obj === null) return;
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove potentially dangerous characters
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else if (typeof obj[key] === 'object') {
      sanitizeInput(obj[key]);
    }
  }
}

function containsSuspiciousPatterns(input: any): boolean {
  const inputStr = JSON.stringify(input).toLowerCase();
  
  const suspiciousPatterns = [
    'script',
    'javascript:',
    'eval(',
    'function(',
    'settimeout',
    'setinterval',
    'document.cookie',
    'window.location',
    'alert(',
    'confirm(',
    'prompt(',
    'onload=',
    'onerror=',
    'onclick=',
    'union select',
    'drop table',
    'delete from',
    'insert into',
    'update set',
  ];
  
  return suspiciousPatterns.some(pattern => inputStr.includes(pattern));
}