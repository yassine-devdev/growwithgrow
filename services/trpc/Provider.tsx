import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, createTRPCClient } from './client';

interface TRPCProviderProps {
  children: React.ReactNode;
}

// Create a custom hook to get auth token
const useAuthToken = () => {
  // This would normally get the token from your auth system
  // For now, return null (unauthenticated)
  return null;
};

export const TRPCProvider: React.FC<TRPCProviderProps> = ({ children }) => {
  const getToken = () => useAuthToken();
  
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache time: 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus
            refetchOnWindowFocus: true,
            // Refetch on reconnect
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
            // Show error notifications for mutations
            onError: (error) => {
              console.error('Mutation error:', error);
              // You could show a toast notification here
            },
          },
        },
      })
  );

  const [trpcClient] = useState(() => createTRPCClient(getToken));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
};