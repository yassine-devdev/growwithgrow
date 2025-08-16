#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MigrationAutomation {
  constructor() {
    this.migrationsDir = path.join(process.cwd(), 'backend', 'shared', 'database', 'migrations');
    this.backupDir = path.join(process.cwd(), 'database-backups');
    this.logDir = path.join(process.cwd(), 'migration-logs');
  }

  async initialize() {
    [this.backupDir, this.logDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async createDatabaseBackup(environment = 'production') {
    console.log(`📦 Creating database backup for ${environment}...`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `${environment}-${timestamp}.sql`);
    
    try {
      // Load environment variables
      const envFile = path.join(process.cwd(), 'config', 'environments', `${environment}.env`);
      if (fs.existsSync(envFile)) {
        const envContent = fs.readFileSync(envFile, 'utf8');
        const envVars = {};
        
        envContent.split('\n').forEach(line => {
          if (line.includes('=') && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        });
        
        // Set environment variables for pg_dump
        Object.assign(process.env, envVars);
      }
      
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbPort = process.env.DB_PORT || '5432';
      const dbName = process.env.DB_NAME || `${environment}_app`;
      const dbUser = process.env.DB_USER || 'postgres';
      
      // Create backup using pg_dump
      const dumpCommand = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --no-password --verbose --clean --if-exists --create > "${backupFile}"`;
      
      execSync(dumpCommand, { 
        stdio: 'inherit',
        env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD }
      });
      
      console.log(`✅ Database backup created: ${backupFile}`);
      return backupFile;
    } catch (error) {
      console.error('❌ Failed to create database backup:', error.message);
      throw error;
    }
  }

  async getPendingMigrations() {
    console.log('🔍 Checking for pending migrations...');
    
    try {
      // Get migration status from the database CLI
      const statusOutput = execSync('npm run db:status', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      // Parse the output to find pending migrations
      const lines = statusOutput.split('\n');
      const pendingMigrations = lines
        .filter(line => line.includes('pending') || line.includes('not applied'))
        .map(line => line.trim());
      
      console.log(`📋 Found ${pendingMigrations.length} pending migrations`);
      pendingMigrations.forEach(migration => {
        console.log(`  - ${migration}`);
      });
      
      return pendingMigrations;
    } catch (error) {
      console.error('❌ Failed to get migration status:', error.message);
      return [];
    }
  }

  async runMigrations(environment = 'production', dryRun = false) {
    console.log(`🚀 ${dryRun ? 'Dry run' : 'Running'} migrations for ${environment}...`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(this.logDir, `migration-${environment}-${timestamp}.log`);
    
    try {
      // Create backup before running migrations
      if (!dryRun) {
        await this.createDatabaseBackup(environment);
      }
      
      // Get pending migrations
      const pendingMigrations = await this.getPendingMigrations();
      
      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found');
        return { success: true, migrationsRun: 0 };
      }
      
      if (dryRun) {
        console.log('🔍 Dry run - would run the following migrations:');
        pendingMigrations.forEach(migration => {
          console.log(`  - ${migration}`);
        });
        return { success: true, migrationsRun: pendingMigrations.length, dryRun: true };
      }
      
      // Run migrations
      console.log('⚡ Running migrations...');
      const migrationOutput = execSync('npm run db:migrate', {
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      // Log the output
      fs.writeFileSync(logFile, migrationOutput);
      console.log(`📝 Migration log saved to: ${logFile}`);
      
      // Verify migrations were applied
      const postMigrationStatus = await this.getPendingMigrations();
      const migrationsRun = pendingMigrations.length - postMigrationStatus.length;
      
      if (postMigrationStatus.length === 0) {
        console.log(`✅ All ${migrationsRun} migrations completed successfully`);
        return { success: true, migrationsRun };
      } else {
        console.log(`⚠️  ${migrationsRun} migrations completed, ${postMigrationStatus.length} still pending`);
        return { success: false, migrationsRun, pendingCount: postMigrationStatus.length };
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      
      // Log the error
      const errorLog = `Migration failed at ${new Date().toISOString()}\nError: ${error.message}\nStack: ${error.stack}`;
      fs.writeFileSync(logFile, errorLog);
      
      throw error;
    }
  }

  async rollbackMigration(steps = 1) {
    console.log(`🔄 Rolling back ${steps} migration(s)...`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(this.logDir, `rollback-${timestamp}.log`);
    
    try {
      // Create backup before rollback
      await this.createDatabaseBackup('pre-rollback');
      
      // Run rollback
      const rollbackOutput = execSync(`npm run db:rollback`, {
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      // Log the output
      fs.writeFileSync(logFile, rollbackOutput);
      console.log(`📝 Rollback log saved to: ${logFile}`);
      
      console.log(`✅ Rollback completed successfully`);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      
      // Log the error
      const errorLog = `Rollback failed at ${new Date().toISOString()}\nError: ${error.message}\nStack: ${error.stack}`;
      fs.writeFileSync(logFile, errorLog);
      
      throw error;
    }
  }

  async validateMigrations() {
    console.log('🔍 Validating migration files...');
    
    if (!fs.existsSync(this.migrationsDir)) {
      console.log('❌ Migrations directory not found');
      return { valid: false, errors: ['Migrations directory not found'] };
    }
    
    const migrationFiles = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.up.sql') || file.endsWith('.down.sql'))
      .sort();
    
    const errors = [];
    const warnings = [];
    
    // Check for paired up/down migrations
    const upFiles = migrationFiles.filter(file => file.endsWith('.up.sql'));
    const downFiles = migrationFiles.filter(file => file.endsWith('.down.sql'));
    
    upFiles.forEach(upFile => {
      const baseName = upFile.replace('.up.sql', '');
      const downFile = `${baseName}.down.sql`;
      
      if (!downFiles.includes(downFile)) {
        warnings.push(`Missing down migration for: ${upFile}`);
      }
    });
    
    // Check migration file naming convention
    migrationFiles.forEach(file => {
      if (!/^\d{3}_[\w_]+\.(up|down)\.sql$/.test(file)) {
        errors.push(`Invalid migration file name: ${file}`);
      }
    });
    
    // Check for SQL syntax issues (basic check)
    migrationFiles.forEach(file => {
      const filePath = path.join(this.migrationsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic SQL validation
      if (!content.trim()) {
        errors.push(`Empty migration file: ${file}`);
      }
      
      // Check for dangerous operations in up migrations
      if (file.endsWith('.up.sql')) {
        const dangerousPatterns = [
          /DROP\s+DATABASE/i,
          /TRUNCATE\s+TABLE/i,
          /DELETE\s+FROM\s+\w+\s*;?\s*$/im
        ];
        
        dangerousPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            warnings.push(`Potentially dangerous operation in ${file}: ${pattern.source}`);
          }
        });
      }
    });
    
    console.log(`📊 Migration validation results:`);
    console.log(`  Files checked: ${migrationFiles.length}`);
    console.log(`  Errors: ${errors.length}`);
    console.log(`  Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ All migrations are valid');
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }

  async createMigrationPlan(environment) {
    console.log(`📋 Creating migration plan for ${environment}...`);
    
    const pendingMigrations = await this.getPendingMigrations();
    const validation = await this.validateMigrations();
    
    const plan = {
      environment,
      timestamp: new Date().toISOString(),
      pendingMigrations: pendingMigrations.length,
      validationPassed: validation.valid,
      validationErrors: validation.errors,
      validationWarnings: validation.warnings,
      estimatedDuration: pendingMigrations.length * 30, // 30 seconds per migration estimate
      backupRequired: true,
      rollbackPlan: 'Automated rollback available via npm run db:rollback'
    };
    
    const planFile = path.join(this.logDir, `migration-plan-${environment}-${Date.now()}.json`);
    fs.writeFileSync(planFile, JSON.stringify(plan, null, 2));
    
    console.log(`📄 Migration plan created: ${planFile}`);
    console.log(`📊 Plan summary:`);
    console.log(`  Environment: ${plan.environment}`);
    console.log(`  Pending migrations: ${plan.pendingMigrations}`);
    console.log(`  Validation passed: ${plan.validationPassed ? '✅' : '❌'}`);
    console.log(`  Estimated duration: ${plan.estimatedDuration} seconds`);
    
    return plan;
  }

  async cleanupOldBackups(retentionDays = 30) {
    console.log(`🧹 Cleaning up backups older than ${retentionDays} days...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const backupFiles = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        return { file, path: filePath, mtime: stats.mtime };
      })
      .filter(backup => backup.mtime < cutoffDate);
    
    let deletedCount = 0;
    backupFiles.forEach(backup => {
      try {
        fs.unlinkSync(backup.path);
        console.log(`🗑️  Deleted old backup: ${backup.file}`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Failed to delete ${backup.file}:`, error.message);
      }
    });
    
    console.log(`✅ Cleanup completed. Deleted ${deletedCount} old backups.`);
    return deletedCount;
  }
}

