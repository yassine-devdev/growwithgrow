import { api } from "encore.dev/api";
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { createWSServer } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { appRouter } from './app-router';
import { createHTTPContext, createWSContext } from './context';
import { SecurityMiddleware } from '../middleware/security';

// Security middleware will handle CORS configuration

// Create HTTP handler for tRPC
const httpHandler = createHTTPServer({
  router: appRouter,
  createContext: createHTTPContext,
  responseMeta({ ctx, paths, type, errors }) {
    // Security headers are now handled by SecurityMiddleware
    // Get headers from security context if available
    const securityHeaders = ctx.security?.headers || {};
    
    // Set cache headers for queries
    const cacheHeaders: Record<string, string> = {};
    if (type === 'query' && errors.length === 0) {
      cacheHeaders['Cache-Control'] = 'max-age=60, stale-while-revalidate=300';
    } else if (type === 'mutation') {
      cacheHeaders['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }

    return { 
      headers: {
        ...securityHeaders,
        ...cacheHeaders
      }
    };
  },
  onError({ error, type, path, input, ctx, req }) {
    // Log errors for monitoring with security context
    const securityContext = ctx.security?.context;
    console.error(`❌ tRPC Error on ${type} ${path}:`, {
      error: error.message,
      code: error.code,
      userId: ctx?.user?.id,
      input: type === 'mutation' ? '[REDACTED]' : input,
      userAgent: securityContext?.userAgent,
      ip: securityContext?.ip,
      requestId: securityContext?.requestId,
      securityViolations: ctx.security?.violations?.length || 0,
    });
  },
});

// Encore.ts API endpoint for tRPC HTTP requests
export const trpcHandler = api(
  { 
    expose: true, 
    method: "*", 
    path: "/trpc/*path" 
  },
  async (req) => {
    // Apply security middleware first
    const securityResult = await SecurityMiddleware.applySecurityMiddleware(req, null);
    
    // If security middleware blocked the request, return early
    if (!securityResult.allowed) {
      return {
        statusCode: securityResult.statusCode || 403,
        headers: securityResult.headers,
        body: securityResult.body || JSON.stringify({
          error: {
            message: 'Request blocked by security middleware',
            code: 'SECURITY_VIOLATION'
          }
        })
      };
    }
    
    // Handle preflight OPTIONS requests (already handled by security middleware)
    if (req.method === 'OPTIONS') {
      return {
        statusCode: securityResult.statusCode || 200,
        headers: securityResult.headers,
        body: securityResult.body || '',
      };
    }

    // Convert Encore request to Node.js request format with security context
    const nodeReq = {
      method: req.method,
      url: req.url,
      headers: req.headers || {},
      body: req.body,
      connection: {
        remoteAddress: req.headers?.['x-forwarded-for'] || 'unknown',
      },
      security: securityResult, // Add security context to request
    } as any;

    let responseBody = '';
    const responseHeaders: Record<string, string> = {};
    let statusCode = 200;

    const nodeRes = {
      statusCode: 200,
      headers: responseHeaders,
      write: (chunk: any) => {
        responseBody += chunk;
      },
      end: (chunk?: any) => {
        if (chunk) responseBody += chunk;
      },
      setHeader: (name: string, value: string) => {
        responseHeaders[name] = value;
      },
      getHeader: (name: string) => responseHeaders[name],
      removeHeader: (name: string) => {
        delete responseHeaders[name];
      },
      writeHead: (code: number, headers?: Record<string, string>) => {
        statusCode = code;
        if (headers) {
          Object.assign(responseHeaders, headers);
        }
      },
    } as any;

    try {
      // Handle the request through tRPC
      await new Promise<void>((resolve, reject) => {
        httpHandler.handler(nodeReq, nodeRes, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      return {
        statusCode: statusCode,
        headers: {
          ...securityResult.headers, // Include security headers
          ...responseHeaders
        },
        body: responseBody,
      };
    } catch (error) {
      console.error('tRPC Handler Error:', error);
      
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          ...securityResult.headers, // Include security headers even on error
        },
        body: JSON.stringify({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_SERVER_ERROR',
          },
        }),
      };
    }
  }
);

// WebSocket server for subscriptions
let wsServer: WebSocketServer | null = null;

export const startWebSocketServer = (port: number = 3001) => {
  if (wsServer) {
    return wsServer;
  }

  wsServer = new WebSocketServer({ port });
  
  const wsHandler = createWSServer({
    wss: wsServer,
    router: appRouter,
    createContext: createWSContext,
  });

  console.log(`🚀 tRPC WebSocket server started on port ${port}`);
  
  return wsServer;
};

export const stopWebSocketServer = () => {
  if (wsServer) {
    wsServer.close();
    wsServer = null;
    console.log('🛑 tRPC WebSocket server stopped');
  }
};