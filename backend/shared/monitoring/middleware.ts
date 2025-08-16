import { Request, Response, NextFunction } from 'express';
import { 
  httpRequestDuration, 
  httpRequestTotal, 
  httpRequestsInProgress,
  errorTotal 
} from './metrics.js';

export interface MetricsRequest extends Request {
  startTime?: number;
  route?: {
    path: string;
  };
}

// HTTP Metrics Middleware
export function metricsMiddleware(req: MetricsRequest, res: Response, next: NextFunction) {
  const startTime = Date.now();
  req.startTime = startTime;
  
  const method = req.method;
  const route = req.route?.path || req.path || 'unknown';
  
  // Increment in-progress requests
  httpRequestsInProgress.inc({ method, route });
  
  // Handle response completion
  const onFinish = () => {
    const duration = (Date.now() - startTime) / 1000;
    const statusCode = res.statusCode.toString();
    
    // Record metrics
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    httpRequestTotal.inc({ method, route, status_code: statusCode });
    httpRequestsInProgress.dec({ method, route });
    
    // Record errors for 4xx and 5xx status codes
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      const severity = res.statusCode >= 500 ? 'error' : 'warning';
      errorTotal.inc({ type: errorType, severity, component: 'http' });
    }
    
    // Clean up listeners
    res.removeListener('finish', onFinish);
    res.removeListener('close', onFinish);
  };
  
  res.on('finish', onFinish);
  res.on('close', onFinish);
  
  next();
}

// Database Metrics Wrapper
export function withDatabaseMetrics<T extends any[], R>(
  operation: string,
  table: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    let status = 'success';
    
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      status = 'error';
      errorTotal.inc({ type: 'database_error', severity: 'error', component: 'database' });
      throw error;
    } finally {
      const duration = (Date.now() - startTime) / 1000;
      databaseQueryDuration.observe({ operation, table }, duration);
      databaseQueryTotal.inc({ operation, table, status });
    }
  };
}

// AI Service Metrics Wrapper
export function withAIMetrics<T extends any[], R>(
  provider: string,
  model: string,
  operation: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    let status = 'success';
    
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      status = 'error';
      errorTotal.inc({ type: 'ai_service_error', severity: 'error', component: 'ai' });
      throw error;
    } finally {
      const duration = (Date.now() - startTime) / 1000;
      aiRequestDuration.observe({ provider, model, operation }, duration);
      aiRequestTotal.inc({ provider, model, operation, status });
    }
  };
}

// Cache Metrics Wrapper
export function withCacheMetrics<T extends any[], R>(
  cacheType: string,
  keyPattern: string,
  operation: 'get' | 'set' | 'del',
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      
      // For get operations, track hits/misses
      if (operation === 'get') {
        if (result !== null && result !== undefined) {
          cacheHits.inc({ cache_type: cacheType, key_pattern: keyPattern });
        } else {
          cacheMisses.inc({ cache_type: cacheType, key_pattern: keyPattern });
        }
      }
      
      return result;
    } finally {
      const duration = (Date.now() - startTime) / 1000;
      cacheOperationDuration.observe({ operation, cache_type: cacheType }, duration);
    }
  };
}

// Business Metrics Helpers
export const BusinessMetrics = {
  recordUserRegistration(source: string, planType: string) {
    userRegistrations.inc({ source, plan_type: planType });
  },
  
  recordUserLogin(method: string) {
    userLogins.inc({ method });
  },
  
  updateActiveUsers(count: number, timeWindow: string) {
    activeUsers.set({ time_window: timeWindow }, count);
  },
  
  recordFeatureUsage(feature: string, userType: string) {
    featureUsage.inc({ feature, user_type: userType });
  },
  
  updateSubscriptionRevenue(amount: number, planType: string, billingCycle: string) {
    subscriptionRevenue.set({ plan_type: planType, billing_cycle: billingCycle }, amount);
  },
  
  recordAITokenUsage(provider: string, model: string, inputTokens: number, outputTokens: number) {
    aiTokensUsed.inc({ provider, model, type: 'input' }, inputTokens);
    aiTokensUsed.inc({ provider, model, type: 'output' }, outputTokens);
  },
  
  recordAICost(provider: string, model: string, cost: number) {
    aiCostEstimate.inc({ provider, model }, cost);
  }
};

// WebSocket Metrics Helpers
export const WebSocketMetrics = {
  incrementConnections() {
    websocketConnections.inc();
  },
  
  decrementConnections() {
    websocketConnections.dec();
  },
  
  recordMessage(direction: 'inbound' | 'outbound', type: string) {
    websocketMessages.inc({ direction, type });
  }
};

// System Metrics Collection
export function collectSystemMetrics() {
  const memUsage = process.memoryUsage();
  memoryUsage.set({ type: 'heap_used' }, memUsage.heapUsed);
  memoryUsage.set({ type: 'heap_total' }, memUsage.heapTotal);
  memoryUsage.set({ type: 'external' }, memUsage.external);
  memoryUsage.set({ type: 'rss' }, memUsage.rss);
  
  // CPU usage (simplified - in production you might want to use a more sophisticated method)
  const cpuUsagePercent = process.cpuUsage();
  const totalCpuTime = cpuUsagePercent.user + cpuUsagePercent.system;
  cpuUsage.set(totalCpuTime / 1000000); // Convert microseconds to seconds
}

// Start system metrics collection
setInterval(collectSystemMetrics, 10000); // Collect every 10 seconds