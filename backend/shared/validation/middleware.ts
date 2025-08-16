/**
 * Validation middleware for tRPC endpoints
 * Provides automatic validation and sanitization of input data
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { initTRPC } from '@trpc/server';
import { Context } from '../../trpc/context';

// Input sanitization functions
export const sanitizeInput = {
  /**
   * Remove potentially dangerous HTML tags and attributes
   */
  html: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
      .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/style\s*=/gi, '');
  },

  /**
   * Remove SQL injection patterns
   */
  sql: (input: string): string => {
    return input
      .replace(/('|(\\')|(;)|(\\)|(--)|(\s+or\s+)|(\s+and\s+)|(\s+union\s+)|(\s+select\s+)|(\s+insert\s+)|(\s+update\s+)|(\s+delete\s+)|(\s+drop\s+)|(\s+create\s+)|(\s+alter\s+))/gi, '')
      .trim();
  },

  /**
   * Remove XSS patterns
   */
  xss: (input: string): string => {
    return input
      .replace(/[<>\"']/g, (match) => {
        const entities: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;'
        };
        return entities[match];
      });
  },

  /**
   * Sanitize email input
   */
  email: (input: string): string => {
    return input.toLowerCase().trim().replace(/[^\w@.-]/g, '');
  },

  /**
   * Sanitize phone number
   */
  phone: (input: string): string => {
    return input.replace(/[^\d\s\-\(\)\+\.]/g, '').trim();
  },

  /**
   * Sanitize URL
   */
  url: (input: string): string => {
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      return url.toString();
    } catch {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid URL format'
      });
    }
  }
};

// Initialize tRPC for middleware creation
const t = initTRPC.context<Context>().create();

/**
 * Create validation middleware for tRPC procedures
 */
export const createValidationMiddleware = <T extends z.ZodType>(schema: T) => {
  return t.middleware(async ({ input, next }) => {
    try {
      // Validate and parse input
      const validatedInput = schema.parse(input);
      
      // Continue with validated input
      return next({
        ctx: {
          validatedInput
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Validation failed',
          cause: {
            validationErrors: formattedErrors
          }
        });
      }

      // Re-throw other errors
      throw error;
    }
  });
};

/**
 * Middleware for sanitizing string inputs
 */
export const sanitizeStringsMiddleware = t.middleware(async ({ input, next }) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeInput.html(sanitizeInput.xss(obj));
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  const sanitizedInput = sanitizeObject(input);

  return next({
    ctx: {
      sanitizedInput
    }
  });
});

/**
 * Rate limiting middleware
 */
export const createRateLimitMiddleware = (
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return t.middleware(async ({ ctx, next }) => {
    const identifier = ctx.user?.id?.toString() || ctx.req?.ip || 'anonymous';
    const now = Date.now();
    
    const userRequests = requests.get(identifier);
    
    if (!userRequests || now > userRequests.resetTime) {
      // Reset or initialize counter
      requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
    } else {
      // Increment counter
      userRequests.count++;
      
      if (userRequests.count > maxRequests) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`
        });
      }
    }

    return next();
  });
};

/**
 * Input size limiting middleware
 */
export const createInputSizeLimitMiddleware = (maxSizeBytes: number = 1024 * 1024) => {
  return t.middleware(async ({ input, next }) => {
    const inputSize = JSON.stringify(input).length;
    
    if (inputSize > maxSizeBytes) {
      throw new TRPCError({
        code: 'PAYLOAD_TOO_LARGE',
        message: `Input size ${inputSize} bytes exceeds limit of ${maxSizeBytes} bytes`
      });
    }

    return next();
  });
};

/**
 * Authentication middleware
 */
export const requireAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }

  return next({
    ctx: {
      user: ctx.user
    }
  });
});

/**
 * Role-based authorization middleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    return next({
      ctx: {
        user: ctx.user
      }
    });
  });
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (permission: string) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    // Check if user has the required permission
    const hasPermission = ctx.user.permissions?.includes(permission) || 
                         ctx.user.role === 'super_admin';

    if (!hasPermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Access denied. Required permission: ${permission}`
      });
    }

    return next({
      ctx: {
        user: ctx.user
      }
    });
  });
};

