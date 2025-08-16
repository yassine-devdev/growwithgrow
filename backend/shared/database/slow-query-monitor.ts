import { databasePool } from './connection-pool.js';
import { dbOptimizer } from './performance-optimizer.js';
import { createLogger } from '../monitoring/logger.js';
import { redisCache } from '../cache/redis-cache.js';

const logger = createLogger(undefined, undefined, 'slow-query-monitor');

export interface SlowQueryConfig {
  threshold: number; // milliseconds
  sampleRate: number; // 0-1, percentage of queries to analyze
  enableAutoOptimization: boolean;
  maxCacheSize: number;
}

export class SlowQueryMonitor {
  private config: SlowQueryConfig;
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(config: Partial<SlowQueryConfig> = {}) {
    this.config = {
      threshold: 1000, // 1 second
      sampleRate: 0.1, // 10% of queries
      enableAutoOptimization: false,
      maxCacheSize: 1000,
      ...config
    };
  }

  // Start monitoring slow queries
  start(): void {
    if (this.isMonitoring) {
      logger.warn('Slow query monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    
    // Enable PostgreSQL query logging for slow queries
    this.enableSlowQueryLogging();
    
    // Start periodic analysis
    this.monitoringInterval = setInterval(() => {
      this.analyzeSlowQueries();
    }, 60000); // Every minute
    
    logger.info('Slow query monitoring started', {
      threshold: this.config.threshold,
      sampleRate: this.config.sampleRate
    });
  }

  // Stop monitoring
  stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    this.disableSlowQueryLogging();
    
    logger.info('Slow query monitoring stopped');
  }

  // Enable PostgreSQL slow query logging
  private async enableSlowQueryLogging(): Promise<void> {
    try {
      await databasePool.query(`SET log_min_duration_statement = ${this.config.threshold}`);
      await databasePool.query('SET log_statement_stats = on');
      await databasePool.query('SET log_duration = on');
      
      logger.info('PostgreSQL slow query logging enabled');
    } catch (error) {
      logger.error('Failed to enable slow query logging', error);
    }
  }

  // Disable PostgreSQL slow query logging
  private async disableSlowQueryLogging(): Promise<void> {
    try {
      await databasePool.query('SET log_min_duration_statement = -1');
      await databasePool.query('SET log_statement_stats = off');
      await databasePool.query('SET log_duration = off');
      
      logger.info('PostgreSQL slow query logging disabled');
    } catch (error) {
      logger.error('Failed to disable slow query logging', error);
    }
  }

  // Analyze current slow queries
  private async analyzeSlowQueries(): Promise<void> {
    try {
      // Get currently running slow queries
      const slowQueries = await this.getCurrentSlowQueries();
      
      if (slowQueries.length > 0) {
        logger.warn('Active slow queries detected', {
          count: slowQueries.length,
          queries: slowQueries.map(q => ({
            duration: q.duration,
            query: q.query.substring(0, 100)
          }))
        });
        
        // Store in cache for analysis
        await this.cacheSlowQueries(slowQueries);
        
        // Auto-optimization if enabled
        if (this.config.enableAutoOptimization) {
          await this.performAutoOptimization(slowQueries);
        }
      }
      
      // Generate periodic reports
      await this.generatePeriodicReport();
      
    } catch (error) {
      logger.error('Failed to analyze slow queries', error);
    }
  }

  // Get currently running slow queries
  private async getCurrentSlowQueries(): Promise<Array<{
    pid: number;
    duration: number;
    query: string;
    state: string;
    waitEvent: string;
  }>> {
    try {
      const query = `
        SELECT 
          pid,
          EXTRACT(EPOCH FROM (now() - query_start)) * 1000 as duration,
          query,
          state,
          wait_event
        FROM pg_stat_activity 
        WHERE state = 'active' 
          AND query_start IS NOT NULL
          AND EXTRACT(EPOCH FROM (now() - query_start)) * 1000 > $1
          AND query NOT LIKE '%pg_stat_activity%'
        ORDER BY query_start
      `;
      
      const result = await databasePool.query(query, [this.config.threshold]);
      
      return result.rows.map(row => ({
        pid: row.pid,
        duration: parseFloat(row.duration),
        query: row.query,
        state: row.state,
        waitEvent: row.wait_event || 'none'
      }));
    } catch (error) {
      logger.error('Failed to get current slow queries', error);
      return [];
    }
  }

  // Cache slow queries for analysis
  private async cacheSlowQueries(queries: any[]): Promise<void> {
    try {
      const cacheKey = `slow_queries:${Date.now()}`;
      await redisCache.set(cacheKey, queries, { ttl: 3600 }); // 1 hour
      
      // Maintain a list of cache keys
      await redisCache.sadd('slow_query_keys', cacheKey);
      
      // Limit cache size
      const keys = await redisCache.smembers('slow_query_keys');
      if (keys.length > this.config.maxCacheSize) {
        const oldKeys = keys.slice(0, keys.length - this.config.maxCacheSize);
        await Promise.all([
          ...oldKeys.map(key => redisCache.del(key)),
          redisCache.del('slow_query_keys'),
          redisCache.sadd('slow_query_keys', ...keys.slice(-this.config.maxCacheSize))
        ]);
      }
    } catch (error) {
      logger.error('Failed to cache slow queries', error);
    }
  }

  // Perform automatic optimization
  private async performAutoOptimization(slowQueries: any[]): Promise<void> {
    try {
      for (const slowQuery of slowQueries) {
        // Sample queries based on sample rate
        if (Math.random() > this.config.sampleRate) {
          continue;
        }
        
        // Analyze the query
        const analysis = await dbOptimizer.analyzeQuery(slowQuery.query);
        
        // Log suggestions
        if (analysis.suggestions.length > 0) {
          logger.info('Auto-optimization suggestions', {
            query: slowQuery.query.substring(0, 100),
            duration: slowQuery.duration,
            suggestions: analysis.suggestions
          });
        }
      }
    } catch (error) {
      logger.error('Auto-optimization failed', error);
    }
  }

  // Generate periodic performance report
  private async generatePeriodicReport(): Promise<void> {
    try {
      const report = dbOptimizer.getSlowQueryReport();
      const metrics = await dbOptimizer.getDatabaseMetrics();
      const indexSuggestions = dbOptimizer.generateIndexSuggestions();
      
      const performanceReport = {
        timestamp: new Date().toISOString(),
        slowQueries: report.slice(0, 10), // Top 10 slow queries
        databaseMetrics: metrics,
        indexSuggestions: indexSuggestions.slice(0, 5), // Top 5 suggestions
        summary: {
          totalSlowQueries: report.length,
          avgSlowQueryTime: report.reduce((sum, q) => sum + q.avgExecutionTime, 0) / Math.max(report.length, 1),
          cacheHitRatio: metrics.cacheHitRatio,
          activeConnections: metrics.connectionStats.activeCount
        }
      };
      
      // Cache the report
      await redisCache.set('performance_report:latest', performanceReport, { ttl: 3600 });
      
      // Log summary
      logger.info('Performance report generated', performanceReport.summary);
      
      // Alert on critical issues
      if (metrics.cacheHitRatio < 90) {
        logger.warn('Low database cache hit ratio', { ratio: metrics.cacheHitRatio });
      }
      
      if (metrics.activeQueries > 50) {
        logger.warn('High number of active queries', { count: metrics.activeQueries });
      }
      
      if (metrics.longestRunningQuery > 30) {
        logger.warn('Long running query detected', { duration: metrics.longestRunningQuery });
      }
      
    } catch (error) {
      logger.error('Failed to generate performance report', error);
    }
  }

  // Get performance report
  async getPerformanceReport(): Promise<any> {
    try {
      const cached = await redisCache.get('performance_report:latest');
      if (cached) {
        return cached;
      }
      
      // Generate fresh report if not cached
      await this.generatePeriodicReport();
      return await redisCache.get('performance_report:latest');
    } catch (error) {
      logger.error('Failed to get performance report', error);
      return null;
    }
  }

  // Kill long-running queries
  async killLongRunningQueries(maxDuration: number = 300000): Promise<number> {
    try {
      const longRunningQueries = await databasePool.query(`
        SELECT pid, EXTRACT(EPOCH FROM (now() - query_start)) * 1000 as duration, query
        FROM pg_stat_activity 
        WHERE state = 'active' 
          AND query_start IS NOT NULL
          AND EXTRACT(EPOCH FROM (now() - query_start)) * 1000 > $1
          AND query NOT LIKE '%pg_stat_activity%'
      `, [maxDuration]);
      
      let killedCount = 0;
      
      for (const query of longRunningQueries.rows) {
        try {
          await databasePool.query('SELECT pg_terminate_backend($1)', [query.pid]);
          killedCount++;
          
          logger.warn('Killed long-running query', {
            pid: query.pid,
            duration: query.duration,
            query: query.query.substring(0, 100)
          });
        } catch (error) {
          logger.error('Failed to kill query', error, { pid: query.pid });
        }
      }
      
      return killedCount;
    } catch (error) {
      logger.error('Failed to kill long-running queries', error);
      return 0;
    }
  }

  // Get query statistics
  async getQueryStatistics(): Promise<{
    totalQueries: number;
    slowQueries: number;
    avgQueryTime: number;
    cacheHitRatio: number;
    topSlowQueries: any[];
  }> {
    try {
      const stats = await databasePool.query(`
        SELECT 
          sum(calls) as total_queries,
          sum(total_time) as total_time,
          avg(mean_time) as avg_time
        FROM pg_stat_statements
      `);
      
      const slowQueries = dbOptimizer.getSlowQueryReport();
      const metrics = await dbOptimizer.getDatabaseMetrics();
      
      return {
        totalQueries: parseInt(stats.rows[0]?.total_queries) || 0,
        slowQueries: slowQueries.length,
        avgQueryTime: parseFloat(stats.rows[0]?.avg_time) || 0,
        cacheHitRatio: metrics.cacheHitRatio,
        topSlowQueries: slowQueries.slice(0, 5)
      };
    } catch (error) {
      logger.error('Failed to get query statistics', error);
      return {
        totalQueries: 0,
        slowQueries: 0,
        avgQueryTime: 0,
        cacheHitRatio: 0,
        topSlowQueries: []
      };
    }
  }
}

// Singleton instance
export const slowQueryMonitor = new SlowQueryMonitor();