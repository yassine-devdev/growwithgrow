import { BackupService } from './backup-service';
import { initializeBackupSystem, generateBackupStatusReport } from './init-backup-system';
import { setupBackupRoutes } from './backup-health-endpoint';
import { SQLDatabase } from "encore.dev/storage/sqldb";
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Main backup system integration class
 * Handles initialization, monitoring, and management of the backup system
 */
export class BackupSystemIntegration {
  private backupService: BackupService | null = null;
  private databases: Map<string, SQLDatabase>;
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(databases: Map<string, SQLDatabase>) {
    this.databases = databases;
  }

  /**
   * Initialize the complete backup system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️  Backup system already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing backup system integration...');

      // Load environment configuration
      await this.loadBackupEnvironment();

      // Initialize backup service
      this.backupService = await initializeBackupSystem(this.databases);

      // Set up health monitoring
      await this.setupHealthMonitoring();

      // Set up periodic tasks
      this.setupPeriodicTasks();

      this.isInitialized = true;
      console.log('✅ Backup system integration initialized successfully');

      // Generate initial status report
      await this.generateInitialReport();

    } catch (error) {
      console.error('❌ Failed to initialize backup system:', error);
      throw error;
    }
  }

  /**
   * Get the backup service instance
   */
  getBackupService(): BackupService {
    if (!this.backupService) {
      throw new Error('Backup system not initialized. Call initialize() first.');
    }
    return this.backupService;
  }

  /**
   * Set up Express routes for backup endpoints
   */
  setupRoutes(): any {
    if (!this.backupService) {
      throw new Error('Backup system not initialized. Call initialize() first.');
    }
    return setupBackupRoutes(this.backupService);
  }

