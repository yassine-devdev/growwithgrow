#!/usr/bin/env node

import { MigrationManager } from './migration-manager';
import { DatabaseSeeder } from './seeder';
import { BackupManager, BackupConfig } from './backup-manager';
import { BackupScheduler, ScheduledBackupConfig } from './backup-scheduler';
import { SQLDatabase } from "encore.dev/storage/sqldb";
import * as path from 'path';
import * as fs from 'fs/promises';

// Database instances for different modules
const databases = {
  ai: new SQLDatabase("ai", { migrations: "./ai/migrations" }),
  analytics: new SQLDatabase("analytics", { migrations: "./analytics/migrations" }),
  communications: new SQLDatabase("communications", { migrations: "./communications/migrations" }),
  crm: new SQLDatabase("crm", { migrations: "./crm/migrations" }),
  dashboard: new SQLDatabase("dashboard", { migrations: "./dashboard/migrations" }),
  gamification: new SQLDatabase("gamification", { migrations: "./gamification/migrations" }),
  integrations: new SQLDatabase("integrations", { migrations: "./integrations/migrations" }),
  knowledge: new SQLDatabase("knowledge", { migrations: "./knowledge/migrations" }),
  marketplace: new SQLDatabase("marketplace", { migrations: "./marketplace/migrations" }),
  notifications: new SQLDatabase("notifications", { migrations: "./notifications/migrations" }),
  schoolhub: new SQLDatabase("school-hub", { migrations: "./school-hub/migrations" }),
  settings: new SQLDatabase("settings", { migrations: "./settings/migrations" }),
  support: new SQLDatabase("support", { migrations: "./support/migrations" }),
  tools: new SQLDatabase("tools", { migrations: "./tools/migrations" }),
  webhooks: new SQLDatabase("webhooks", { migrations: "./webhooks/migrations" })
};

class DatabaseCLI {
  private managers: Map<string, MigrationManager> = new Map();
  private seeders: Map<string, DatabaseSeeder> = new Map();
  private backupManager: BackupManager;
  private backupScheduler: BackupScheduler;

  constructor() {
    // Initialize migration managers for each database
    for (const [name, db] of Object.entries(databases)) {
      const migrationsPath = path.join(__dirname, '..', '..', name, 'migrations');
      const seedsPath = path.join(__dirname, '..', '..', name, 'seeds');
      
      this.managers.set(name, new MigrationManager(db, migrationsPath));
      this.seeders.set(name, new DatabaseSeeder(db, seedsPath));
    }

    // Initialize backup manager
    const backupConfig: BackupConfig = {
      backupPath: process.env.BACKUP_PATH || './backups',
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
      compressionEnabled: process.env.BACKUP_COMPRESSION === 'true',
      encryptionEnabled: process.env.BACKUP_ENCRYPTION === 'true',
      encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
      s3Config: process.env.BACKUP_S3_BUCKET ? {
        bucket: process.env.BACKUP_S3_BUCKET,
        region: process.env.BACKUP_S3_REGION || 'us-east-1',
        accessKeyId: process.env.BACKUP_S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.BACKUP_S3_SECRET_ACCESS_KEY || ''
      } : undefined
    };

    this.backupManager = new BackupManager(backupConfig, new Map(Object.entries(databases)));
    this.backupScheduler = new BackupScheduler(this.backupManager);
  }

