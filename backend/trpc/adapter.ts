import { api } from "encore.dev/api";
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { createWSServer } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { appRouter } from './app-router';
import { createHTTPContext, createWSContext } from './context';

// CORS configuration
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://localhost:3000',
  'https://localhost:5173',
];

const isValidOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true; // Allow requests without origin (e.g., mobile apps)
  return CORS_ORIGINS.includes(origin) || CORS_ORIGINS.includes('*');
};

// Create HTTP handler for tRPC
const httpHandler = createHTTPServer({
  router: appRouter,
  createContext: createHTTPContext,
  responseMeta({ ctx, paths, type, errors }) {
    const origin = ctx.req.headers.origin;
    
    // Set CORS headers
    const headers: Record<string, string> = {
      'Access-Control-Allow-Origin': isValidOrigin(origin) ? (origin || '*') : 'null',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
    };

    // Security headers
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-Frame-Options'] = 'DENY';
    headers['X-XSS-Protection'] = '1; mode=block';
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

    // Set cache headers for queries
    if (type === 'query' && errors.length === 0) {
      headers['Cache-Control'] = 'max-age=60, stale-while-revalidate=300';
    } else if (type === 'mutation') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }

    // Rate limiting headers (would be implemented with actual rate limiter)
    headers['X-RateLimit-Limit'] = '1000';
    headers['X-RateLimit-Remaining'] = '999';
    headers['X-RateLimit-Reset'] = String(Math.floor(Date.now() / 1000) + 3600);

    return { headers };
  },
  onError({ error, type, path, input, ctx, req }) {
    // Log errors for monitoring
    console.error(`❌ tRPC Error on ${type} ${path}:`, {
      error: error.message,
      code: error.code,
      userId: ctx?.user?.id,
      input: type === 'mutation' ? '[REDACTED]' : input,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
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
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      const origin = req.headers?.origin;
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': isValidOrigin(origin) ? (origin || '*') : 'null',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
        body: '',
      };
    }

    // Convert Encore request to Node.js request format
    const nodeReq = {
      method: req.method,
      url: req.url,
      headers: req.headers || {},
      body: req.body,
      connection: {
        remoteAddress: req.headers?.['x-forwarded-for'] || 'unknown',
      },
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
        headers: responseHeaders,
        body: responseBody,
      };
    } catch (error) {
      console.error('tRPC Handler Error:', error);
      
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': isValidOrigin(req.headers?.origin) ? (req.headers?.origin || '*') : 'null',
          'Access-Control-Allow-Credentials': 'true',
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