/**
 * School context middleware - ensures user has access to the specified school
 */
export const requireSchoolAccess = t.middleware(async ({ input, ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }

  const schoolId = (input as any)?.schoolId;
  
  if (schoolId && ctx.user.role !== 'super_admin') {
    // Check if user has access to this school
    const hasAccess = ctx.user.schoolIds?.includes(schoolId) || 
                     ctx.user.role === 'admin';

    if (!hasAccess) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Access denied to this school'
      });
    }
  }

  return next();
});

/**
 * Audit logging middleware
 */
export const auditLogMiddleware = (action: string) => {
  return t.middleware(async ({ input, ctx, next }) => {
    const startTime = Date.now();
    
    try {
      const result = await next();
      
      // Log successful operation
      if (ctx.user) {
        await logAuditEvent({
          userId: ctx.user.id,
          action,
          resourceType: 'api',
          resourceId: null,
          newValues: input,
          ipAddress: ctx.req?.ip,
          userAgent: ctx.req?.headers['user-agent'],
          duration: Date.now() - startTime,
          status: 'success'
        });
      }
      
      return result;
    } catch (error) {
      // Log failed operation
      if (ctx.user) {
        await logAuditEvent({
          userId: ctx.user.id,
          action,
          resourceType: 'api',
          resourceId: null,
          newValues: input,
          ipAddress: ctx.req?.ip,
          userAgent: ctx.req?.headers['user-agent'],
          duration: Date.now() - startTime,
          status: 'error',
          error: error.message
        });
      }
      
      throw error;
    }
  });
};

/**
 * Helper function to log audit events
 */
async function logAuditEvent(event: {
  userId: number;
  action: string;
  resourceType: string;
  resourceId: number | null;
  newValues?: any;
  oldValues?: any;
  ipAddress?: string;
  userAgent?: string;
  duration?: number;
  status: 'success' | 'error';
  error?: string;
}) {
  try {
    // This would integrate with your audit logging system
    console.log('Audit Event:', {
      ...event,
      timestamp: new Date().toISOString()
    });
    
    // In production, save to audit_logs table
    // await db.auditLogs.create({ data: event });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Combine multiple middlewares
 */
export const combineMiddlewares = (...middlewares: any[]) => {
  return middlewares.reduce((combined, middleware) => {
    return combined.use(middleware);
  });
};

/**
 * Common middleware combinations
 */
export const commonMiddlewares = {
  // Basic validation and sanitization
  basic: combineMiddlewares(
    sanitizeStringsMiddleware,
    createInputSizeLimitMiddleware(),
    createRateLimitMiddleware()
  ),

  // Authenticated endpoints
  authenticated: combineMiddlewares(
    sanitizeStringsMiddleware,
    createInputSizeLimitMiddleware(),
    createRateLimitMiddleware(),
    requireAuth
  ),

  // Admin-only endpoints
  adminOnly: combineMiddlewares(
    sanitizeStringsMiddleware,
    createInputSizeLimitMiddleware(),
    createRateLimitMiddleware(50, 60000), // Stricter rate limit
    requireAuth,
    requireRole(['admin', 'super_admin'])
  ),

  // Teacher endpoints
  teacherOnly: combineMiddlewares(
    sanitizeStringsMiddleware,
    createInputSizeLimitMiddleware(),
    createRateLimitMiddleware(),
    requireAuth,
    requireRole(['teacher', 'admin', 'super_admin'])
  ),

  // School-specific endpoints
  schoolContext: combineMiddlewares(
    sanitizeStringsMiddleware,
    createInputSizeLimitMiddleware(),
    createRateLimitMiddleware(),
    requireAuth,
    requireSchoolAccess
  )
};

export default {
  createValidationMiddleware,
  sanitizeStringsMiddleware,
  createRateLimitMiddleware,
  createInputSizeLimitMiddleware,
  requireAuth,
  requireRole,
  requirePermission,
  requireSchoolAccess,
  auditLogMiddleware,
  combineMiddlewares,
  commonMiddlewares,
  sanitizeInput
};