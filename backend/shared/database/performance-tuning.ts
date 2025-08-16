import { createLogger } from '../monitoring/logger.js';
import { databasePool } from '../performance/database.js';

const logger = createLogger(undefined, undefined, 'db-performance');

export interface IndexRecommendation {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist' | 'partial' | 'unique';
  reason: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  createStatement: string;
}

export interface QueryAnalysis {
  query: string;
  executionTime: number;
  planningTime: number;
  totalCost: number;
  actualRows: number;
  estimatedRows: number;
  bufferHits: number;
  bufferReads: number;
  recommendations: string[];
  indexRecommendations: IndexRecommendation[];
}

export interface SlowQuery {
  query: string;
  averageTime: number;
  callCount: number;
  totalTime: number;
  lastSeen: Date;
  parameters?: any[];
}

export class DatabasePerformanceTuner {
  private slowQueryThreshold = 1000; // 1 second
  private slowQueries: Map<string, SlowQuery> = new Map();
  private queryStats: Map<string, { count: number; totalTime: number }> = new Map();

  constructor(slowQueryThreshold?: number) {
    if (slowQueryThreshold) {
      this.slowQueryThreshold = slowQueryThreshold;
    }
    this.startPerformanceMonitoring();
  }

  private startPerformanceMonitoring(): void {
    // Monitor slow queries every 5 minutes
    setInterval(() => {
      this.analyzeSlowQueries();
    }, 5 * 60 * 1000);

    // Clean up old query stats every hour
    setInterval(() => {
      this.cleanupOldStats();
    }, 60 * 60 * 1000);
  }

  // Analyze query performance and provide recommendations
  async analyzeQuery(query: string, parameters: any[] = []): Promise<QueryAnalysis> {
    const startTime = Date.now();
    
    try {
      // Get query execution plan
      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
      const result = await databasePool.query(explainQuery, parameters);
      const plan = result.rows[0]['QUERY PLAN'][0];

      const executionTime = plan['Execution Time'] || 0;
      const planningTime = plan['Planning Time'] || 0;
      const totalCost = plan.Plan['Total Cost'] || 0;
      const actualRows = plan.Plan['Actual Rows'] || 0;
      const estimatedRows = plan.Plan['Plan Rows'] || 0;

      // Extract buffer statistics
      const bufferHits = this.extractBufferHits(plan);
      const bufferReads = this.extractBufferReads(plan);

      // Generate recommendations
      const recommendations = this.generateQueryRecommendations(plan, query);
      const indexRecommendations = await this.generateIndexRecommendations(plan, query);

      // Record slow query if applicable
      if (executionTime > this.slowQueryThreshold) {
        this.recordSlowQuery(query, executionTime, parameters);
      }

      // Update query statistics
      this.updateQueryStats(query, executionTime);

      const analysis: QueryAnalysis = {
        query,
        executionTime,
        planningTime,
        totalCost,
        actualRows,
        estimatedRows,
        bufferHits,
        bufferReads,
        recommendations,
        indexRecommendations
      };

      logger.debug('Query analyzed', {
        executionTime,
        totalCost,
        recommendationCount: recommendations.length
      });

      return analysis;

    } catch (error) {
      logger.error('Query analysis failed', error, { query: query.substring(0, 200) });
      throw error;
    }
  }

