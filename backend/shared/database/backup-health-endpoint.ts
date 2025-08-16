import { BackupService } from './backup-service';
import { Request, Response } from 'express';

/**
 * Backup health check endpoint for monitoring systems
 */
export class BackupHealthEndpoint {
  private backupService: BackupService;

  constructor(backupService: BackupService) {
    this.backupService = backupService;
  }

  /**
   * Main health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.backupService.getDisasterRecoveryStatus();
      const stats = await this.backupService.getBackupStatistics();

      const healthData = {
        status: status.isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        backup: {
          lastBackup: status.lastBackup,
          backupCount: status.backupCount,
          totalSize: stats.totalSize,
          successRate: stats.totalBackups > 0 ? (stats.successfulBackups / stats.totalBackups) * 100 : 0,
          verificationRate: stats.verificationRate,
          rtoTarget: status.rtoTarget,
          rpoTarget: status.rpoTarget
        },
        issues: status.issues,
        checks: {
          recentBackup: this.checkRecentBackup(status.lastBackup),
          backupVerification: status.verificationStatus === 'passed',
          sufficientBackups: status.backupCount >= 7,
          noFailures: stats.failedBackups === 0
        }
      };

      const httpStatus = status.isHealthy ? 200 : 503;
      res.status(httpStatus).json(healthData);

    } catch (error) {
      console.error('Backup health check failed:', error);
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        checks: {
          recentBackup: false,
          backupVerification: false,
          sufficientBackups: false,
          noFailures: false
        }
      });
    }
  }

  /**
   * Detailed backup status endpoint
   */
  async detailedStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.backupService.getDisasterRecoveryStatus();
      const stats = await this.backupService.getBackupStatistics();

      const detailedData = {
        timestamp: new Date().toISOString(),
        overall: {
          healthy: status.isHealthy,
          issues: status.issues
        },
        backups: {
          total: stats.totalBackups,
          successful: stats.successfulBackups,
          failed: stats.failedBackups,
          successRate: stats.totalBackups > 0 ? (stats.successfulBackups / stats.totalBackups) * 100 : 0,
          totalSize: stats.totalSize,
          averageSize: stats.averageSize,
          oldest: stats.oldestBackup,
          newest: stats.newestBackup
        },
        verification: {
          rate: stats.verificationRate,
          lastVerification: status.lastVerification,
          status: status.verificationStatus
        },
        recovery: {
          rtoTarget: status.rtoTarget,
          rpoTarget: status.rpoTarget,
          lastBackup: status.lastBackup,
          backupAge: status.lastBackup ? 
            Math.round((Date.now() - status.lastBackup.getTime()) / (1000 * 60)) : null
        },
        recommendations: this.generateRecommendations(status, stats)
      };

