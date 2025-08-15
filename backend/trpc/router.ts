import { initTRPC, TRPCError } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { z } from 'zod';
import { Context, WSContext } from './context';
import { AppError, UnauthorizedError, ForbiddenError } from '../shared/types';

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
        httpStatus: error instanceof AppError ? error.statusCode : 500,
      },
    };
  },
});

// Create reusable middleware
const isAuthenticated = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const isAdmin = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const isTeacherOrAdmin = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  if (!['admin', 'teacher'].includes(ctx.user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Teacher or admin access required',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Audit logging middleware
const auditLog = t.middleware(async ({ next, ctx, path, type, input }) => {
  const start = Date.now();
  
  // Log the request
  console.log(`[${new Date().toISOString()}] ${type.toUpperCase()} ${path}`, {
    userId: ctx.user?.id,
    input: type === 'mutation' ? '[REDACTED]' : input,
  });
  
  const result = await next();
  
  const duration = Date.now() - start;
  
  // Log the response
  console.log(`[${new Date().toISOString()}] ${type.toUpperCase()} ${path} completed in ${duration}ms`, {
    success: result.ok,
    userId: ctx.user?.id,
  });
  
  return result;
});

// Export router factory and procedure builders
export const router = t.router;
export const publicProcedure = t.procedure.use(auditLog);
export const protectedProcedure = t.procedure.use(auditLog).use(isAuthenticated);
export const adminProcedure = t.procedure.use(auditLog).use(isAdmin);
export const teacherProcedure = t.procedure.use(auditLog).use(isTeacherOrAdmin);

// Subscription helpers for WebSocket
export const createSubscription = <T>(
  eventName: string,
  schema?: z.ZodSchema<T>
) => {
  return publicProcedure
    .input(schema || z.any())
    .subscription(({ input }) => {
      return observable<T>((emit) => {
        // This would connect to your event system (Redis, EventEmitter, etc.)
        const eventHandler = (data: T) => {
          emit.next(data);
        };
        
        // Subscribe to events
        // eventBus.on(eventName, eventHandler);
        
        // Cleanup function
        return () => {
          // eventBus.off(eventName, eventHandler);
        };
      });
    });
};