  // Generate strategic database indexes
  async generateStrategicIndexes(): Promise<IndexRecommendation[]> {
    const recommendations: IndexRecommendation[] = [];

    try {
      // Analyze table statistics
      const tableStats = await this.getTableStatistics();
      
      // Analyze slow queries for index opportunities
      const slowQueryIndexes = await this.analyzeSlowQueriesForIndexes();
      recommendations.push(...slowQueryIndexes);

      // Analyze foreign key constraints without indexes
      const fkIndexes = await this.analyzeForeignKeyIndexes();
      recommendations.push(...fkIndexes);

      // Analyze frequently queried columns
      const frequentColumnIndexes = await this.analyzeFrequentlyQueriedColumns();
      recommendations.push(...frequentColumnIndexes);

      // Analyze composite index opportunities
      const compositeIndexes = await this.analyzeCompositeIndexOpportunities();
      recommendations.push(...compositeIndexes);

      // Sort by estimated impact
      recommendations.sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.estimatedImpact] - impactOrder[a.estimatedImpact];
      });

      logger.info('Strategic indexes generated', {
        totalRecommendations: recommendations.length,
        highImpact: recommendations.filter(r => r.estimatedImpact === 'high').length
      });

      return recommendations;

    } catch (error) {
      logger.error('Failed to generate strategic indexes', error);
      return [];
    }
  }

  // Create recommended indexes
  async createRecommendedIndexes(recommendations: IndexRecommendation[]): Promise<void> {
    for (const recommendation of recommendations) {
      try {
        logger.info('Creating index', {
          table: recommendation.table,
          columns: recommendation.columns,
          type: recommendation.type
        });

        await databasePool.query(recommendation.createStatement);
        
        logger.info('Index created successfully', {
          table: recommendation.table,
          columns: recommendation.columns
        });

      } catch (error) {
        logger.error('Failed to create index', error, {
          table: recommendation.table,
          statement: recommendation.createStatement
        });
      }
    }
  }

  // Analyze slow queries and provide optimization suggestions
  async analyzeSlowQueries(): Promise<SlowQuery[]> {
    const slowQueries = Array.from(this.slowQueries.values())
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 20); // Top 20 slow queries

    for (const slowQuery of slowQueries) {
      try {
        const analysis = await this.analyzeQuery(slowQuery.query, slowQuery.parameters);
        
        logger.warn('Slow query detected', {
          query: slowQuery.query.substring(0, 200),
          averageTime: slowQuery.averageTime,
          callCount: slowQuery.callCount,
          recommendations: analysis.recommendations.length
        });

      } catch (error) {
        logger.error('Failed to analyze slow query', error);
      }
    }

    return slowQueries;
  }

  // Get database statistics and health metrics
  async getDatabaseStatistics(): Promise<{
    tableStats: any[];
    indexStats: any[];
    connectionStats: any;
    cacheHitRatio: number;
    slowQueryCount: number;
  }> {
    try {
      // Get table statistics
      const tableStatsQuery = `
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC;
      `;
      const tableStats = await databasePool.query(tableStatsQuery);

      // Get index statistics
      const indexStatsQuery = `
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_tup_read,
          idx_tup_fetch,
          idx_scan
        FROM pg_stat_user_indexes
        WHERE idx_scan > 0
        ORDER BY idx_scan DESC;
      `;
      const indexStats = await databasePool.query(indexStatsQuery);

      // Get connection statistics
      const connectionStatsQuery = `
        SELECT 
          state,
          COUNT(*) as count
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state;
      `;
      const connectionStats = await databasePool.query(connectionStatsQuery);

      // Calculate cache hit ratio
      const cacheHitQuery = `
        SELECT 
          sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
        FROM pg_statio_user_tables;
      `;
      const cacheHitResult = await databasePool.query(cacheHitQuery);
      const cacheHitRatio = cacheHitResult.rows[0]?.cache_hit_ratio || 0;

      return {
        tableStats: tableStats.rows,
        indexStats: indexStats.rows,
        connectionStats: connectionStats.rows,
        cacheHitRatio: parseFloat(cacheHitRatio),
        slowQueryCount: this.slowQueries.size
      };

    } catch (error) {
      logger.error('Failed to get database statistics', error);
      throw error;
    }
  }

  // Optimize database configuration
  async optimizeConfiguration(): Promise<void> {
    try {
      // Get current configuration
      const configQuery = `
        SELECT name, setting, unit, context, source
        FROM pg_settings
        WHERE name IN (
          'shared_buffers',
          'effective_cache_size',
          'maintenance_work_mem',
          'checkpoint_completion_target',
          'wal_buffers',
          'default_statistics_target',
          'random_page_cost',
          'effective_io_concurrency'
        );
      `;
      const currentConfig = await databasePool.query(configQuery);

      // Generate optimization recommendations
      const recommendations = this.generateConfigRecommendations(currentConfig.rows);

      logger.info('Database configuration recommendations', {
        recommendations: recommendations.length
      });

      // Log recommendations (actual application would require restart)
      recommendations.forEach(rec => {
        logger.info('Configuration recommendation', rec);
      });

    } catch (error) {
      logger.error('Failed to optimize configuration', error);
    }
  }

  // Monitor and maintain database health
  async performMaintenance(): Promise<void> {
    try {
      // Analyze tables that need statistics updates
      const staleStatsQuery = `
        SELECT schemaname, tablename
        FROM pg_stat_user_tables
        WHERE last_analyze < NOW() - INTERVAL '7 days'
           OR last_autoanalyze < NOW() - INTERVAL '7 days'
           OR last_analyze IS NULL;
      `;
      const staleStats = await databasePool.query(staleStatsQuery);

      // Update statistics for stale tables
      for (const table of staleStats.rows) {
        try {
          await databasePool.query(`ANALYZE ${table.schemaname}.${table.tablename}`);
          logger.info('Table analyzed', {
            schema: table.schemaname,
            table: table.tablename
          });
        } catch (error) {
          logger.error('Failed to analyze table', error, {
            schema: table.schemaname,
            table: table.tablename
          });
        }
      }

      // Find and remove unused indexes
      const unusedIndexes = await this.findUnusedIndexes();
      logger.info('Unused indexes found', { count: unusedIndexes.length });

      // Vacuum tables with high dead tuple ratio
      await this.performSelectiveVacuum();

    } catch (error) {
      logger.error('Database maintenance failed', error);
    }
  }

  // Private helper methods
  private recordSlowQuery(query: string, executionTime: number, parameters?: any[]): void {
    const queryKey = this.normalizeQuery(query);
    const existing = this.slowQueries.get(queryKey);

    if (existing) {
      existing.callCount++;
      existing.totalTime += executionTime;
      existing.averageTime = existing.totalTime / existing.callCount;
      existing.lastSeen = new Date();
    } else {
      this.slowQueries.set(queryKey, {
        query,
        averageTime: executionTime,
        callCount: 1,
        totalTime: executionTime,
        lastSeen: new Date(),
        parameters
      });
    }
  }

  private updateQueryStats(query: string, executionTime: number): void {
    const queryKey = this.normalizeQuery(query);
    const existing = this.queryStats.get(queryKey);

    if (existing) {
      existing.count++;
      existing.totalTime += executionTime;
    } else {
      this.queryStats.set(queryKey, {
        count: 1,
        totalTime: executionTime
      });
    }
  }

  private normalizeQuery(query: string): string {
    // Normalize query by removing parameters and extra whitespace
    return query
      .replace(/\$\d+/g, '?') // Replace parameters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();
  }

  private extractBufferHits(plan: any): number {
    // Extract buffer hits from execution plan
    return this.extractBufferStat(plan, 'Shared Hit Blocks') || 0;
  }

  private extractBufferReads(plan: any): number {
    // Extract buffer reads from execution plan
    return this.extractBufferStat(plan, 'Shared Read Blocks') || 0;
  }

  private extractBufferStat(plan: any, statName: string): number {
    if (plan.Plan && plan.Plan[statName]) {
      return plan.Plan[statName];
    }
    
    if (plan.Plans) {
      return plan.Plans.reduce((sum: number, subPlan: any) => 
        sum + this.extractBufferStat(subPlan, statName), 0);
    }
    
    return 0;
  }

  private generateQueryRecommendations(plan: any, query: string): string[] {
    const recommendations: string[] = [];

    // Check for sequential scans on large tables
    if (this.hasSequentialScan(plan) && this.isLargeTable(plan)) {
      recommendations.push('Consider adding an index to avoid sequential scan');
    }

    // Check for nested loops with high cost
    if (this.hasExpensiveNestedLoop(plan)) {
      recommendations.push('Consider optimizing join conditions or adding indexes');
    }

    // Check for sort operations
    if (this.hasSortOperation(plan)) {
      recommendations.push('Consider adding an index to avoid sorting');
    }

    // Check for hash joins on large datasets
    if (this.hasHashJoin(plan)) {
      recommendations.push('Monitor memory usage for hash joins');
    }

    return recommendations;
  }

  private async generateIndexRecommendations(plan: any, query: string): Promise<IndexRecommendation[]> {
    const recommendations: IndexRecommendation[] = [];

    // Analyze WHERE clauses for index opportunities
    const whereColumns = this.extractWhereColumns(query);
    for (const column of whereColumns) {
      const recommendation = await this.createIndexRecommendation(column.table, [column.column], 'btree', 'WHERE clause optimization');
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Analyze ORDER BY clauses
    const orderByColumns = this.extractOrderByColumns(query);
    for (const column of orderByColumns) {
      const recommendation = await this.createIndexRecommendation(column.table, [column.column], 'btree', 'ORDER BY optimization');
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  private async createIndexRecommendation(
    table: string, 
    columns: string[], 
    type: IndexRecommendation['type'], 
    reason: string
  ): Promise<IndexRecommendation | null> {
    try {
      // Check if index already exists
      const existingIndexQuery = `
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = $1
          AND indexdef LIKE '%' || $2 || '%';
      `;
      const existing = await databasePool.query(existingIndexQuery, [table, columns[0]]);
      
      if (existing.rows.length > 0) {
        return null; // Index already exists
      }

      const indexName = `idx_${table}_${columns.join('_')}`;
      const createStatement = `CREATE INDEX CONCURRENTLY ${indexName} ON ${table} (${columns.join(', ')});`;

      return {
        table,
        columns,
        type,
        reason,
        estimatedImpact: 'medium',
        createStatement
      };

    } catch (error) {
      logger.error('Failed to create index recommendation', error);
      return null;
    }
  }

  private async getTableStatistics(): Promise<any[]> {
    const query = `
      SELECT 
        tablename,
        n_live_tup as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_stat_user_tables
      ORDER BY n_live_tup DESC;
    `;
    const result = await databasePool.query(query);
    return result.rows;
  }

  private async analyzeSlowQueriesForIndexes(): Promise<IndexRecommendation[]> {
    // Analyze slow queries for index opportunities
    return []; // Implementation would analyze actual slow queries
  }

  private async analyzeForeignKeyIndexes(): Promise<IndexRecommendation[]> {
    const query = `
      SELECT 
        tc.table_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public';
    `;
    
    const result = await databasePool.query(query);
    const recommendations: IndexRecommendation[] = [];

    for (const row of result.rows) {
      const recommendation = await this.createIndexRecommendation(
        row.table_name,
        [row.column_name],
        'btree',
        'Foreign key optimization'
      );
      if (recommendation) {
        recommendation.estimatedImpact = 'high';
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  private async analyzeFrequentlyQueriedColumns(): Promise<IndexRecommendation[]> {
    // This would analyze query logs to find frequently queried columns
    return [];
  }

  private async analyzeCompositeIndexOpportunities(): Promise<IndexRecommendation[]> {
    // This would analyze queries for composite index opportunities
    return [];
  }

  private generateConfigRecommendations(currentConfig: any[]): any[] {
    const recommendations = [];

    // Analyze each configuration parameter
    for (const config of currentConfig) {
      switch (config.name) {
        case 'shared_buffers':
          if (parseInt(config.setting) < 128000) { // Less than ~1GB
            recommendations.push({
              parameter: 'shared_buffers',
              current: config.setting,
              recommended: '25% of total RAM',
              reason: 'Increase shared buffers for better caching'
            });
          }
          break;
        
        case 'effective_cache_size':
          recommendations.push({
            parameter: 'effective_cache_size',
            current: config.setting,
            recommended: '75% of total RAM',
            reason: 'Help query planner make better decisions'
          });
          break;
      }
    }

    return recommendations;
  }

  private async findUnusedIndexes(): Promise<any[]> {
    const query = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0
        AND indexname NOT LIKE '%_pkey';
    `;
    const result = await databasePool.query(query);
    return result.rows;
  }

  private async performSelectiveVacuum(): Promise<void> {
    const query = `
      SELECT 
        schemaname,
        tablename,
        n_dead_tup,
        n_live_tup
      FROM pg_stat_user_tables
      WHERE n_dead_tup > 1000
        AND n_dead_tup::float / GREATEST(n_live_tup, 1) > 0.1;
    `;
    
    const result = await databasePool.query(query);
    
    for (const table of result.rows) {
      try {
        await databasePool.query(`VACUUM ANALYZE ${table.schemaname}.${table.tablename}`);
        logger.info('Table vacuumed', {
          schema: table.schemaname,
          table: table.tablename,
          deadTuples: table.n_dead_tup
        });
      } catch (error) {
        logger.error('Failed to vacuum table', error);
      }
    }
  }

  private cleanupOldStats(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [key, query] of this.slowQueries.entries()) {
      if (query.lastSeen.getTime() < cutoffTime) {
        this.slowQueries.delete(key);
      }
    }
  }

  // Query analysis helper methods
  private hasSequentialScan(plan: any): boolean {
    return this.findNodeType(plan, 'Seq Scan') !== null;
  }

  private isLargeTable(plan: any): boolean {
    const seqScan = this.findNodeType(plan, 'Seq Scan');
    return seqScan && seqScan['Plan Rows'] > 10000;
  }

  private hasExpensiveNestedLoop(plan: any): boolean {
    const nestedLoop = this.findNodeType(plan, 'Nested Loop');
    return nestedLoop && nestedLoop['Total Cost'] > 1000;
  }

  private hasSortOperation(plan: any): boolean {
    return this.findNodeType(plan, 'Sort') !== null;
  }

  private hasHashJoin(plan: any): boolean {
    return this.findNodeType(plan, 'Hash Join') !== null;
  }

  private findNodeType(plan: any, nodeType: string): any {
    if (plan.Plan && plan.Plan['Node Type'] === nodeType) {
      return plan.Plan;
    }
    
    if (plan.Plans) {
      for (const subPlan of plan.Plans) {
        const found = this.findNodeType(subPlan, nodeType);
        if (found) return found;
      }
    }
    
    return null;
  }

  private extractWhereColumns(query: string): Array<{ table: string; column: string }> {
    // Simple regex-based extraction - in production, use a proper SQL parser
    const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+GROUP\s+BY|\s+LIMIT|$)/i);
    if (!whereMatch) return [];

    const whereClause = whereMatch[1];
    const columnMatches = whereClause.match(/(\w+)\.(\w+)\s*[=<>]/g) || [];
    
    return columnMatches.map(match => {
      const [, table, column] = match.match(/(\w+)\.(\w+)/) || [];
      return { table, column };
    }).filter(item => item.table && item.column);
  }

  private extractOrderByColumns(query: string): Array<{ table: string; column: string }> {
    const orderByMatch = query.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/i);
    if (!orderByMatch) return [];

    const orderByClause = orderByMatch[1];
    const columnMatches = orderByClause.match(/(\w+)\.(\w+)/g) || [];
    
    return columnMatches.map(match => {
      const [, table, column] = match.match(/(\w+)\.(\w+)/) || [];
      return { table, column };
    }).filter(item => item.table && item.column);
  }

  // Get performance tuning statistics
  getStats() {
    return {
      slowQueryCount: this.slowQueries.size,
      totalQueriesAnalyzed: this.queryStats.size,
      slowQueryThreshold: this.slowQueryThreshold
    };
  }
}

// Singleton instance
export const dbPerformanceTuner = new DatabasePerformanceTuner();