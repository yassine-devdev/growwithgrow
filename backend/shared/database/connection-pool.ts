import { Pool, PoolClient, PoolConfig } from 'pg';
import { createLogger } from '../monitoring/logger.js';
import { databaseConnectionsActive, databaseConnectionsIdle, databaseQueryDuration, databaseQueryTotal } from '../monitoring/metrics.js';

const logger = createLogger(undefined, undefined, 'database-pool');

export interface DatabaseConfig extends PoolConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | object;
  // Pool-specific options
  min?: number;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  // Performance options
  statement_timeout?: number;
  query_timeout?: number;
  // Monitoring options
  log?: boolean;
}

export class DatabaseConnectionPool {
  private pool: Pool;
  private config: DatabaseConfig;
  private queryCount = 0;
  private connectionCount = 0;

  constructor(config: DatabaseConfig) {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'production_app',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      // Pool configuration
      min: 5, // Minimum connections
      max: 20, // Maximum connections
      idleTimeoutMillis: 30000, // 30 seconds
      connectionTimeoutMillis: 10000, // 10 seconds
      // Performance settings
      statement_timeout: 30000, // 30 seconds
      query_timeout: 30000, // 30 seconds
      // Enable logging
      log: process.env.NODE_ENV !== 'production',
      ...config
    };

