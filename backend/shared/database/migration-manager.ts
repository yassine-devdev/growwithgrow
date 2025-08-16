import { SQLDatabase } from "encore.dev/storage/sqldb";
import * as fs from 'fs/promises';
import * as path from 'path';

export interface Migration {
  id: string;
  name: string;
  timestamp: number;
  upSql: string;
  downSql: string;
}

export interface MigrationStatus {
  id: string;
  name: string;
  appliedAt: Date | null;
  status: 'pending' | 'applied' | 'failed';
}

export class MigrationManager {
  private db: SQLDatabase;
  private migrationsPath: string;

  constructor(db: SQLDatabase, migrationsPath: string) {
    this.db = db;
    this.migrationsPath = migrationsPath;
  }

  /**
   * Initialize the migration system by creating the migrations table
   */
  async initialize(): Promise<void> {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        checksum VARCHAR(64) NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_migrations_applied_at ON migrations(applied_at);
    `);
  }

  /**
   * Get all available migrations from the filesystem
   */
  async getAvailableMigrations(): Promise<Migration[]> {
    try {
      const files = await fs.readdir(this.migrationsPath);
      const migrations: Migration[] = [];

      for (const file of files) {
        if (file.endsWith('.up.sql')) {
          const baseName = file.replace('.up.sql', '');
          const upPath = path.join(this.migrationsPath, file);
          const downPath = path.join(this.migrationsPath, `${baseName}.down.sql`);

          const upSql = await fs.readFile(upPath, 'utf-8');
          let downSql = '';

          try {
            downSql = await fs.readFile(downPath, 'utf-8');
          } catch (error) {
            // Down migration file is optional
            console.warn(`No down migration found for ${baseName}`);
          }

          // Parse migration ID and name from filename
          const match = baseName.match(/^(\d+)_(.+)$/);
          if (match) {
            const [, timestamp, name] = match;
            migrations.push({
              id: baseName,
              name: name.replace(/_/g, ' '),
              timestamp: parseInt(timestamp),
              upSql,
              downSql
            });
          }
        }
      }

      return migrations.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error(`Error reading migrations from ${this.migrationsPath}:`, error);
      return [];
    }
  }

  /**
   * Get applied migrations from the database
   */
  async getAppliedMigrations(): Promise<string[]> {
    const result = await this.db.query(`
      SELECT id FROM migrations ORDER BY applied_at ASC
    `);
    return result.map(row => row.id);
  }

  /**
   * Get migration status for all migrations
   */
  async getMigrationStatus(): Promise<MigrationStatus[]> {
    const available = await this.getAvailableMigrations();
    const applied = await this.getAppliedMigrations();
    const appliedSet = new Set(applied);

    const status: MigrationStatus[] = [];

    for (const migration of available) {
      if (appliedSet.has(migration.id)) {
        const result = await this.db.query(`
          SELECT applied_at FROM migrations WHERE id = $1
        `, [migration.id]);
        
        status.push({
          id: migration.id,
          name: migration.name,
          appliedAt: result[0]?.applied_at || null,
          status: 'applied'
        });
      } else {
        status.push({
          id: migration.id,
          name: migration.name,
          appliedAt: null,
          status: 'pending'
        });
      }
    }

    return status;
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    await this.initialize();
    
    const available = await this.getAvailableMigrations();
    const applied = await this.getAppliedMigrations();
    const appliedSet = new Set(applied);

    const pending = available.filter(m => !appliedSet.has(m.id));

    if (pending.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Running ${pending.length} pending migrations...`);

    for (const migration of pending) {
      try {
        console.log(`Applying migration: ${migration.id} - ${migration.name}`);
        
        // Calculate checksum for integrity verification
        const checksum = this.calculateChecksum(migration.upSql);
        
        // Run the migration in a transaction
        await this.db.exec('BEGIN');
        
        try {
          await this.db.exec(migration.upSql);
          
          await this.db.exec(`
            INSERT INTO migrations (id, name, checksum) 
            VALUES ($1, $2, $3)
          `, [migration.id, migration.name, checksum]);
          
          await this.db.exec('COMMIT');
          console.log(`✓ Applied migration: ${migration.id}`);
        } catch (error) {
          await this.db.exec('ROLLBACK');
          throw error;
        }
      } catch (error) {
        console.error(`✗ Failed to apply migration ${migration.id}:`, error);
        throw new Error(`Migration failed: ${migration.id} - ${error.message}`);
      }
    }

    console.log('All migrations completed successfully');
  }

  /**
   * Rollback a specific migration
   */
  async rollbackMigration(migrationId: string): Promise<void> {
    const available = await this.getAvailableMigrations();
    const migration = available.find(m => m.id === migrationId);

    if (!migration) {
      throw new Error(`Migration not found: ${migrationId}`);
    }

    if (!migration.downSql) {
      throw new Error(`No rollback script available for migration: ${migrationId}`);
    }

    const applied = await this.getAppliedMigrations();
    if (!applied.includes(migrationId)) {
      throw new Error(`Migration not applied: ${migrationId}`);
    }

    try {
      console.log(`Rolling back migration: ${migrationId} - ${migration.name}`);
      
      await this.db.exec('BEGIN');
      
      try {
        await this.db.exec(migration.downSql);
        
        await this.db.exec(`
          DELETE FROM migrations WHERE id = $1
        `, [migrationId]);
        
        await this.db.exec('COMMIT');
        console.log(`✓ Rolled back migration: ${migrationId}`);
      } catch (error) {
        await this.db.exec('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error(`✗ Failed to rollback migration ${migrationId}:`, error);
      throw new Error(`Rollback failed: ${migrationId} - ${error.message}`);
    }
  }

  /**
   * Create a new migration file
   */
  async createMigration(name: string): Promise<string> {
    const timestamp = Date.now();
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const migrationId = `${timestamp}_${sanitizedName}`;
    
    const upPath = path.join(this.migrationsPath, `${migrationId}.up.sql`);
    const downPath = path.join(this.migrationsPath, `${migrationId}.down.sql`);

    const upTemplate = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Add your migration SQL here

`;

    const downTemplate = `-- Rollback: ${name}
-- Created: ${new Date().toISOString()}

-- Add your rollback SQL here

`;

    await fs.writeFile(upPath, upTemplate);
    await fs.writeFile(downPath, downTemplate);

    console.log(`Created migration files:`);
    console.log(`  Up:   ${upPath}`);
    console.log(`  Down: ${downPath}`);

    return migrationId;
  }

  /**
   * Verify migration integrity
   */
  async verifyMigrations(): Promise<boolean> {
    const available = await this.getAvailableMigrations();
    const applied = await this.getAppliedMigrations();

    for (const migrationId of applied) {
      const migration = available.find(m => m.id === migrationId);
      if (!migration) {
        console.error(`Applied migration not found in filesystem: ${migrationId}`);
        return false;
      }

      const result = await this.db.query(`
        SELECT checksum FROM migrations WHERE id = $1
      `, [migrationId]);

      if (result.length === 0) {
        console.error(`Migration record not found: ${migrationId}`);
        return false;
      }

      const storedChecksum = result[0].checksum;
      const currentChecksum = this.calculateChecksum(migration.upSql);

      if (storedChecksum !== currentChecksum) {
        console.error(`Migration checksum mismatch: ${migrationId}`);
        return false;
      }
    }

    console.log('All migrations verified successfully');
    return true;
  }

  /**
   * Calculate checksum for migration content
   */
  private calculateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}