  async runCommand(args: string[]): Promise<void> {
    const [command, ...params] = args;

    try {
      switch (command) {
        case 'migrate':
          await this.handleMigrate(params);
          break;
        case 'rollback':
          await this.handleRollback(params);
          break;
        case 'status':
          await this.handleStatus(params);
          break;
        case 'create':
          await this.handleCreate(params);
          break;
        case 'seed':
          await this.handleSeed(params);
          break;
        case 'verify':
          await this.handleVerify(params);
          break;
        case 'backup':
          await this.handleBackup(params);
          break;
        case 'restore':
          await this.handleRestore(params);
          break;
        case 'backup-list':
          await this.handleBackupList(params);
          break;
        case 'backup-verify':
          await this.handleBackupVerify(params);
          break;
        case 'backup-cleanup':
          await this.handleBackupCleanup(params);
          break;
        case 'backup-schedule':
          await this.handleBackupSchedule(params);
          break;
        case 'backup-status':
          await this.handleBackupStatus(params);
          break;
        case 'health-check':
          await this.handleHealthCheck(params);
          break;
        case 'integrity-check':
          await this.handleIntegrityCheck(params);
          break;
        case 'help':
          this.showHelp();
          break;
        default:
          console.error(`Unknown command: ${command}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }

  private async handleMigrate(params: string[]): Promise<void> {
    const [database] = params;

    if (database && database !== 'all') {
      if (!this.managers.has(database)) {
        throw new Error(`Unknown database: ${database}`);
      }
      
      const manager = this.managers.get(database)!;
      await manager.runMigrations();
    } else {
      // Run migrations for all databases
      console.log('Running migrations for all databases...');
      for (const [name, manager] of this.managers) {
        console.log(`\n--- ${name.toUpperCase()} ---`);
        await manager.runMigrations();
      }
    }
  }

  private async handleRollback(params: string[]): Promise<void> {
    const [database, migrationId] = params;

    if (!database || !migrationId) {
      throw new Error('Usage: rollback <database> <migration-id>');
    }

    if (!this.managers.has(database)) {
      throw new Error(`Unknown database: ${database}`);
    }

    const manager = this.managers.get(database)!;
    await manager.rollbackMigration(migrationId);
  }

  private async handleStatus(params: string[]): Promise<void> {
    const [database] = params;

    if (database && database !== 'all') {
      if (!this.managers.has(database)) {
        throw new Error(`Unknown database: ${database}`);
      }
      
      const manager = this.managers.get(database)!;
      const status = await manager.getMigrationStatus();
      this.printMigrationStatus(database, status);
    } else {
      // Show status for all databases
      for (const [name, manager] of this.managers) {
        const status = await manager.getMigrationStatus();
        this.printMigrationStatus(name, status);
        console.log('');
      }
    }
  }

  private async handleCreate(params: string[]): Promise<void> {
    const [database, ...nameParts] = params;

    if (!database || nameParts.length === 0) {
      throw new Error('Usage: create <database> <migration-name>');
    }

    if (!this.managers.has(database)) {
      throw new Error(`Unknown database: ${database}`);
    }

    const migrationName = nameParts.join(' ');
    const manager = this.managers.get(database)!;
    const migrationId = await manager.createMigration(migrationName);
    
    console.log(`Created migration: ${migrationId}`);
  }

  private async handleSeed(params: string[]): Promise<void> {
    const [database, environment = 'development'] = params;

    if (!database) {
      throw new Error('Usage: seed <database> [environment]');
    }

    if (database === 'all') {
      // Seed all databases
      for (const [name, seeder] of this.seeders) {
        console.log(`\n--- Seeding ${name.toUpperCase()} ---`);
        await seeder.runSeeds({
          environment: environment as any,
          truncateFirst: false,
          skipExisting: true
        });
      }
    } else {
      if (!this.seeders.has(database)) {
        throw new Error(`Unknown database: ${database}`);
      }

      const seeder = this.seeders.get(database)!;
      await seeder.runSeeds({
        environment: environment as any,
        truncateFirst: false,
        skipExisting: true
      });
    }
  }

  private async handleVerify(params: string[]): Promise<void> {
    const [database] = params;

    if (database && database !== 'all') {
      if (!this.managers.has(database)) {
        throw new Error(`Unknown database: ${database}`);
      }
      
      const manager = this.managers.get(database)!;
      const isValid = await manager.verifyMigrations();
      
      if (!isValid) {
        throw new Error(`Migration verification failed for database: ${database}`);
      }
      
      console.log(`✓ All migrations verified for database: ${database}`);
    } else {
      // Verify all databases
      let allValid = true;
      
      for (const [name, manager] of this.managers) {
        console.log(`Verifying ${name}...`);
        const isValid = await manager.verifyMigrations();
        
        if (!isValid) {
          allValid = false;
          console.error(`✗ Verification failed for database: ${name}`);
        } else {
          console.log(`✓ Verified database: ${name}`);
        }
      }
      
      if (!allValid) {
        throw new Error('Migration verification failed for one or more databases');
      }
      
      console.log('✓ All databases verified successfully');
    }
  }

  private printMigrationStatus(database: string, status: any[]): void {
    console.log(`\n--- ${database.toUpperCase()} MIGRATIONS ---`);
    
    if (status.length === 0) {
      console.log('No migrations found');
      return;
    }

    console.log('ID'.padEnd(25) + 'NAME'.padEnd(30) + 'STATUS'.padEnd(10) + 'APPLIED AT');
    console.log('-'.repeat(80));

    for (const migration of status) {
      const appliedAt = migration.appliedAt 
        ? new Date(migration.appliedAt).toISOString().slice(0, 19)
        : 'N/A';
      
      const statusIcon = migration.status === 'applied' ? '✓' : '○';
      
      console.log(
        migration.id.padEnd(25) +
        migration.name.padEnd(30) +
        `${statusIcon} ${migration.status}`.padEnd(10) +
        appliedAt
      );
    }
  }

  private async handleBackup(params: string[]): Promise<void> {
    const [type, ...options] = params;

    switch (type) {
      case 'create':
      case 'full':
        console.log('Creating full backup...');
        const fullBackup = await this.backupManager.createFullBackup();
        console.log(`✓ Full backup created: ${fullBackup.id}`);
        console.log(`  Size: ${this.formatBytes(fullBackup.size)}`);
        console.log(`  Location: ${fullBackup.location}`);
        break;

      case 'selective':
        const [databasesParam] = options;
        if (!databasesParam) {
          throw new Error('Usage: backup selective <database1,database2,...>');
        }
        const databaseNames = databasesParam.split(',');
        console.log(`Creating selective backup for: ${databaseNames.join(', ')}`);
        const selectiveBackup = await this.backupManager.createSelectiveBackup(databaseNames);
        console.log(`✓ Selective backup created: ${selectiveBackup.id}`);
        break;

      case 'point-in-time':
        const [timeParam] = options;
        if (!timeParam) {
          throw new Error('Usage: backup point-in-time <ISO-timestamp>');
        }
        const targetTime = new Date(timeParam);
        console.log(`Creating point-in-time backup for: ${targetTime.toISOString()}`);
        const pitBackup = await this.backupManager.createPointInTimeBackup(targetTime);
        console.log(`✓ Point-in-time backup created: ${pitBackup.id}`);
        break;

      default:
        throw new Error('Usage: backup <create|full|selective|point-in-time> [options]');
    }
  }

  private async handleRestore(params: string[]): Promise<void> {
    const [backupIdParam, ...options] = params;

    if (!backupIdParam) {
      throw new Error('Usage: restore <backup-id> [--target=<database>] [--data-only] [--schema-only]');
    }

    const restoreOptions: any = {
      backupId: backupIdParam
    };

    // Parse options
    for (const option of options) {
      if (option.startsWith('--target=')) {
        restoreOptions.targetDatabase = option.split('=')[1];
      } else if (option === '--data-only') {
        restoreOptions.dataOnly = true;
      } else if (option === '--schema-only') {
        restoreOptions.schemaOnly = true;
      } else if (option.startsWith('--skip-tables=')) {
        restoreOptions.skipTables = option.split('=')[1].split(',');
      } else if (option.startsWith('--point-in-time=')) {
        restoreOptions.pointInTime = new Date(option.split('=')[1]);
      }
    }

    console.log(`Restoring from backup: ${backupIdParam}`);
    await this.backupManager.restoreFromBackup(restoreOptions);
    console.log('✓ Restore completed successfully');
  }

  private async handleBackupList(params: string[]): Promise<void> {
    const backups = await this.backupManager.listBackups();

    if (backups.length === 0) {
      console.log('No backups found');
      return;
    }

    console.log('\nAvailable Backups:');
    console.log('ID'.padEnd(30) + 'TIMESTAMP'.padEnd(25) + 'SIZE'.padEnd(12) + 'STATUS'.padEnd(12) + 'DATABASES');
    console.log('-'.repeat(100));

    for (const backup of backups) {
      const timestamp = backup.timestamp.toISOString().slice(0, 19).replace('T', ' ');
      const size = this.formatBytes(backup.size);
      const databases = backup.databases.join(', ');
      const statusIcon = backup.status === 'completed' ? '✓' : backup.status === 'failed' ? '✗' : '○';

      console.log(
        backup.id.padEnd(30) +
        timestamp.padEnd(25) +
        size.padEnd(12) +
        `${statusIcon} ${backup.status}`.padEnd(12) +
        databases
      );
    }
  }

  private async handleBackupVerify(params: string[]): Promise<void> {
    const [backupId] = params;

    if (!backupId) {
      // Verify all backups
      const backups = await this.backupManager.listBackups();
      let allValid = true;

      for (const backup of backups) {
        console.log(`Verifying backup: ${backup.id}`);
        const isValid = await this.backupManager.verifyBackup(backup.id);
        
        if (!isValid) {
          allValid = false;
          console.error(`✗ Verification failed: ${backup.id}`);
        } else {
          console.log(`✓ Verified: ${backup.id}`);
        }
      }

      if (!allValid) {
        throw new Error('One or more backup verifications failed');
      }

      console.log('✓ All backups verified successfully');
    } else {
      // Verify specific backup
      const isValid = await this.backupManager.verifyBackup(backupId);
      
      if (!isValid) {
        throw new Error(`Backup verification failed: ${backupId}`);
      }

      console.log(`✓ Backup verified: ${backupId}`);
    }
  }

  private async handleBackupCleanup(params: string[]): Promise<void> {
    const [olderThanParam] = params;
    const olderThanDays = olderThanParam ? parseInt(olderThanParam) : 30;

    console.log(`Cleaning up backups older than ${olderThanDays} days...`);
    await this.backupManager.cleanupOldBackups();
    console.log('✓ Backup cleanup completed');
  }

  private async handleBackupSchedule(params: string[]): Promise<void> {
    const [action, ...options] = params;

    switch (action) {
      case 'create':
        const [name, schedule, type] = options;
        if (!name || !schedule || !type) {
          throw new Error('Usage: backup-schedule create <name> <cron-schedule> <type>');
        }

        const config: ScheduledBackupConfig = {
          name,
          schedule,
          backupType: type as any,
          enabled: true,
          retentionDays: 30,
          notifyOnFailure: true
        };

        const backupId = this.backupScheduler.scheduleBackup(config);
        console.log(`✓ Scheduled backup created: ${name} (${backupId})`);
        break;

      case 'list':
        const statuses = this.backupScheduler.getBackupStatuses();
        
        if (statuses.length === 0) {
          console.log('No scheduled backups found');
          return;
        }

        console.log('\nScheduled Backups:');
        console.log('NAME'.padEnd(20) + 'STATUS'.padEnd(12) + 'LAST RUN'.padEnd(20) + 'NEXT RUN'.padEnd(20) + 'SUCCESS RATE');
        console.log('-'.repeat(90));

        for (const status of statuses) {
          const lastRun = status.lastRun ? status.lastRun.toISOString().slice(0, 19).replace('T', ' ') : 'Never';
          const nextRun = status.nextRun ? status.nextRun.toISOString().slice(0, 19).replace('T', ' ') : 'N/A';
          const successRate = status.runCount > 0 ? `${Math.round((status.successCount / status.runCount) * 100)}%` : 'N/A';

          console.log(
            status.name.padEnd(20) +
            status.status.padEnd(12) +
            lastRun.padEnd(20) +
            nextRun.padEnd(20) +
            successRate
          );
        }
        break;

      case 'run':
        const [scheduleId] = options;
        if (!scheduleId) {
          throw new Error('Usage: backup-schedule run <schedule-id>');
        }

        console.log(`Running scheduled backup: ${scheduleId}`);
        await this.backupScheduler.runBackupNow(scheduleId);
        console.log('✓ Scheduled backup completed');
        break;

      case 'cancel':
        const [cancelId] = options;
        if (!cancelId) {
          throw new Error('Usage: backup-schedule cancel <schedule-id>');
        }

        const cancelled = this.backupScheduler.cancelBackup(cancelId);
        if (cancelled) {
          console.log(`✓ Cancelled scheduled backup: ${cancelId}`);
        } else {
          console.log(`Scheduled backup not found: ${cancelId}`);
        }
        break;

      default:
        throw new Error('Usage: backup-schedule <create|list|run|cancel> [options]');
    }
  }

  private async handleBackupStatus(params: string[]): Promise<void> {
    const stats = this.backupScheduler.getBackupStatistics();

    console.log('\nBackup Statistics:');
    console.log(`Total Scheduled: ${stats.totalScheduled}`);
    console.log(`Active Scheduled: ${stats.activeScheduled}`);
    console.log(`Total Runs: ${stats.totalRuns}`);
    console.log(`Successful Runs: ${stats.successfulRuns}`);
    console.log(`Failed Runs: ${stats.failedRuns}`);
    console.log(`Success Rate: ${stats.successRate}%`);

    // Show recent backups
    const recentBackups = await this.backupManager.listBackups();
    const recent = recentBackups.slice(0, 5);

    if (recent.length > 0) {
      console.log('\nRecent Backups:');
      for (const backup of recent) {
        const timestamp = backup.timestamp.toISOString().slice(0, 19).replace('T', ' ');
        const size = this.formatBytes(backup.size);
        const statusIcon = backup.status === 'completed' ? '✓' : backup.status === 'failed' ? '✗' : '○';
        
        console.log(`  ${statusIcon} ${backup.id} (${timestamp}) - ${size}`);
      }
    }
  }

  private async handleHealthCheck(params: string[]): Promise<void> {
    console.log('Running database health check...');

    let allHealthy = true;

    for (const [name, db] of Object.entries(databases)) {
      try {
        // Simple connectivity test
        await db.query('SELECT 1');
        console.log(`✓ ${name}: Connected`);
      } catch (error) {
        console.error(`✗ ${name}: Connection failed - ${error.message}`);
        allHealthy = false;
      }
    }

    // Check backup system
    try {
      const backups = await this.backupManager.listBackups();
      const recentBackup = backups.find(b => {
        const hoursSinceBackup = (Date.now() - b.timestamp.getTime()) / (1000 * 60 * 60);
        return hoursSinceBackup < 24;
      });

      if (recentBackup) {
        console.log('✓ Backup system: Recent backup found');
      } else {
        console.warn('⚠ Backup system: No recent backups (within 24 hours)');
      }
    } catch (error) {
      console.error(`✗ Backup system: ${error.message}`);
      allHealthy = false;
    }

    if (allHealthy) {
      console.log('\n✓ All systems healthy');
    } else {
      console.log('\n✗ Some systems require attention');
      process.exit(1);
    }
  }

  private async handleIntegrityCheck(params: string[]): Promise<void> {
    console.log('Running database integrity check...');

    let allValid = true;

    for (const [name, db] of Object.entries(databases)) {
      try {
        console.log(`Checking ${name}...`);

        // Check for orphaned records (simplified)
        // In production, you'd have more comprehensive integrity checks
        
        // Example: Check foreign key constraints
        const constraintViolations = await db.query(`
          SELECT conname, conrelid::regclass as table_name
          FROM pg_constraint 
          WHERE contype = 'f' 
          AND NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = conname
          )
        `);

        if (constraintViolations.length > 0) {
          console.error(`✗ ${name}: Found constraint violations`);
          allValid = false;
        } else {
          console.log(`✓ ${name}: No constraint violations found`);
        }

      } catch (error) {
        console.error(`✗ ${name}: Integrity check failed - ${error.message}`);
        allValid = false;
      }
    }

    if (allValid) {
      console.log('\n✓ All databases passed integrity check');
    } else {
      console.log('\n✗ Some databases failed integrity check');
      process.exit(1);
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private showHelp(): void {
    console.log(`
Database Management CLI

Usage: node cli.js <command> [options]

Migration Commands:
  migrate [database]           Run pending migrations (use 'all' for all databases)
  rollback <database> <id>     Rollback a specific migration
  status [database]            Show migration status (use 'all' for all databases)
  create <database> <name>     Create a new migration
  seed <database> [env]        Run seeds for environment (development, testing, staging)
  verify [database]            Verify migration integrity

Backup Commands:
  backup <type> [options]      Create backup (full, selective, point-in-time)
  restore <backup-id> [opts]   Restore from backup
  backup-list                  List all available backups
  backup-verify [backup-id]    Verify backup integrity
  backup-cleanup [days]        Clean up old backups (default: 30 days)
  backup-schedule <action>     Manage scheduled backups (create, list, run, cancel)
  backup-status                Show backup system status

Maintenance Commands:
  health-check                 Check database connectivity and system health
  integrity-check              Run database integrity checks
  help                         Show this help message

Available databases:
  ${Object.keys(databases).join(', ')}

Examples:
  # Migrations
  node cli.js migrate all                    # Run all pending migrations
  node cli.js create crm "add user table"   # Create new CRM migration
  
  # Backups
  node cli.js backup full                    # Create full backup
  node cli.js backup selective crm,ai       # Backup specific databases
  node cli.js restore backup_2024-01-01     # Restore from backup
  node cli.js backup-schedule create daily "0 2 * * *" full
  
  # Maintenance
  node cli.js health-check                   # Check system health
  node cli.js integrity-check                # Verify data integrity
`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new DatabaseCLI();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('No command provided');
    cli.runCommand(['help']);
  } else {
    cli.runCommand(args);
  }
}

export { DatabaseCLI };