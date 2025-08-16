import { BackupManager, BackupConfig } from './backup-manager';

export interface ScheduledBackupConfig {
  name: string;
  schedule: string; // cron expression
  backupType: 'full' | 'incremental' | 'selective';
  databases?: string[];
  enabled: boolean;
  retentionDays: number;
  notifyOnFailure: boolean;
  notifyEmails?: string[];
}

export interface ScheduledBackupStatus {
  id: string;
  name: string;
  lastRun?: Date;
  nextRun?: Date;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  lastError?: string;
  runCount: number;
  successCount: number;
  failureCount: number;
}

export class BackupScheduler {
  private backupManager: BackupManager;
  private scheduledBackups: Map<string, NodeJS.Timeout> = new Map();
  private backupConfigs: Map<string, ScheduledBackupConfig> = new Map();
  private backupStatuses: Map<string, ScheduledBackupStatus> = new Map();

  constructor(backupManager: BackupManager) {
    this.backupManager = backupManager;
  }

  /**
   * Schedule a recurring backup
   */
  scheduleBackup(config: ScheduledBackupConfig): string {
    const backupId = `scheduled_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    this.backupConfigs.set(backupId, config);
    this.backupStatuses.set(backupId, {
      id: backupId,
      name: config.name,
      status: 'scheduled',
      runCount: 0,
      successCount: 0,
      failureCount: 0
    });

    if (config.enabled) {
      this.startScheduledBackup(backupId, config);
    }

    console.log(`✓ Scheduled backup created: ${config.name} (${backupId})`);
    return backupId;
  }

  /**
   * Schedule a simple recurring backup with interval
   */
  scheduleSimpleBackup(name: string, intervalMs: number): string {
    const backupId = `simple_${Date.now()}`;

    const interval = setInterval(async () => {
      const status = this.backupStatuses.get(backupId);
      if (status) {
        status.status = 'running';
        status.runCount++;
        this.backupStatuses.set(backupId, status);
      }

      try {
        await this.backupManager.createFullBackup();
        console.log(`✓ Scheduled backup ${name} completed successfully`);
        
        if (status) {
          status.status = 'completed';
          status.successCount++;
          status.lastRun = new Date();
          status.nextRun = new Date(Date.now() + intervalMs);
          this.backupStatuses.set(backupId, status);
        }
      } catch (error) {
        console.error(`✗ Scheduled backup ${name} failed:`, error);
        
        if (status) {
          status.status = 'failed';
          status.failureCount++;
          status.lastError = error instanceof Error ? error.message : String(error);
          status.lastRun = new Date();
          status.nextRun = new Date(Date.now() + intervalMs);
          this.backupStatuses.set(backupId, status);
        }
      }
    }, intervalMs);

    this.scheduledBackups.set(backupId, interval);
    this.backupStatuses.set(backupId, {
      id: backupId,
      name,
      status: 'scheduled',
      nextRun: new Date(Date.now() + intervalMs),
      runCount: 0,
      successCount: 0,
      failureCount: 0
    });

    return backupId;
  }

  /**
   * Start a scheduled backup based on cron expression
   */
  private startScheduledBackup(backupId: string, config: ScheduledBackupConfig): void {
    // This is a simplified implementation
    // In production, you'd use a proper cron library like node-cron
    
    const intervalMs = this.parseCronToInterval(config.schedule);
    
    const interval = setInterval(async () => {
      await this.executeScheduledBackup(backupId, config);
    }, intervalMs);

    this.scheduledBackups.set(backupId, interval);
  }

  /**
   * Execute a scheduled backup
   */
  private async executeScheduledBackup(backupId: string, config: ScheduledBackupConfig): Promise<void> {
    const status = this.backupStatuses.get(backupId);
    if (!status) return;

    status.status = 'running';
    status.runCount++;
    this.backupStatuses.set(backupId, status);

    try {
      let backupResult;

      switch (config.backupType) {
        case 'full':
          backupResult = await this.backupManager.createFullBackup();
          break;
        case 'selective':
          if (config.databases && config.databases.length > 0) {
            backupResult = await this.backupManager.createSelectiveBackup(config.databases);
          } else {
            throw new Error('Selective backup requires database list');
          }
          break;
        case 'incremental':
          // For now, create a full backup
          // In production, you'd implement incremental backup logic
          backupResult = await this.backupManager.createFullBackup();
          break;
        default:
          throw new Error(`Unknown backup type: ${config.backupType}`);
      }

      status.status = 'completed';
      status.successCount++;
      status.lastRun = new Date();
      status.nextRun = new Date(Date.now() + this.parseCronToInterval(config.schedule));
      delete status.lastError;

      console.log(`✓ Scheduled backup completed: ${config.name} (${backupResult.id})`);

    } catch (error) {
      status.status = 'failed';
      status.failureCount++;
      status.lastError = error instanceof Error ? error.message : String(error);
      status.lastRun = new Date();
      status.nextRun = new Date(Date.now() + this.parseCronToInterval(config.schedule));

      console.error(`✗ Scheduled backup failed: ${config.name}`, error);

      // Send failure notification if configured
      if (config.notifyOnFailure && config.notifyEmails) {
        await this.sendFailureNotification(config, error instanceof Error ? error : new Error(String(error)));
      }
    }

    this.backupStatuses.set(backupId, status);
  }

  /**
   * Cancel a scheduled backup
   */
  cancelBackup(backupId: string): boolean {
    const interval = this.scheduledBackups.get(backupId);
    if (interval) {
      clearInterval(interval);
      this.scheduledBackups.delete(backupId);
      
      const status = this.backupStatuses.get(backupId);
      if (status) {
        status.status = 'scheduled';
        delete status.nextRun;
        this.backupStatuses.set(backupId, status);
      }
      
      console.log(`✓ Cancelled scheduled backup: ${backupId}`);
      return true;
    }
    return false;
  }

  /**
   * Cancel all scheduled backups
   */
  cancelAllBackups(): void {
    for (const [backupId, interval] of this.scheduledBackups) {
      clearInterval(interval);
      
      const status = this.backupStatuses.get(backupId);
      if (status) {
        status.status = 'scheduled';
        delete status.nextRun;
        this.backupStatuses.set(backupId, status);
      }
    }
    this.scheduledBackups.clear();
    console.log('✓ All scheduled backups cancelled');
  }

  /**
   * Get list of active scheduled backups
   */
  getActiveBackups(): string[] {
    return Array.from(this.scheduledBackups.keys());
  }

  /**
   * Get status of all scheduled backups
   */
  getBackupStatuses(): ScheduledBackupStatus[] {
    return Array.from(this.backupStatuses.values());
  }

  /**
   * Get status of a specific backup
   */
  getBackupStatus(backupId: string): ScheduledBackupStatus | undefined {
    return this.backupStatuses.get(backupId);
  }

  /**
   * Update backup configuration
   */
  updateBackupConfig(backupId: string, config: Partial<ScheduledBackupConfig>): boolean {
    const existingConfig = this.backupConfigs.get(backupId);
    if (!existingConfig) return false;

    const updatedConfig = { ...existingConfig, ...config };
    this.backupConfigs.set(backupId, updatedConfig);

    // Restart the backup if it's currently scheduled
    if (this.scheduledBackups.has(backupId)) {
      this.cancelBackup(backupId);
      if (updatedConfig.enabled) {
        this.startScheduledBackup(backupId, updatedConfig);
      }
    }

    console.log(`✓ Updated backup configuration: ${backupId}`);
    return true;
  }

  /**
   * Enable or disable a scheduled backup
   */
  toggleBackup(backupId: string, enabled: boolean): boolean {
    const config = this.backupConfigs.get(backupId);
    if (!config) return false;

    config.enabled = enabled;
    this.backupConfigs.set(backupId, config);

    if (enabled && !this.scheduledBackups.has(backupId)) {
      this.startScheduledBackup(backupId, config);
    } else if (!enabled && this.scheduledBackups.has(backupId)) {
      this.cancelBackup(backupId);
    }

    console.log(`✓ ${enabled ? 'Enabled' : 'Disabled'} scheduled backup: ${backupId}`);
    return true;
  }

  /**
   * Run a backup immediately (outside of schedule)
   */
  async runBackupNow(backupId: string): Promise<void> {
    const config = this.backupConfigs.get(backupId);
    if (!config) {
      throw new Error(`Backup configuration not found: ${backupId}`);
    }

    console.log(`Running backup immediately: ${config.name}`);
    await this.executeScheduledBackup(backupId, config);
  }

  /**
   * Clean up old backups for all scheduled backups
   */
  async cleanupAllBackups(): Promise<void> {
    console.log('Starting cleanup for all scheduled backups...');
    
    for (const [backupId, config] of this.backupConfigs) {
      try {
        // Use the BackupManager's cleanup method
        await this.backupManager.cleanupOldBackups();
        console.log(`✓ Cleaned up old backups for: ${config.name}`);
      } catch (error) {
        console.error(`✗ Failed to cleanup backups for ${config.name}:`, error);
      }
    }
  }

  /**
   * Parse cron expression to interval (simplified)
   */
  private parseCronToInterval(cronExpression: string): number {
    // This is a very simplified cron parser
    // In production, use a proper cron library
    
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) {
      throw new Error('Invalid cron expression');
    }

    // For now, just handle some common patterns
    if (cronExpression === '0 0 * * *') { // Daily at midnight
      return 24 * 60 * 60 * 1000;
    } else if (cronExpression === '0 0 * * 0') { // Weekly on Sunday
      return 7 * 24 * 60 * 60 * 1000;
    } else if (cronExpression === '0 0 1 * *') { // Monthly on 1st
      return 30 * 24 * 60 * 60 * 1000;
    } else if (cronExpression === '0 */6 * * *') { // Every 6 hours
      return 6 * 60 * 60 * 1000;
    } else if (cronExpression === '0 */1 * * *') { // Every hour
      return 60 * 60 * 1000;
    }

    // Default to daily if we can't parse
    console.warn(`Unknown cron expression: ${cronExpression}, defaulting to daily`);
    return 24 * 60 * 60 * 1000;
  }

  /**
   * Send failure notification
   */
  private async sendFailureNotification(config: ScheduledBackupConfig, error: Error): Promise<void> {
    // This is a placeholder for email notification
    // In production, you'd integrate with an email service
    
    console.log(`📧 Sending failure notification for backup: ${config.name}`);
    console.log(`Recipients: ${config.notifyEmails?.join(', ')}`);
    console.log(`Error: ${error.message}`);
    
    // Example notification content:
    const notification = {
      subject: `Backup Failed: ${config.name}`,
      body: `
        The scheduled backup "${config.name}" has failed.
        
        Error: ${error.message}
        Time: ${new Date().toISOString()}
        Backup Type: ${config.backupType}
        
        Please check the backup system and resolve the issue.
      `,
      recipients: config.notifyEmails || []
    };

    // In production, send the actual email
    console.log('Notification prepared:', notification);
  }

  /**
   * Get backup statistics
   */
  getBackupStatistics(): {
    totalScheduled: number;
    activeScheduled: number;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    successRate: number;
  } {
    const statuses = Array.from(this.backupStatuses.values());
    
    const totalScheduled = statuses.length;
    const activeScheduled = this.scheduledBackups.size;
    const totalRuns = statuses.reduce((sum, status) => sum + status.runCount, 0);
    const successfulRuns = statuses.reduce((sum, status) => sum + status.successCount, 0);
    const failedRuns = statuses.reduce((sum, status) => sum + status.failureCount, 0);
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

    return {
      totalScheduled,
      activeScheduled,
      totalRuns,
      successfulRuns,
      failedRuns,
      successRate: Math.round(successRate * 100) / 100
    };
  }
}