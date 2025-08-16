import { createLogger } from '../monitoring/logger.js';
import { databaseConnectionsActive, databaseConnectionsIdle, databaseQueryDuration, databaseQueryTotal } from '../monitoring/metrics.js';

const logger = createLogger(undefined, undefined, 'database');

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  poolConfig?: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    createTimeoutMillis: number;
    destroyTimeoutMillis: number;
    idleTimeoutMillis: number;
    reapIntervalMillis: number;
    createRetryIntervalMillis: number;
  };
}

export interface QueryOptions {
  timeout?: number;
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
  readOnly?: boolean;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  duration: number;
  fromCache: boolean;
}

export interface ConnectionPoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: number;
}

// Database connection pool manager
export class DatabasePool {
  private config: DatabaseConfig;
  private pool: any; // This would be your actual database pool (pg.Pool, mysql2.Pool, etc.)
  private stats = {
    totalQueries: 0,
    totalQueryTime: 0,
    slowQueries: 0,
    errors: 0
  };
  private slowQueryThreshold = 1000; // 1 second
  private cache?: any; // Cache instance

  constructor(config: DatabaseConfig, cache?: any) {
    this.config = config;
    this.cache = cache;
    this.initializePool();
    this.startMetricsCollection();
  }

  private initializePool(): void {
    const poolConfig = {
      min: 2,
      max: 20,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
      ...this.config.poolConfig
    };

    // This is a mock implementation - replace with actual database pool
    this.pool = {
      config: poolConfig,
      totalCount: 0,
      idleCount: 0,
      waitingCount: 0,
      
      // Mock methods
      query: async (sql: string, params?: any[]) => {
        // Simulate database query
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        return { rows: [], rowCount: 0 };
      },
      
      connect: async () => ({
        query: this.pool.query,
        release: () => {}
      }),
      
      end: async () => {}
    };

    logger.info('Database pool initialized', {
      host: this.config.host,
      database: this.config.database,
      poolConfig
    });
  }

  private startMetricsCollection(): void {
    // Update connection metrics every 10 seconds
    setInterval(() => {
      this.updateConnectionMetrics();
    }, 10000);
  }

  private updateConnectionMetrics(): void {
    // Update Prometheus metrics
    databaseConnectionsActive.set(this.pool.totalCount - this.pool.idleCount);
    databaseConnectionsIdle.set(this.pool.idleCount);
  }