    this.pool = new Pool(this.config);
    this.setupEventHandlers();
    this.startMetricsCollection();
  }

  private setupEventHandlers(): void {
    this.pool.on('connect', (client: PoolClient) => {
      this.connectionCount++;
      logger.debug('Database client connected', { 
        totalConnections: this.connectionCount,
        poolSize: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount
      });
    });

    this.pool.on('acquire', (client: PoolClient) => {
      logger.debug('Database client acquired from pool');
    });

    this.pool.on('remove', (client: PoolClient) => {
      this.connectionCount--;
      logger.debug('Database client removed from pool', { 
        totalConnections: this.connectionCount 
      });
    });

    this.pool.on('error', (error: Error, client: PoolClient) => {
      logger.error('Database pool error', error);
    });

    // Handle process termination
    process.on('SIGINT', () => this.close());
    process.on('SIGTERM', () => this.close());
  }

  private startMetricsCollection(): void {
    // Update metrics every 10 seconds
    setInterval(() => {
      databaseConnectionsActive.set(this.pool.totalCount - this.pool.idleCount);
      databaseConnectionsIdle.set(this.pool.idleCount);
    }, 10000);
  }

  // Execute a query with performance monitoring
  async query<T = any>(
    text: string, 
    params?: any[], 
    options?: {
      timeout?: number;
      operation?: string;
      table?: string;
    }
  ): Promise<{ rows: T[]; rowCount: number; duration: number }> {
    const startTime = Date.now();
    const operation = options?.operation || this.inferOperation(text);
    const table = options?.table || this.inferTable(text);
    
    let client: PoolClient | null = null;
    
    try {
      client = await this.pool.connect();
      
      // Set query timeout if specified
      if (options?.timeout) {
        await client.query(`SET statement_timeout = ${options.timeout}`);
      }
      
      const result = await client.query(text, params);
      const duration = Date.now() - startTime;
      
      this.queryCount++;
      
      // Record metrics
      databaseQueryDuration.observe({ operation, table }, duration / 1000);
      databaseQueryTotal.inc({ operation, table, status: 'success' });
      
      // Log slow queries
      if (duration > 1000) {
        logger.warn('Slow query detected', {
          query: text.substring(0, 100),
          duration,
          operation,
          table,
          rowCount: result.rowCount
        });
      } else if (this.config.log) {
        logger.debug('Query executed', {
          operation,
          table,
          duration,
          rowCount: result.rowCount
        });
      }
      
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        duration
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      databaseQueryDuration.observe({ operation, table }, duration / 1000);
      databaseQueryTotal.inc({ operation, table, status: 'error' });
      
      logger.error('Database query error', error, {
        query: text.substring(0, 100),
        params: params?.length,
        duration,
        operation,
        table
      });
      
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  // Execute multiple queries in a transaction
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    options?: { timeout?: number }
  ): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      if (options?.timeout) {
        await client.query(`SET statement_timeout = ${options.timeout}`);
      }
      
      const result = await callback(client);
      
      await client.query('COMMIT');
      
      logger.debug('Transaction completed successfully');
      return result;
      
    } catch (error) {
      await client.query('ROLLBACK');
      
      logger.error('Transaction rolled back', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Batch insert with optimized performance
  async batchInsert<T>(
    table: string,
    columns: string[],
    data: T[][],
    options?: {
      batchSize?: number;
      onConflict?: string;
      returning?: string[];
    }
  ): Promise<void> {
    const { batchSize = 1000, onConflict, returning } = options || {};
    
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      const placeholders = batch.map((_, rowIndex) => {
        const rowPlaceholders = columns.map((_, colIndex) => 
          `$${rowIndex * columns.length + colIndex + 1}`
        );
        return `(${rowPlaceholders.join(', ')})`;
      }).join(', ');
      
      const values = batch.flat();
      
      let query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
      
      if (onConflict) {
        query += ` ${onConflict}`;
      }
      
      if (returning) {
        query += ` RETURNING ${returning.join(', ')}`;
      }
      
      await this.query(query, values, { 
        operation: 'INSERT', 
        table,
        timeout: 60000 // 1 minute timeout for batch operations
      });
    }
    
    logger.info('Batch insert completed', {
      table,
      totalRows: data.length,
      batches: batches.length,
      batchSize
    });
  }

  // Execute prepared statement
  async prepare(
    name: string,
    text: string,
    params?: any[]
  ): Promise<{ rows: any[]; rowCount: number; duration: number }> {
    const client = await this.pool.connect();
    
    try {
      // Prepare the statement
      await client.query(`PREPARE ${name} AS ${text}`);
      
      // Execute the prepared statement
      const startTime = Date.now();
      const result = await client.query(`EXECUTE ${name}${params ? `(${params.map(() => '$1').join(', ')})` : ''}`, params);
      const duration = Date.now() - startTime;
      
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        duration
      };
      
    } finally {
      // Clean up prepared statement
      await client.query(`DEALLOCATE ${name}`).catch(() => {});
      client.release();
    }
  }

  // Get connection pool statistics
  getPoolStats(): {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
    activeCount: number;
    queryCount: number;
    connectionCount: number;
  } {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      activeCount: this.pool.totalCount - this.pool.idleCount,
      queryCount: this.queryCount,
      connectionCount: this.connectionCount
    };
  }

  // Health check
  async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    poolStats?: any;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      await this.query('SELECT 1 as health_check', [], { timeout: 5000 });
      const latency = Date.now() - startTime;
      
      return {
        healthy: true,
        latency,
        poolStats: this.getPoolStats()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        poolStats: this.getPoolStats()
      };
    }
  }

  // Close all connections
  async close(): Promise<void> {
    try {
      await this.pool.end();
      logger.info('Database connection pool closed');
    } catch (error) {
      logger.error('Error closing database pool', error);
    }
  }

  // Private helper methods
  private inferOperation(query: string): string {
    const normalizedQuery = query.trim().toUpperCase();
    
    if (normalizedQuery.startsWith('SELECT')) return 'SELECT';
    if (normalizedQuery.startsWith('INSERT')) return 'INSERT';
    if (normalizedQuery.startsWith('UPDATE')) return 'UPDATE';
    if (normalizedQuery.startsWith('DELETE')) return 'DELETE';
    if (normalizedQuery.startsWith('CREATE')) return 'CREATE';
    if (normalizedQuery.startsWith('DROP')) return 'DROP';
    if (normalizedQuery.startsWith('ALTER')) return 'ALTER';
    
    return 'OTHER';
  }

  private inferTable(query: string): string {
    const normalizedQuery = query.trim().toUpperCase();
    
    // Simple table name extraction (can be improved with proper SQL parsing)
    const patterns = [
      /FROM\s+(\w+)/,
      /INSERT\s+INTO\s+(\w+)/,
      /UPDATE\s+(\w+)/,
      /DELETE\s+FROM\s+(\w+)/,
      /CREATE\s+TABLE\s+(\w+)/,
      /DROP\s+TABLE\s+(\w+)/,
      /ALTER\s+TABLE\s+(\w+)/
    ];
    
    for (const pattern of patterns) {
      const match = normalizedQuery.match(pattern);
      if (match) {
        return match[1].toLowerCase();
      }
    }
    
    return 'unknown';
  }
}

// Singleton instance
export const databasePool = new DatabaseConnectionPool({});