async function main() {
  const automation = new MigrationAutomation();
  await automation.initialize();
  
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];
  
  try {
    switch (command) {
      case 'backup':
        const env = arg1 || 'production';
        await automation.createDatabaseBackup(env);
        break;
        
      case 'status':
        await automation.getPendingMigrations();
        break;
        
      case 'migrate':
        const targetEnv = arg1 || 'production';
        const dryRun = arg2 === '--dry-run';
        await automation.runMigrations(targetEnv, dryRun);
        break;
        
      case 'rollback':
        const steps = parseInt(arg1) || 1;
        await automation.rollbackMigration(steps);
        break;
        
      case 'validate':
        await automation.validateMigrations();
        break;
        
      case 'plan':
        const planEnv = arg1 || 'production';
        await automation.createMigrationPlan(planEnv);
        break;
        
      case 'cleanup':
        const retentionDays = parseInt(arg1) || 30;
        await automation.cleanupOldBackups(retentionDays);
        break;
        
      default:
        console.log('Usage: node migration-automation.js <command> [args]');
        console.log('Commands:');
        console.log('  backup [env]           - Create database backup');
        console.log('  status                 - Check migration status');
        console.log('  migrate [env] [--dry-run] - Run pending migrations');
        console.log('  rollback [steps]       - Rollback migrations');
        console.log('  validate               - Validate migration files');
        console.log('  plan [env]             - Create migration plan');
        console.log('  cleanup [days]         - Cleanup old backups');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MigrationAutomation;