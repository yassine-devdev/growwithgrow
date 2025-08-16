import { Pool, PoolClient, PoolConfig } from 'pg';
import { createLogger } from '../monitoring/logger.js';
import { 
  databaseConnectionsActive, 
  databaseConnectionsIdle, 
  databaseQueryDuration, 
  databaseQueryTotal,
  databaseConnectionsWaiting,
  databaseConnectionErrors
} from '../monitoring/metrics.js';

const logger = createLogger(undefined, undefined, 'database-pool-enhanced');

export interface EnhancedDatabaseConfig extends PoolConfig {
  // Basic connection settings
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | object;
  
  // Enhanced pool configuration
  min?: number;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  acquireTimeoutMillis?: number;
  
  // Load balancing and scaling
  readReplicas?: string[];
  writeHost?: string;
  readWriteRatio?: number; // 0.7 means 70% reads, 30% writes
  
  // Connection health and monitoring
  healthCheckInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
  
  // Performance optimization
  statementTimeout?: number;
  queryTimeout?: number;
  keepAlive?: boolean;
  keepAliveInitialDelayMillis?: number;
}

export interface ConnectionPoolMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
  totalQueries: number;
  averageQueryTime: number;
  errorRate: number;
  connectionErrors: number;
  poolUtilization: number;
}

export class EnhancedDatabaseConnectionPool {
  private masterPool: Pool;
  private readPools: Pool[] = [];
  private config: EnhancedDatabaseConfig;
  private queryCount = 0;
  private errorCount = 0;
  private totalQueryTime = 0;
  private healthCheckInterval?: NodeJS.Timeout;
  private isShuttingDown = false;

  constructor(config: EnhancedDatabaseConfig) {
    this.config = {
      // Default configuration optimized for production
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'production_app',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      
      // Enhanced pool configuration
      min: parseInt(process.env.DB_POOL_MIN || '5'),
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000'),
      acquireTimeoutMillis: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '5000'),
      
      // Load balancing
      readReplicas: process.env.DB_READ_REPLICAS?.split(',') || [],
      writeHost: process.env.DB_WRITE_HOST || process.env.DB_HOST,
      readWriteRatio: parseFloat(process.env.DB_READ_WRITE_RATIO || '0.7'),
      
      // Health and monitoring
      healthCheckInterval: parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '30000'),
      maxRetries: parseInt(process.env.DB_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
      
      // Performance
      statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
      queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '10000'),
      keepAlive: process.env.DB_KEEP_ALIVE === 'true',
      keepAliveInitialDelayMillis: parseInt(process.env.DB_KEEP_ALIVE_DELAY || '0'),
      
