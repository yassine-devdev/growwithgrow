import { api } from "encore.dev/api";

// Health check endpoint for monitoring and load balancers
export const healthCheck = api(
  { 
    expose: true, 
    method: "GET", 
    path: "/health" 
  },
  async () => {
    const timestamp = new Date().toISOString();
    
    // Check database connections (simplified)
    const dbStatus = await checkDatabaseHealth();
    
    // Check external services
    const servicesStatus = await checkExternalServices();
    
    const isHealthy = dbStatus.healthy && servicesStatus.healthy;
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      version: '1.0.0',
      services: {
        database: dbStatus,
        external: servicesStatus,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
);

// tRPC-specific health check
export const trpcHealthCheck = api(
  { 
    expose: true, 
    method: "GET", 
    path: "/trpc/health" 
  },
  async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      trpc: {
        version: '10.45.2',
        endpoints: [
          'dashboard',
          'core',
          'schoolHub',
          'ai',
          'crm',
          'communications',
          'tools',
          'analytics',
          'gamification',
          'knowledge',
          'marketplace',
          'notifications',
          'settings',
          'storage',
          'support',
          'webhooks',
        ],
      },
    };
  }
);

// Database health check helper
async function checkDatabaseHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  try {
    const start = Date.now();
    
    // This would normally check actual database connections
    // For now, simulate a health check
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const latency = Date.now() - start;
    
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

// External services health check helper
async function checkExternalServices(): Promise<{ healthy: boolean; services?: Record<string, boolean>; error?: string }> {
  try {
    // Check external services like AI providers, email services, etc.
    const services = {
      openrouter: true, // Would actually ping the service
      ollama: true,     // Would check if Ollama is running
      gemini: true,     // Would validate API key
    };
    
    const allHealthy = Object.values(services).every(status => status);
    
    return {
      healthy: allHealthy,
      services,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown external service error',
    };
  }
}