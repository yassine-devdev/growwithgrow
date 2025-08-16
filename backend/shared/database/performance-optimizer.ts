import { databasePool } from './connection-pool.js';
import { createLogger } from '../monitoring/logger.js';

const logger = createLogger(undefined, undefined, 'db-optimizer');

export interface QueryAnalysis {
  query: string;
  executionTime: number;
  planningTime: number;
  totalCost: number;
  rows: number;
  bufferHits: number;
  bufferReads: number;
  plan: any;
  suggestions: string[];
}

export interface IndexSuggestion {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  reason: string;
  estimatedImprovement: number;
}

export class DatabasePerformanceOptimizer {
  private slowQueryThreshold = 1000; // 1 second
  private slowQueries: Map<string, QueryAnalysis[]> = new Map();

  // Analyze query performance
  async analyzeQuery(query: string, params?: any[]): Promise<QueryAnalysis> {
    const startTime = Date.now();
    
    try {
      // Get query execution plan
      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
      const result = await databasePool.query(explainQuery, params);
      
      const plan = result.rows[0]['QUERY PLAN'][0];
      const executionTime = plan['Execution Time'];
      const planningTime = plan['Planning Time'];
      const totalCost = plan['Plan']['Total Cost'];
      const rows = plan['Plan']['Actual Rows'];
      
      // Extract buffer statistics
      const bufferHits = this.extractBufferHits(plan);
      const bufferReads = this.extractBufferReads(plan);
      
      const analysis: QueryAnalysis = {
        query: query.substring(0, 200),
        executionTime,
        planningTime,
        totalCost,
        rows,
        bufferHits,
        bufferReads,
        plan,
        suggestions: this.generateSuggestions(plan, query)
      };
      
      // Store slow queries for analysis
      if (executionTime > this.slowQueryThreshold) {
        this.recordSlowQuery(query, analysis);
      }
      
      logger.debug('Query analyzed', {
        executionTime,
        planningTime,
        totalCost,
        rows,
        suggestionsCount: analysis.suggestions.length
      });
      
      return analysis;
    } catch (error) {
      logger.error('Query analysis failed', error, { query: query.substring(0, 100) });
      throw error;
    }
  }

  // Generate performance suggestions based on query plan
  private generateSuggestions(plan: any, query: string): string[] {
    const suggestions: string[] = [];
    
    // Check for sequential scans on large tables
    this.checkForSeqScans(plan.Plan, suggestions);
    
    // Check for missing indexes
    this.checkForMissingIndexes(plan.Plan, query, suggestions);
    
    // Check for inefficient joins
    this.checkForInefficientJoins(plan.Plan, suggestions);
    
    // Check for sorting operations
    this.checkForSortOperations(plan.Plan, suggestions);
    
    // Check for buffer usage
    this.checkBufferUsage(plan.Plan, suggestions);
    
    return suggestions;
  }

  private checkForSeqScans(node: any, suggestions: string[]): void {
    if (node['Node Type'] === 'Seq Scan' && node['Actual Rows'] > 1000) {
      suggestions.push(
        `Consider adding an index on table "${node['Relation Name']}" for the filter conditions`
      );
    }
    
    if (node['Plans']) {
      node['Plans'].forEach((child: any) => this.checkForSeqScans(child, suggestions));
    }
  }