      ...config
    };

    this.initializePools();
    this.setupEventHandlers();
    this.startHealthChecks();
    this.startMetricsCollection();

    logger.info('Enhanced database connection pool initialized', {
      masterHost: this.config.host,
      readReplicas: this.config.readReplicas,
      poolConfig: {
        min: this.config.min,
        max: this.config.max,
        idleTimeout: this.config.idleTimeoutMillis,
        connectionTimeout: this.config.connectionTimeoutMillis
      }
    });
  }

  private initializePools(): void {
    // Initialize master pool for writes
    const masterConfig: PoolConfig = {
      host: this.config.writeHost || this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      ssl: this.config.ssl,
      min: this.config.min,
      max: this.config.max,
      idleTimeoutMillis: this.config.idleTimeoutMillis,
      connectionTimeoutMillis: this.config.connectionTimeoutMillis,
      statement_timeout: this.config.statementTimeout,
      query_timeout: this.config.queryTimeout,
      keepAlive: this.config.keepAlive,
      keepAliveInitialDelayMillis: this.config.keepAliveInitialDelayMillis
    };

    this.masterPool = new Pool(masterConfig);

    // Initialize read replica pools
    if (this.config.readReplicas && this.config.readReplicas.length > 0) {
      this.config.readReplicas.forEach((replicaHost, index) => {
        const readConfig: PoolConfig = {
          ...masterConfig,
          host: replicaHost,
          // Smaller pool size for read replicas
          min: Math.max(1, Math.floor((this.config.min || 5) / 2)),
          max: Math.max(2, Math.floor((this.config.max || 20) / 2))
        };

        const readPool = new Pool(readConfig);
        this.readPools.push(readPool);

        logger.info(`Read replica pool ${index + 1} initialized`, {
          host: replicaHost,
          poolSize: { min: readConfig.min, max: readConfig.max }
        });
      });
    }
  }

  private setupEventHandlers(): void {
    // Master pool events
    this.masterPool.on('connect', (client: PoolClient) => {
      logger.debug('New client connected to master pool', {
        totalCount: this.masterPool.totalCount,
        idleCount: this.masterPool.idleCount
      });
      this.updateConnectionMetrics();
    });

    this.masterPool.on('remove', (client: PoolClient) => {
      logger.debug('Client removed from master pool', {
        totalCount: this.masterPool.totalCount,
        idleCount: this.masterPool.idleCount
      });
      this.updateConnectionMetrics();
    });

    this.masterPool.on('error', (err: Error) => {
      logger.error('Master pool error', { error: err.message, stack: err.stack });
      this.errorCount++;
      databaseConnectionErrors.inc();
    });

    // Read pool events
    this.readPools.forEach((pool, index) => {
      pool.on('connect', (client: PoolClient) => {
        logger.debug(`New client connected to read pool ${index + 1}`, {
          totalCount: pool.totalCount,
          idleCount: pool.idleCount
        });
        this.updateConnectionMetrics();
      });

      pool.on('error', (err: Error) => {
        logger.error(`Read pool ${index + 1} error`, { error: err.message });
        this.errorCount++;
        databaseConnectionErrors.inc();
      });
    });
  }

  private startHealthChecks(): void {
    if (this.config.healthCheckInterval && this.config.healthCheckInterval > 0) {
      this.healthCheckInterval = setInterval(async () => {
        await this.performHealthCheck();
      }, this.config.healthCheckInterval);
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      // Check master pool
      const masterClient = await this.masterPool.connect();
      await masterClient.query('SELECT 1');
      masterClient.release();

      // Check read pools
      for (let i = 0; i < this.readPools.length; i++) {
        try {
          const readClient = await this.readPools[i].connect();
          await readClient.query('SELECT 1');
          readClient.release();
        } catch (error) {
          logger.warn(`Read pool ${i + 1} health check failed`, { error });
        }
      }

      logger.debug('Database health check completed successfully');
    } catch (error) {
      logger.error('Master pool health check failed', { error });
      this.errorCount++;
      databaseConnectionErrors.inc();
    }
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.updateConnectionMetrics();
    }, 5000); // Update metrics every 5 seconds
  }

  private updateConnectionMetrics(): void {
    const masterStats = {
      total: this.masterPool.totalCount || 0,
      idle: this.masterPool.idleCount || 0,
      waiting: this.masterPool.waitingCount || 0
    };

    const readStats = this.readPools.reduce((acc, pool) => ({
      total: acc.total + (pool.totalCount || 0),
      idle: acc.idle + (pool.idleCount || 0),
      waiting: acc.waiting + (pool.waitingCount || 0)
    }), { total: 0, idle: 0, waiting: 0 });

    const totalStats = {
      total: masterStats.total + readStats.total,
      idle: masterStats.idle + readStats.idle,
      waiting: masterStats.waiting + readStats.waiting,
      active: (masterStats.total - masterStats.idle) + (readStats.total - readStats.idle)
    };

    // Update Prometheus metrics
    databaseConnectionsActive.set(totalStats.active);
    databaseConnectionsIdle.set(totalStats.idle);
    databaseConnectionsWaiting.set(totalStats.waiting);

    logger.debug('Connection pool metrics updated', {
      master: masterStats,
      reads: readStats,
      total: totalStats
    });
  }

  // Intelligent query routing based on operation type
  private shouldUseReadReplica(query: string): boolean {
    if (this.readPools.length === 0) return false;
    
    const readOperations = /^\s*(SELECT|WITH|EXPLAIN|SHOW|DESCRIBE|DESC)\s/i;
    const writeOperations = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|REPLACE)\s/i;
    
    if (writeOperations.test(query)) return false;
    if (readOperations.test(query)) return true;
    
    // For ambiguous queries, use read/write ratio
    return Math.random() < (this.config.readWriteRatio || 0.7);
  }

  // Get appropriate pool based on query type
  private getPool(query?: string): Pool {
    if (!query || !this.shouldUseReadReplica(query)) {
      return this.masterPool;
    }

    // Load balance across read replicas
    const availableReadPools = this.readPools.filter(pool => 
      pool.totalCount > 0 && !pool.ending
    );

    if (availableReadPools.length === 0) {
      logger.warn('No available read replicas, falling back to master');
      return this.masterPool;
    }

    // Simple round-robin selection
    const selectedIndex = this.queryCount % availableReadPools.length;
    return availableReadPools[selectedIndex];
  }

  // Enhanced query execution with automatic retries and failover
  async query(text: string, params?: any[]): Promise<any> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    const maxRetries = this.config.maxRetries || 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const pool = this.getPool(text);
        const result = await pool.query(text, params);
        
        // Update metrics
        const duration = Date.now() - startTime;
        this.queryCount++;
        this.totalQueryTime += duration;
        
        databaseQueryTotal.inc({ status: 'success' });
        databaseQueryDuration.observe(duration / 1000);

        logger.debug('Query executed successfully', {
          query: text.substring(0, 100),
          duration,
          attempt,
          pool: pool === this.masterPool ? 'master' : 'read-replica'
        });

        return result;
      } catch (error) {
        lastError = error as Error;
        this.errorCount++;
        
        logger.warn(`Query attempt ${attempt} failed`, {
          query: text.substring(0, 100),
          error: lastError.message,
          attempt,
          maxRetries
        });

        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          const delay = (this.config.retryDelay || 1000) * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    const duration = Date.now() - startTime;
    databaseQueryTotal.inc({ status: 'error' });
    databaseQueryDuration.observe(duration / 1000);

    logger.error('Query failed after all retries', {
      query: text.substring(0, 100),
      error: lastError?.message,
      attempts: maxRetries
    });

    throw lastError;
  }

  // Transaction support with automatic failover
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    // Transactions always use master pool
    const client = await this.masterPool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      
      logger.debug('Transaction completed successfully');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction rolled back', { error });
      throw error;
    } finally {
      client.release();
    }
  }

  // Get comprehensive pool statistics
  getMetrics(): ConnectionPoolMetrics {
    const masterStats = {
      total: this.masterPool.totalCount || 0,
      idle: this.masterPool.idleCount || 0,
      waiting: this.masterPool.waitingCount || 0
    };

    const readStats = this.readPools.reduce((acc, pool) => ({
      total: acc.total + (pool.totalCount || 0),
      idle: acc.idle + (pool.idleCount || 0),
      waiting: acc.waiting + (pool.waitingCount || 0)
    }), { total: 0, idle: 0, waiting: 0 });

    const totalConnections = masterStats.total + readStats.total;
    const activeConnections = (masterStats.total - masterStats.idle) + (readStats.total - readStats.idle);
    const idleConnections = masterStats.idle + readStats.idle;
    const waitingClients = masterStats.waiting + readStats.waiting;

    const averageQueryTime = this.queryCount > 0 
      ? this.totalQueryTime / this.queryCount 
      : 0;

    const errorRate = this.queryCount > 0 
      ? (this.errorCount / this.queryCount) * 100 
      : 0;

    const poolUtilization = totalConnections > 0 
      ? (activeConnections / totalConnections) * 100 
      : 0;

    return {
      totalConnections,
      activeConnections,
      idleConnections,
      waitingClients,
      totalQueries: this.queryCount,
      averageQueryTime,
      errorRate,
      connectionErrors: this.errorCount,
      poolUtilization
    };
  }

  // Graceful shutdown
  async close(): Promise<void> {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    logger.info('Closing database connection pools...');

    try {
      // Close master pool
      await this.masterPool.end();
      logger.info('Master pool closed');

      // Close read pools
      await Promise.all(this.readPools.map(async (pool, index) => {
        await pool.end();
        logger.info(`Read pool ${index + 1} closed`);
      }));

      logger.info('All database connection pools closed successfully');
    } catch (error) {
      logger.error('Error closing database pools', { error });
      throw error;
    }
  }

  // Pool status for health checks
  isHealthy(): boolean {
    const masterHealthy = this.masterPool.totalCount > 0 && !this.masterPool.ending;
    const readReplicasHealthy = this.readPools.length === 0 || 
      this.readPools.some(pool => pool.totalCount > 0 && !pool.ending);
    
    return masterHealthy && readReplicasHealthy && !this.isShuttingDown;
  }
}

// Singleton instance for application use
export const enhancedDatabasePool = new EnhancedDatabaseConnectionPool({});

// Graceful shutdown handler
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing database pools...');
  await enhancedDatabasePool.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing database pools...');
  await enhancedDatabasePool.close();
  process.exit(0);
});