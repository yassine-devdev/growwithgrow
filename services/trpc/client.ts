import { createTRPCReact } from '@trpc/react-query';
import { createTRPCProxyClient, httpBatchLink, wsLink, splitLink } from '@trpc/client';
import { createWSClient } from '@trpc/client';
import type { AppRouter } from '../../types/app-router';

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Environment configuration
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser should use relative URL
    return '';
  }
  
  // Development
  if (import.meta.env.DEV) {
    return 'http://localhost:4000';
  }
  
  // Production - replace with your actual domain
  return 'https://your-domain.com';
};

const getWsUrl = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = import.meta.env.DEV ? '3001' : window.location.port;
    return `${protocol}//${host}:${port}`;
  }
  
  // Development
  if (import.meta.env.DEV) {
    return 'ws://localhost:3001';
  }
  
  // Production
  return 'wss://your-domain.com:3001';
};

// Create WebSocket client for subscriptions
let wsClient: ReturnType<typeof createWSClient> | null = null;

const getWSClient = () => {
  if (!wsClient && typeof window !== 'undefined') {
    wsClient = createWSClient({
      url: getWsUrl(),
    });
  }
  return wsClient;
};

// Create tRPC client configuration
export const createTRPCClient = (getToken?: () => string | null) => {
  const httpLink = httpBatchLink({
    url: `${getBaseUrl()}/trpc`,
    headers: () => {
      const token = getToken?.();
      return {
        authorization: token ? `Bearer ${token}` : '',
        'content-type': 'application/json',
      };
    },
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        credentials: 'include',
      });
    },
  });

  const wsLinkInstance = wsLink({
    client: getWSClient()!,
  });

  // Split link to use WebSocket for subscriptions and HTTP for queries/mutations
  const splitLinkConfig = splitLink({
    condition: (op) => op.type === 'subscription',
    true: wsLinkInstance,
    false: httpLink,
  });

  return trpc.createClient({
    links: [splitLinkConfig],
    transformer: undefined, // We'll use JSON serialization
  });
};

// Create a vanilla tRPC client for use outside of React
export const createVanillaTRPCClient = (getToken?: () => string | null) => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/trpc`,
        headers: () => {
          const token = getToken?.();
          return {
            authorization: token ? `Bearer ${token}` : '',
            'content-type': 'application/json',
          };
        },
      }),
    ],
  });
};

// Export types for use in components
export type { AppRouter };