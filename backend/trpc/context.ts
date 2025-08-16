import { inferAsyncReturnType } from '@trpc/server';
import { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';
import { UserRole } from '../shared/types';
import { SecurityMiddleware, SecurityContext, SecurityViolation } from '../middleware/security';

// Mock user for now - will be replaced with real authentication
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId?: number;
  isActive: boolean;
}

// Context for HTTP requests
export const createHTTPContext = async (opts: CreateHTTPContextOptions) => {
  const { req, res } = opts;
  
  // Create security context
  const securityContext = SecurityMiddleware.createSecurityContext(req);
  
  // Get security information from request (added by adapter)
  const securityInfo = (req as any).security || {
    violations: [],
    headers: {},
    allowed: true
  };
  
  // Extract authentication token from headers
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  // Mock authentication - replace with real JWT verification
  let user: User | null = null;
  if (token) {
    // This would normally verify the JWT and fetch user from database
    user = {
      id: 1,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      schoolId: 1,
      isActive: true,
    };
    
    // Update security context with user ID
    securityContext.userId = user.id;
  }
  
  return {
    req,
    res,
    user,
    token,
    security: {
      context: securityContext,
      violations: securityInfo.violations,
      headers: securityInfo.headers,
      allowed: securityInfo.allowed
    }
  };
};

// Context for WebSocket connections
export const createWSContext = async (opts: CreateWSSContextFnOptions) => {
  const { req } = opts;
  
  // Create security context for WebSocket
  const securityContext = SecurityMiddleware.createSecurityContext(req);
  
  // Extract authentication from WebSocket connection
  const token = req.url?.split('token=')[1];
  
  // Mock authentication for WebSocket
  let user: User | null = null;
  if (token) {
    user = {
      id: 1,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      schoolId: 1,
      isActive: true,
    };
    
    // Update security context with user ID
    securityContext.userId = user.id;
  }
  
  return {
    user,
    token,
    security: {
      context: securityContext,
      violations: [],
      headers: {},
      allowed: true
    }
  };
};

export type Context = inferAsyncReturnType<typeof createHTTPContext>;
export type WSContext = inferAsyncReturnType<typeof createWSContext>;