  // Execute query with performance monitoring
  async query<T = any>(
    sql: string, 
    params: any[] = [], 
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const operation = this.getOperationType(sql);
    const table = this.extractTableName(sql);
    
    let fromCache = false;
    let result: any;

    try {
      // Check cache first if enabled
      if (options.cache && this.cache && operation === 'SELECT') {
        const cacheKey = this.generateCacheKey(sql, params);
        const cachedResult = await this.cache.get(cacheKey);
        
        if (cachedResult) {
          fromCache = true;
          result = cachedResult;
          
          const duration = Date.now() - startTime;
          this.recordMetrics(operation, table, 'success', duration, true);
          
          return {
            ...result,
            fromCache: true
          };
        }
      }

      // Execute query with timeout
      const timeoutPromise = options.timeout 
        ? new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), options.timeout)
          )
        : null;

      const queryPromise = this.executeQuery(sql, params, options);
      
      result = timeoutPromise 
        ? await Promise.race([queryPromise, timeoutPromise])
        : await queryPromise;

      const duration = Date.now() - startTime;

      // Cache result if enabled and it's a SELECT query
      if (options.cache && this.cache && operation === 'SELECT' && result.rows) {
        const cacheKey = this.generateCacheKey(sql, params);
        const cacheTTL = options.cacheTTL || 300; // 5 minutes default
        await this.cache.set(cacheKey, result, { ttl: cacheTTL });
      }

      // Record metrics
      this.recordMetrics(operation, table, 'success', duration, false);

      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        this.stats.slowQueries++;
        logger.warn('Slow query detected', {
          sql: sql.substring(0, 200),
          duration,
          params: params.length
        });
      }

      return {
        rows: result.rows || [],
        rowCount: result.rowCount || result.rows?.length || 0,
        duration,
        fromCache
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.stats.errors++;
      
      this.recordMetrics(operation, table, 'error', duration, false);
      
      logger.error('Database query error', error, {
        sql: sql.substring(0, 200),
        duration,
        params: params.length
      });

      // Retry logic
      if (options.retries && options.retries > 0) {
        logger.info('Retrying query', { retriesLeft: options.retries });
        return this.query(sql, params, { ...options, retries: options.retries - 1 });
      }

      throw error;
    }
  }

  private async executeQuery(sql: string, params: any[], options: QueryOptions): Promise<any> {
    // Use read replica for read-only queries if available
    if (options.readOnly && this.hasReadReplica()) {
      return this.executeOnReadReplica(sql, params);
    }

    return this.pool.query(sql, params);
  }

  private hasReadReplica(): boolean {
    // Check if read replica is configured
    return false; // Implement based on your setup
  }

  private async executeOnReadReplica(sql: string, params: any[]): Promise<any> {
    // Execute query on read replica
    // Implement based on your read replica setup
    return this.pool.query(sql, params);
  }

  // Transaction support with automatic retry
  async transaction<T>(
    callback: (client: any) => Promise<T>,
    options: { retries?: number; timeout?: number } = {}
  ): Promise<T> {
    const startTime = Date.now();
    let client;

    try {
      client = await this.pool.connect();
      await client.query('BEGIN');

      // Set transaction timeout if specified
      if (options.timeout) {
        await client.query(`SET statement_timeout = ${options.timeout}`);
      }

      const result = await callback(client);
      await client.query('COMMIT');

      const duration = Date.now() - startTime;
      logger.debug('Transaction completed', { duration });

      return result;

    } catch (error) {
      if (client) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          logger.error('Transaction rollback failed', rollbackError);
        }
      }

      const duration = Date.now() - startTime;
      logger.error('Transaction failed', error, { duration });

      // Retry logic for transactions
      if (options.retries && options.retries > 0) {
        logger.info('Retrying transaction', { retriesLeft: options.retries });
        return this.transaction(callback, { ...options, retries: options.retries - 1 });
      }

      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  // Batch operations for better performance
  async batchInsert<T>(
    table: string,
    records: T[],
    options: { batchSize?: number; onConflict?: string } = {}
  ): Promise<void> {
    const batchSize = options.batchSize || 1000;
    const batches = this.chunkArray(records, batchSize);

    for (const batch of batches) {
      const columns = Object.keys(batch[0] as any);
      const values = batch.map(record => 
        columns.map(col => (record as any)[col])
      );

      const placeholders = values.map((_, index) => 
        `(${columns.map((_, colIndex) => `$${index * columns.length + colIndex + 1}`).join(', ')})`
      ).join(', ');

      const flatValues = values.flat();
      
      let sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
      
      if (options.onConflict) {
        sql += ` ${options.onConflict}`;
      }

      await this.query(sql, flatValues);
    }
  }

  // Bulk update operations
  async batchUpdate<T>(
    table: string,
    updates: Array<{ where: Record<string, any>; set: Record<string, any> }>,
    options: { batchSize?: number } = {}
  ): Promise<void> {
    const batchSize = options.batchSize || 100;
    const batches = this.chunkArray(updates, batchSize);

    for (const batch of batches) {
      await this.transaction(async (client) => {
        for (const update of batch) {
          const setClause = Object.keys(update.set)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
          
          const whereClause = Object.keys(update.where)
            .map((key, index) => `${key} = $${Object.keys(update.set).length + index + 1}`)
            .join(' AND ');

          const values = [...Object.values(update.set), ...Object.values(update.where)];
          const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

          await client.query(sql, values);
        }
      });
    }
  }

  // Query builder for common operations
  select(table: string) {
    return new QueryBuilder(this, 'SELECT', table);
  }

  insert(table: string) {
    return new QueryBuilder(this, 'INSERT', table);
  }

  update(table: string) {
    return new QueryBuilder(this, 'UPDATE', table);
  }

  delete(table: string) {
    return new QueryBuilder(this, 'DELETE', table);
  }

  // Get connection pool statistics
  getStats(): ConnectionPoolStats {
    const averageQueryTime = this.stats.totalQueries > 0 
      ? this.stats.totalQueryTime / this.stats.totalQueries 
      : 0;

    return {
      totalConnections: this.pool.totalCount || 0,
      activeConnections: (this.pool.totalCount || 0) - (this.pool.idleCount || 0),
      idleConnections: this.pool.idleCount || 0,
      waitingClients: this.pool.waitingCount || 0,
      totalQueries: this.stats.totalQueries,
      averageQueryTime,
      slowQueries: this.stats.slowQueries
    };
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as health_check', [], { timeout: 5000 });
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Database health check failed', error);
      return false;
    }
  }

  // Close pool
  async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database pool closed');
  }

  // Helper methods
  private recordMetrics(operation: string, table: string, status: string, duration: number, fromCache: boolean): void {
    this.stats.totalQueries++;
    this.stats.totalQueryTime += duration;

    // Update Prometheus metrics
    databaseQueryDuration.observe({ operation, table }, duration / 1000);
    databaseQueryTotal.inc({ operation, table, status });
  }

  private getOperationType(sql: string): string {
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT')) return 'SELECT';
    if (trimmed.startsWith('INSERT')) return 'INSERT';
    if (trimmed.startsWith('UPDATE')) return 'UPDATE';
    if (trimmed.startsWith('DELETE')) return 'DELETE';
    return 'OTHER';
  }

  private extractTableName(sql: string): string {
    const match = sql.match(/(?:FROM|INTO|UPDATE|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
    return match ? match[1] : 'unknown';
  }

  private generateCacheKey(sql: string, params: any[]): string {
    const hash = require('crypto')
      .createHash('md5')
      .update(sql + JSON.stringify(params))
      .digest('hex');
    return `query:${hash}`;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Query builder for fluent API
class QueryBuilder {
  private db: DatabasePool;
  private operation: string;
  private tableName: string;
  private selectFields: string[] = ['*'];
  private whereConditions: string[] = [];
  private joinClauses: string[] = [];
  private orderByClause: string = '';
  private limitClause: string = '';
  private insertData: Record<string, any> = {};
  private updateData: Record<string, any> = {};
  private params: any[] = [];

  constructor(db: DatabasePool, operation: string, table: string) {
    this.db = db;
    this.operation = operation;
    this.tableName = table;
  }

  fields(fields: string[]): this {
    this.selectFields = fields;
    return this;
  }

  where(condition: string, value?: any): this {
    this.whereConditions.push(condition);
    if (value !== undefined) {
      this.params.push(value);
    }
    return this;
  }

  join(table: string, condition: string): this {
    this.joinClauses.push(`JOIN ${table} ON ${condition}`);
    return this;
  }

  leftJoin(table: string, condition: string): this {
    this.joinClauses.push(`LEFT JOIN ${table} ON ${condition}`);
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByClause = `ORDER BY ${field} ${direction}`;
    return this;
  }

  limit(count: number, offset?: number): this {
    this.limitClause = offset 
      ? `LIMIT ${count} OFFSET ${offset}`
      : `LIMIT ${count}`;
    return this;
  }

  values(data: Record<string, any>): this {
    if (this.operation === 'INSERT') {
      this.insertData = data;
    } else if (this.operation === 'UPDATE') {
      this.updateData = data;
    }
    return this;
  }

  async execute<T = any>(options?: QueryOptions): Promise<QueryResult<T>> {
    const sql = this.buildSQL();
    const allParams = [...Object.values(this.insertData), ...Object.values(this.updateData), ...this.params];
    return this.db.query<T>(sql, allParams, options);
  }

  private buildSQL(): string {
    switch (this.operation) {
      case 'SELECT':
        return this.buildSelectSQL();
      case 'INSERT':
        return this.buildInsertSQL();
      case 'UPDATE':
        return this.buildUpdateSQL();
      case 'DELETE':
        return this.buildDeleteSQL();
      default:
        throw new Error(`Unsupported operation: ${this.operation}`);
    }
  }

  private buildSelectSQL(): string {
    let sql = `SELECT ${this.selectFields.join(', ')} FROM ${this.tableName}`;
    
    if (this.joinClauses.length > 0) {
      sql += ` ${this.joinClauses.join(' ')}`;
    }
    
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    if (this.orderByClause) {
      sql += ` ${this.orderByClause}`;
    }
    
    if (this.limitClause) {
      sql += ` ${this.limitClause}`;
    }
    
    return sql;
  }

  private buildInsertSQL(): string {
    const columns = Object.keys(this.insertData);
    const placeholders = columns.map((_, index) => `$${index + 1}`);
    
    return `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
  }

  private buildUpdateSQL(): string {
    const setClause = Object.keys(this.updateData)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    let sql = `UPDATE ${this.tableName} SET ${setClause}`;
    
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    return sql;
  }

  private buildDeleteSQL(): string {
    let sql = `DELETE FROM ${this.tableName}`;
    
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    return sql;
  }
}

// Singleton database pool instance
export const databasePool = new DatabasePool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'production_app',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true'
});