      res.status(200).json(detailedData);

    } catch (error) {
      console.error('Detailed backup status failed:', error);
      res.status(500).json({
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  /**
   * Backup statistics endpoint
   */
  async statistics(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.backupService.getBackupStatistics();

      res.status(200).json({
        timestamp: new Date().toISOString(),
        statistics: stats
      });

    } catch (error) {
      console.error('Backup statistics failed:', error);
      res.status(500).json({
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  /**
   * Trigger manual backup endpoint
   */
  async triggerBackup(req: Request, res: Response): Promise<void> {
    try {
      console.log('Manual backup triggered via API');
      
      const result = await this.backupService.createVerifiedBackup();

      res.status(200).json({
        timestamp: new Date().toISOString(),
        message: 'Backup created successfully',
        backup: {
          id: result.backup.id,
          size: result.backup.size,
          verified: result.verification.isValid
        }
      });

    } catch (error) {
      console.error('Manual backup failed:', error);
      res.status(500).json({
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  /**
   * Verify specific backup endpoint
   */
  async verifyBackup(req: Request, res: Response): Promise<void> {
    try {
      const { backupId } = req.params;
      
      if (!backupId) {
        res.status(400).json({
          timestamp: new Date().toISOString(),
          error: 'Backup ID is required'
        });
        return;
      }

      const verification = await this.backupService.verifyBackupIntegrity(backupId);

      res.status(200).json({
        timestamp: new Date().toISOString(),
        verification
      });

    } catch (error) {
      console.error('Backup verification failed:', error);
      res.status(500).json({
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  /**
   * Run disaster recovery test endpoint
   */
  async runDRTest(req: Request, res: Response): Promise<void> {
    try {
      console.log('Disaster recovery test triggered via API');
      
      const testResult = await this.backupService.runDisasterRecoveryTest();

      res.status(200).json({
        timestamp: new Date().toISOString(),
        test: testResult
      });

    } catch (error) {
      console.error('Disaster recovery test failed:', error);
      res.status(500).json({
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  /**
   * Prometheus metrics endpoint
   */
  async prometheusMetrics(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.backupService.getDisasterRecoveryStatus();
      const stats = await this.backupService.getBackupStatistics();

      const metrics = [
        `# HELP backup_total_count Total number of backups`,
        `# TYPE backup_total_count gauge`,
        `backup_total_count ${stats.totalBackups}`,
        ``,
        `# HELP backup_successful_count Number of successful backups`,
        `# TYPE backup_successful_count gauge`,
        `backup_successful_count ${stats.successfulBackups}`,
        ``,
        `# HELP backup_failed_count Number of failed backups`,
        `# TYPE backup_failed_count gauge`,
        `backup_failed_count ${stats.failedBackups}`,
        ``,
        `# HELP backup_success_rate Backup success rate percentage`,
        `# TYPE backup_success_rate gauge`,
        `backup_success_rate ${stats.totalBackups > 0 ? (stats.successfulBackups / stats.totalBackups) * 100 : 0}`,
        ``,
        `# HELP backup_total_size_bytes Total size of all backups in bytes`,
        `# TYPE backup_total_size_bytes gauge`,
        `backup_total_size_bytes ${stats.totalSize}`,
        ``,
        `# HELP backup_verification_rate Backup verification rate percentage`,
        `# TYPE backup_verification_rate gauge`,
        `backup_verification_rate ${stats.verificationRate}`,
        ``,
        `# HELP backup_healthy Backup system health status (1 = healthy, 0 = unhealthy)`,
        `# TYPE backup_healthy gauge`,
        `backup_healthy ${status.isHealthy ? 1 : 0}`,
        ``,
        `# HELP backup_last_backup_timestamp Unix timestamp of last backup`,
        `# TYPE backup_last_backup_timestamp gauge`,
        `backup_last_backup_timestamp ${status.lastBackup ? Math.floor(status.lastBackup.getTime() / 1000) : 0}`,
        ``
      ].join('\n');

      res.set('Content-Type', 'text/plain');
      res.status(200).send(metrics);

    } catch (error) {
      console.error('Prometheus metrics failed:', error);
      res.status(500).send('# Error generating metrics\n');
    }
  }

  // Private helper methods

  private checkRecentBackup(lastBackup: Date | null): boolean {
    if (!lastBackup) return false;
    
    const hoursSinceLastBackup = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastBackup <= 25; // Less than 25 hours
  }

  private generateRecommendations(status: any, stats: any): string[] {
    const recommendations: string[] = [];

    if (stats.failedBackups > 0) {
      recommendations.push('Investigate and resolve backup failures');
    }

    if (stats.verificationRate < 80) {
      recommendations.push('Increase backup verification frequency');
    }

    if (status.issues.length > 0) {
      recommendations.push('Address health issues: ' + status.issues.join(', '));
    }

    if (stats.totalBackups < 7) {
      recommendations.push('Allow more time for backup retention to build up');
    }

    if (stats.successfulBackups > 0) {
      const avgSize = stats.averageSize;
      const lastSize = stats.totalSize / stats.successfulBackups;
      
      if (Math.abs(lastSize - avgSize) / avgSize > 0.5) {
        recommendations.push('Recent backup size deviation detected - investigate data changes');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Backup system is operating optimally');
    }

    return recommendations;
  }
}

/**
 * Express router setup for backup endpoints
 */
export function setupBackupRoutes(backupService: BackupService): any {
  const express = require('express');
  const router = express.Router();
  const healthEndpoint = new BackupHealthEndpoint(backupService);

  // Health check endpoints
  router.get('/health', (req: Request, res: Response) => healthEndpoint.healthCheck(req, res));
  router.get('/health/detailed', (req: Request, res: Response) => healthEndpoint.detailedStatus(req, res));
  router.get('/statistics', (req: Request, res: Response) => healthEndpoint.statistics(req, res));
  
  // Management endpoints
  router.post('/trigger', (req: Request, res: Response) => healthEndpoint.triggerBackup(req, res));
  router.post('/verify/:backupId', (req: Request, res: Response) => healthEndpoint.verifyBackup(req, res));
  router.post('/test-dr', (req: Request, res: Response) => healthEndpoint.runDRTest(req, res));
  
  // Monitoring endpoints
  router.get('/metrics', (req: Request, res: Response) => healthEndpoint.prometheusMetrics(req, res));

  return router;
}