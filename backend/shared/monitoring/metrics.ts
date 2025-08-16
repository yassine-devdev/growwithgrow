import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// Collect default Node.js metrics
collectDefaultMetrics({ register });

// HTTP Request Metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const httpRequestsInProgress = new Gauge({
  name: 'http_requests_in_progress',
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['method', 'route']
});

// Database Metrics
export const databaseConnectionsActive = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

export const databaseConnectionsIdle = new Gauge({
  name: 'database_connections_idle',
  help: 'Number of idle database connections'
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5]
});

export const databaseQueryTotal = new Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status']
});

// AI Service Metrics
export const aiRequestDuration = new Histogram({
  name: 'ai_request_duration_seconds',
  help: 'Duration of AI service requests in seconds',
  labelNames: ['provider', 'model', 'operation'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60]
});

export const aiRequestTotal = new Counter({
  name: 'ai_requests_total',
  help: 'Total number of AI service requests',
  labelNames: ['provider', 'model', 'operation', 'status']
});

export const aiTokensUsed = new Counter({
  name: 'ai_tokens_used_total',
  help: 'Total number of AI tokens consumed',
  labelNames: ['provider', 'model', 'type'] // type: input, output
});

export const aiCostEstimate = new Counter({
  name: 'ai_cost_estimate_total',
  help: 'Estimated cost of AI service usage in USD',
  labelNames: ['provider', 'model']
});

// Business Metrics
export const userRegistrations = new Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['source', 'plan_type']
});

export const userLogins = new Counter({
  name: 'user_logins_total',
  help: 'Total number of user logins',
  labelNames: ['method'] // method: password, oauth, etc.
});

export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of currently active users',
  labelNames: ['time_window'] // time_window: 5m, 15m, 1h, 24h
});

export const featureUsage = new Counter({
  name: 'feature_usage_total',
  help: 'Total usage count of application features',
  labelNames: ['feature', 'user_type']
});

export const subscriptionRevenue = new Gauge({
  name: 'subscription_revenue_usd',
  help: 'Current subscription revenue in USD',
  labelNames: ['plan_type', 'billing_cycle']
});

// WebSocket Metrics
export const websocketConnections = new Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections'
});

export const websocketMessages = new Counter({
  name: 'websocket_messages_total',
  help: 'Total number of WebSocket messages',
  labelNames: ['direction', 'type'] // direction: inbound, outbound
});

// Cache Metrics
export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type', 'key_pattern']
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type', 'key_pattern']
});

export const cacheOperationDuration = new Histogram({
  name: 'cache_operation_duration_seconds',
  help: 'Duration of cache operations in seconds',
  labelNames: ['operation', 'cache_type'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
});

// Error Metrics
export const errorTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity', 'component']
});

export const unhandledErrors = new Counter({
  name: 'unhandled_errors_total',
  help: 'Total number of unhandled errors',
  labelNames: ['type', 'component']
});

// System Resource Metrics
export const memoryUsage = new Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type'] // type: heap_used, heap_total, external, rss
});

export const cpuUsage = new Gauge({
  name: 'cpu_usage_percent',
  help: 'CPU usage percentage'
});

export const diskUsage = new Gauge({
  name: 'disk_usage_bytes',
  help: 'Disk usage in bytes',
  labelNames: ['mount_point', 'type'] // type: used, available, total
});

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(httpRequestsInProgress);
register.registerMetric(databaseConnectionsActive);
register.registerMetric(databaseConnectionsIdle);
register.registerMetric(databaseQueryDuration);
register.registerMetric(databaseQueryTotal);
register.registerMetric(aiRequestDuration);
register.registerMetric(aiRequestTotal);
register.registerMetric(aiTokensUsed);
register.registerMetric(aiCostEstimate);
register.registerMetric(userRegistrations);
register.registerMetric(userLogins);
register.registerMetric(activeUsers);
register.registerMetric(featureUsage);
register.registerMetric(subscriptionRevenue);
register.registerMetric(websocketConnections);
register.registerMetric(websocketMessages);
register.registerMetric(cacheHits);
register.registerMetric(cacheMisses);
register.registerMetric(cacheOperationDuration);
register.registerMetric(errorTotal);
register.registerMetric(unhandledErrors);
register.registerMetric(memoryUsage);
register.registerMetric(cpuUsage);
register.registerMetric(diskUsage);

// Export the registry for the metrics endpoint
export { register };