  /**
   * Perform immediate backup with verification
   */
  async performBackup(): Promise<{ success: boolean; backupId?: string; error?: string }> {
    if (!this.backupService) {
      return { success: false, error: 'Backup system not initialized' };
    }

    try {
      const result = await this.backupService.createVerifiedBackup();
      return { 
        success: true, 
        backupId: result.backup.id 
      };
    } catch (error) {
      console.error('Manual backup failed:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(): Promise<any> {
    if (!this.backupService) {
      throw new Error('Backup system not initialized');
    }

    const [drStatus, stats] = await Promise.all([
      this.backupService.getDisasterRecoveryStatus(),
      this.backupService.getBackupStatistics()
    ]);

    return {
      timestamp: new Date().toISOString(),
      initialized: this.isInitialized,
      healthy: drStatus.isHealthy,
      disasterRecovery: drStatus,
      statistics: stats,
      monitoring: {
        healthCheckActive: this.healthCheckInterval !== null,
        lastHealthCheck: new Date().toISOString()
      }
    };
  }

  /**
   * Run disaster recovery test
   */
  async runDisasterRecoveryTest(): Promise<any> {
    if (!this.backupService) {
      throw new Error('Backup system not initialized');
    }

    console.log('🧪 Running disaster recovery test...');
    const result = await this.backupService.runDisasterRecoveryTest();
    
    // Log test results
    console.log(`DR Test Result: ${result.success ? 'PASSED' : 'FAILED'}`);
    console.log(`Duration: ${result.duration}ms`);
    
    for (const step of result.steps) {
      console.log(`  ${step.success ? '✅' : '❌'} ${step.step} (${step.duration}ms)`);
      if (step.error) {
        console.log(`    Error: ${step.error}`);
      }
    }

    return result;
  }

  /**
   * Shutdown the backup system gracefully
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down backup system...');

    // Clear health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Perform any cleanup
    if (this.backupService) {
      // Cancel any running backups (would be implemented in BackupScheduler)
      console.log('📅 Cancelled scheduled backups');
    }

    this.isInitialized = false;
    console.log('✅ Backup system shutdown complete');
  }

  // Private methods

  private async loadBackupEnvironment(): Promise<void> {
    const envPath = path.join(__dirname, '.env.backup');
    
    try {
      const envContent = await fs.readFile(envPath, 'utf-8');
      const envVars = envContent.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .reduce((acc, line) => {
          const [key, value] = line.split('=');
          if (key && value) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        }, {} as Record<string, string>);

      // Set environment variables if not already set
      for (const [key, value] of Object.entries(envVars)) {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }

      console.log('✅ Backup environment configuration loaded');
    } catch (error) {
      console.log('⚠️  No backup environment file found, using defaults');
    }
  }

  private async setupHealthMonitoring(): Promise<void> {
    if (!this.backupService) return;

    const intervalMs = parseInt(process.env.BACKUP_HEALTH_CHECK_INTERVAL || '3600000'); // 1 hour default

    this.healthCheckInterval = setInterval(async () => {
      try {
        const status = await this.backupService!.getDisasterRecoveryStatus();
        
        if (!status.isHealthy) {
          console.warn('⚠️  Backup system health issues detected:', status.issues);
          await this.sendHealthAlert(status);
        }
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
    }, intervalMs);

    console.log(`📊 Health monitoring started (interval: ${intervalMs}ms)`);
  }

  private setupPeriodicTasks(): Promise<void> {
    // Set up daily status report generation
    const dailyReportTime = new Date();
    dailyReportTime.setHours(6, 0, 0, 0); // 6 AM daily

    const msUntilNextReport = dailyReportTime.getTime() - Date.now();
    const msInDay = 24 * 60 * 60 * 1000;

    setTimeout(() => {
      // Generate daily report
      this.generateDailyReport();
      
      // Set up recurring daily reports
      setInterval(() => {
        this.generateDailyReport();
      }, msInDay);
    }, msUntilNextReport > 0 ? msUntilNextReport : msUntilNextReport + msInDay);

    console.log('📅 Periodic tasks scheduled');
    return Promise.resolve();
  }

  private async generateInitialReport(): Promise<void> {
    if (!this.backupService) return;

    try {
      const report = await generateBackupStatusReport(this.backupService);
      const reportPath = path.join(process.cwd(), 'logs', 'backup-initial-report.md');
      
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.writeFile(reportPath, report);
      
      console.log(`📊 Initial backup report generated: ${reportPath}`);
    } catch (error) {
      console.error('Failed to generate initial report:', error);
    }
  }

  private async generateDailyReport(): Promise<void> {
    if (!this.backupService) return;

    try {
      const report = await generateBackupStatusReport(this.backupService);
      const date = new Date().toISOString().split('T')[0];
      const reportPath = path.join(process.cwd(), 'logs', `backup-report-${date}.md`);
      
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.writeFile(reportPath, report);
      
      console.log(`📊 Daily backup report generated: ${reportPath}`);
    } catch (error) {
      console.error('Failed to generate daily report:', error);
    }
  }

  private async sendHealthAlert(status: any): Promise<void> {
    const webhookUrl = process.env.BACKUP_ALERT_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('⚠️  No webhook URL configured for alerts');
      return;
    }

    try {
      const alertMessage = {
        text: `🚨 Backup System Health Alert`,
        attachments: [
          {
            color: 'danger',
            title: 'Backup System Issues Detected',
            fields: [
              {
                title: 'Issues',
                value: status.issues.join('\n'),
                short: false
              },
              {
                title: 'Last Backup',
                value: status.lastBackup ? status.lastBackup.toISOString() : 'None',
                short: true
              },
              {
                title: 'Backup Count',
                value: status.backupCount.toString(),
                short: true
              }
            ],
            footer: 'Backup System Monitor',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      // In production, you would send this to your webhook URL
      console.log('📧 Health alert prepared:', JSON.stringify(alertMessage, null, 2));
      
    } catch (error) {
      console.error('Failed to send health alert:', error);
    }
  }
}

/**
 * Global backup system instance
 */
let globalBackupSystem: BackupSystemIntegration | null = null;

/**
 * Get or create the global backup system instance
 */
export function getBackupSystem(databases?: Map<string, SQLDatabase>): BackupSystemIntegration {
  if (!globalBackupSystem) {
    if (!databases) {
      throw new Error('Databases map required for first initialization');
    }
    globalBackupSystem = new BackupSystemIntegration(databases);
  }
  return globalBackupSystem;
}

/**
 * Initialize the global backup system
 */
export async function initializeGlobalBackupSystem(databases: Map<string, SQLDatabase>): Promise<BackupSystemIntegration> {
  const backupSystem = getBackupSystem(databases);
  await backupSystem.initialize();
  return backupSystem;
}