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
      const masterClient = await this.masterPool