  private checkForMissingIndexes(node: any, query: string, suggestions: string[]): void {
    if (node['Node Type'] === 'Seq Scan' && node['Filter']) {
      const tableName = node['Relation Name'];
      const filter = node['Filter'];
      
      // Extract column names from filter (simplified)
      const columnMatches = filter.match(/\((\w+)\s*[=<>]/g);
      if (columnMatches) {
        const columns = columnMatches.map((match: string) => 
          match.replace(/[()=<>\s]/g, '')
        );
        
        suggestions.push(
          `Consider creating an index on ${tableName}(${columns.join(', ')}) for better filter performance`
        );
      }
    }
    
    if (node['Plans']) {
      node['Plans'].forEach((child: any) => this.checkForMissingIndexes(child, query, suggestions));
    }
  }

  private checkForInefficientJoins(node: any, suggestions: string[]): void {
    if (node['Node Type'] === 'Nested Loop' && node['Actual Rows'] > 10000) {
      suggestions.push(
        'Large nested loop join detected. Consider adding indexes on join columns or restructuring the query'
      );
    }
    
    if (node['Node Type'] === 'Hash Join' && node['Hash Buckets Used'] > node['Hash Buckets Original']) {
      suggestions.push(
        'Hash join is using more buckets than planned. Consider increasing work_mem or optimizing the query'
      );
    }
    
    if (node['Plans']) {
      node['Plans'].forEach((child: any) => this.checkForInefficientJoins(child, suggestions));
    }
  }

  private checkForSortOperations(node: any, suggestions: string[]): void {
    if (node['Node Type'] === 'Sort' && node['Sort Method'] === 'external merge') {
      suggestions.push(
        'External sort detected. Consider increasing work_mem or adding an index to avoid sorting'
      );
    }
    
    if (node['Plans']) {
      node['Plans'].forEach((child: any) => this.checkForSortOperations(child, suggestions));
    }
  }

  private checkBufferUsage(node: any, suggestions: string[]): void {
    const bufferHits = node['Shared Hit Blocks'] || 0;
    const bufferReads = node['Shared Read Blocks'] || 0;
    const totalBuffers = bufferHits + bufferReads;
    
    if (totalBuffers > 0) {
      const hitRatio = bufferHits / totalBuffers;
      
      if (hitRatio < 0.9) {
        suggestions.push(
          `Low buffer cache hit ratio (${(hitRatio * 100).toFixed(1)}%). Consider increasing shared_buffers or optimizing the query`
        );
      }
    }
    
    if (node['Plans']) {
      node['Plans'].forEach((child: any) => this.checkBufferUsage(child, suggestions));
    }
  }

  private extractBufferHits(plan: any): number {
    let hits = plan.Plan['Shared Hit Blocks'] || 0;
    
    if (plan.Plan['Plans']) {
      plan.Plan['Plans'].forEach((child: any) => {
        hits += this.extractBufferHitsFromNode(child);
      });
    }
    
    return hits;
  }

  private extractBufferReads(plan: any): number {
    let reads = plan.Plan['Shared Read Blocks'] || 0;
    
    if (plan.Plan['Plans']) {
      plan.Plan['Plans'].forEach((child: any) => {
        reads += this.extractBufferReadsFromNode(child);
      });
    }
    
    return reads;
  }

  private extractBufferHitsFromNode(node: any): number {
    let hits = node['Shared Hit Blocks'] || 0;
    
    if (node['Plans']) {
      node['Plans'].forEach((child: any) => {
        hits += this.extractBufferHitsFromNode(child);
      });
    }
    
    return hits;
  }

  private extractBufferReadsFromNode(node: any): number {
    let reads = node['Shared Read Blocks'] || 0;
    
    if (node['Plans']) {
      node['Plans'].forEach((child: any) => {
        reads += this.extractBufferReadsFromNode(child);
      });
    }
    
    return reads;
  }

  private recordSlowQuery(query: string, analysis: QueryAnalysis): void {
    const queryKey = this.normalizeQuery(query);
    
    if (!this.slowQueries.has(queryKey)) {
      this.slowQueries.set(queryKey, []);
    }
    
    const queries = this.slowQueries.get(queryKey)!;
    queries.push(analysis);
    
    // Keep only the last 10 executions
    if (queries.length > 10) {
      queries.shift();
    }
    
    logger.warn('Slow query recorded', {
      query: query.substring(0, 100),
      executionTime: analysis.executionTime,
      suggestions: analysis.suggestions
    });
  }

  private normalizeQuery(query: string): string {
    // Normalize query by removing parameters and extra whitespace
    return query
      .replace(/\$\d+/g, '?')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // Get slow query report
  getSlowQueryReport(): Array<{
    query: string;
    avgExecutionTime: number;
    maxExecutionTime: number;
    executionCount: number;
    commonSuggestions: string[];
  }> {
    const report: Array<{
      query: string;
      avgExecutionTime: number;
      maxExecutionTime: number;
      executionCount: number;
      commonSuggestions: string[];
    }> = [];
    
    this.slowQueries.forEach((analyses, query) => {
      const executionTimes = analyses.map(a => a.executionTime);
      const avgExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      const maxExecutionTime = Math.max(...executionTimes);
      
      // Find common suggestions
      const suggestionCounts = new Map<string, number>();
      analyses.forEach(analysis => {
        analysis.suggestions.forEach(suggestion => {
          suggestionCounts.set(suggestion, (suggestionCounts.get(suggestion) || 0) + 1);
        });
      });
      
      const commonSuggestions = Array.from(suggestionCounts.entries())
        .filter(([, count]) => count >= analyses.length / 2)
        .map(([suggestion]) => suggestion);
      
      report.push({
        query,
        avgExecutionTime,
        maxExecutionTime,
        executionCount: analyses.length,
        commonSuggestions
      });
    });
    
    return report.sort((a, b) => b.avgExecutionTime - a.avgExecutionTime);
  }

  // Generate index suggestions based on slow queries
  generateIndexSuggestions(): IndexSuggestion[] {
    const suggestions: IndexSuggestion[] = [];
    const report = this.getSlowQueryReport();
    
    report.forEach(({ query, commonSuggestions }) => {
      commonSuggestions.forEach(suggestion => {
        if (suggestion.includes('Consider creating an index')) {
          // Parse the suggestion to extract table and columns
          const match = suggestion.match(/index on (\w+)\(([^)]+)\)/);
          if (match) {
            const table = match[1];
            const columns = match[2].split(',').map(col => col.trim());
            
            suggestions.push({
              table,
              columns,
              type: 'btree',
              reason: suggestion,
              estimatedImprovement: this.estimateIndexImprovement(query)
            });
          }
        }
      });
    });
    
    return suggestions;
  }

  private estimateIndexImprovement(query: string): number {
    // Simplified estimation based on query complexity
    const complexity = query.length + (query.match(/JOIN/gi) || []).length * 50;
    return Math.min(complexity / 10, 90); // Max 90% improvement
  }

  // Create recommended indexes
  async createRecommendedIndexes(suggestions: IndexSuggestion[]): Promise<void> {
    for (const suggestion of suggestions) {
      try {
        const indexName = `idx_${suggestion.table}_${suggestion.columns.join('_')}`;
        const createIndexQuery = `
          CREATE INDEX CONCURRENTLY IF NOT EXISTS ${indexName}
          ON ${suggestion.table} USING ${suggestion.type} (${suggestion.columns.join(', ')})
        `;
        
        logger.info('Creating recommended index', {
          table: suggestion.table,
          columns: suggestion.columns,
          type: suggestion.type,
          reason: suggestion.reason
        });
        
        await databasePool.query(createIndexQuery);
        
        logger.info('Index created successfully', { indexName });
      } catch (error) {
        logger.error('Failed to create index', error, {
          table: suggestion.table,
          columns: suggestion.columns
        });
      }
    }
  }

  // Analyze table statistics
  async analyzeTableStatistics(tableName: string): Promise<{
    rowCount: number;
    tableSize: string;
    indexSize: string;
    mostUsedIndexes: Array<{ name: string; scans: number; tuples: number }>;
    unusedIndexes: string[];
  }> {
    try {
      // Get row count and table size
      const sizeQuery = `
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation,
          most_common_vals,
          most_common_freqs
        FROM pg_stats 
        WHERE tablename = $1
      `;
      
      const tableStatsQuery = `
        SELECT 
          pg_size_pretty(pg_total_relation_size($1)) as total_size,
          pg_size_pretty(pg_relation_size($1)) as table_size,
          pg_size_pretty(pg_total_relation_size($1) - pg_relation_size($1)) as index_size,
          (SELECT reltuples::bigint FROM pg_class WHERE relname = $1) as row_count
      `;
      
      const indexUsageQuery = `
        SELECT 
          indexrelname as index_name,
          idx_scan as scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes 
        WHERE relname = $1
        ORDER BY idx_scan DESC
      `;
      
      const [tableStats, indexUsage] = await Promise.all([
        databasePool.query(tableStatsQuery, [tableName]),
        databasePool.query(indexUsageQuery, [tableName])
      ]);
      
      const stats = tableStats.rows[0];
      const indexes = indexUsage.rows;
      
      const mostUsedIndexes = indexes
        .filter((idx: any) => idx.scans > 0)
        .slice(0, 5)
        .map((idx: any) => ({
          name: idx.index_name,
          scans: parseInt(idx.scans),
          tuples: parseInt(idx.tuples_read)
        }));
      
      const unusedIndexes = indexes
        .filter((idx: any) => idx.scans === 0)
        .map((idx: any) => idx.index_name);
      
      return {
        rowCount: parseInt(stats.row_count) || 0,
        tableSize: stats.table_size,
        indexSize: stats.index_size,
        mostUsedIndexes,
        unusedIndexes
      };
    } catch (error) {
      logger.error('Failed to analyze table statistics', error, { tableName });
      throw error;
    }
  }

  // Update table statistics
  async updateTableStatistics(tableName?: string): Promise<void> {
    try {
      const query = tableName ? `ANALYZE ${tableName}` : 'ANALYZE';
      await databasePool.query(query);
      
      logger.info('Table statistics updated', { tableName: tableName || 'all tables' });
    } catch (error) {
      logger.error('Failed to update table statistics', error, { tableName });
      throw error;
    }
  }

  // Get database performance metrics
  async getDatabaseMetrics(): Promise<{
    connectionStats: any;
    cacheHitRatio: number;
    activeQueries: number;
    longestRunningQuery: number;
    deadlocks: number;
    tempFiles: number;
  }> {
    try {
      const metricsQuery = `
        SELECT 
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_queries,
          (SELECT EXTRACT(EPOCH FROM (now() - query_start)) 
           FROM pg_stat_activity 
           WHERE state = 'active' AND query_start IS NOT NULL 
           ORDER BY query_start LIMIT 1) as longest_running_query,
          (SELECT sum(blks_hit) / (sum(blks_hit) + sum(blks_read)) * 100 
           FROM pg_stat_database) as cache_hit_ratio,
          (SELECT sum(deadlocks) FROM pg_stat_database) as deadlocks,
          (SELECT sum(temp_files) FROM pg_stat_database) as temp_files
      `;
      
      const result = await databasePool.query(metricsQuery);
      const metrics = result.rows[0];
      
      return {
        connectionStats: databasePool.getPoolStats(),
        cacheHitRatio: parseFloat(metrics.cache_hit_ratio) || 0,
        activeQueries: parseInt(metrics.active_queries) || 0,
        longestRunningQuery: parseFloat(metrics.longest_running_query) || 0,
        deadlocks: parseInt(metrics.deadlocks) || 0,
        tempFiles: parseInt(metrics.temp_files) || 0
      };
    } catch (error) {
      logger.error('Failed to get database metrics', error);
      throw error;
    }
  }

  // Clear slow query cache
  clearSlowQueryCache(): void {
    this.slowQueries.clear();
    logger.info('Slow query cache cleared');
  }
}

// Singleton instance
export const dbOptimizer = new DatabasePerformanceOptimizer();