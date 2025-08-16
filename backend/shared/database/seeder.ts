import { SQLDatabase } from "encore.dev/storage/sqldb";
import * as fs from 'fs/promises';
import * as path from 'path';

export interface SeedData {
  table: string;
  data: Record<string, any>[];
  dependencies?: string[];
}

export interface SeedConfig {
  environment: 'development' | 'testing' | 'staging';
  truncateFirst?: boolean;
  skipExisting?: boolean;
}

export class DatabaseSeeder {
  private db: SQLDatabase;
  private seedsPath: string;

  constructor(db: SQLDatabase, seedsPath: string) {
    this.db = db;
    this.seedsPath = seedsPath;
  }

  /**
   * Run all seeds for the specified environment
   */
  async runSeeds(config: SeedConfig): Promise<void> {
    console.log(`Running seeds for ${config.environment} environment...`);

    const seedFiles = await this.getSeedFiles(config.environment);
    
    if (seedFiles.length === 0) {
      console.log('No seed files found');
      return;
    }

    // Sort seeds by dependencies
    const sortedSeeds = this.sortSeedsByDependencies(seedFiles);

    for (const seedFile of sortedSeeds) {
      try {
        console.log(`Running seed: ${seedFile.table}`);
        await this.runSeed(seedFile, config);
        console.log(`✓ Completed seed: ${seedFile.table}`);
      } catch (error) {
        console.error(`✗ Failed to run seed ${seedFile.table}:`, error);
        throw error;
      }
    }

    console.log('All seeds completed successfully');
  }

  /**
   * Run a specific seed
   */
  private async runSeed(seedData: SeedData, config: SeedConfig): Promise<void> {
    const { table, data } = seedData;

    if (data.length === 0) {
      console.log(`No data to seed for table: ${table}`);
      return;
    }

    // Truncate table if requested
    if (config.truncateFirst) {
      await this.db.exec(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
    }

    // Get existing records if skipExisting is true
    let existingIds: Set<any> = new Set();
    if (config.skipExisting) {
      const existing = await this.db.query(`SELECT id FROM ${table}`);
      existingIds = new Set(existing.map(row => row.id));
    }

    // Insert data
    for (const record of data) {
      if (config.skipExisting && record.id && existingIds.has(record.id)) {
        continue;
      }

      const columns = Object.keys(record);
      const values = Object.values(record);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

      const query = `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES (${placeholders})
        ON CONFLICT (id) DO NOTHING
      `;

      await this.db.exec(query, values);
    }
  }

  /**
   * Get seed files for the specified environment
   */
  private async getSeedFiles(environment: string): Promise<SeedData[]> {
    const seedFiles: SeedData[] = [];
    
    try {
      const envPath = path.join(this.seedsPath, environment);
      const files = await fs.readdir(envPath);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(envPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const seedData: SeedData = JSON.parse(content);
          seedFiles.push(seedData);
        }
      }
    } catch (error) {
      console.warn(`No seed files found for environment: ${environment}`);
    }

    return seedFiles;
  }

  /**
   * Sort seeds by their dependencies
   */
  private sortSeedsByDependencies(seeds: SeedData[]): SeedData[] {
    const sorted: SeedData[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (seed: SeedData) => {
      if (visiting.has(seed.table)) {
        throw new Error(`Circular dependency detected involving table: ${seed.table}`);
      }
      
      if (visited.has(seed.table)) {
        return;
      }

      visiting.add(seed.table);

      // Visit dependencies first
      if (seed.dependencies) {
        for (const dep of seed.dependencies) {
          const depSeed = seeds.find(s => s.table === dep);
          if (depSeed) {
            visit(depSeed);
          }
        }
      }

      visiting.delete(seed.table);
      visited.add(seed.table);
      sorted.push(seed);
    };

    for (const seed of seeds) {
      visit(seed);
    }

    return sorted;
  }

  /**
   * Create seed template for a table
   */
  async createSeedTemplate(tableName: string, environment: string): Promise<string> {
    const envPath = path.join(this.seedsPath, environment);
    
    // Ensure directory exists
    await fs.mkdir(envPath, { recursive: true });

    const seedPath = path.join(envPath, `${tableName}.json`);
    
    const template: SeedData = {
      table: tableName,
      data: [
        {
          // Add sample data structure here
          id: 1,
          // Add other fields as needed
        }
      ],
      dependencies: []
    };

    await fs.writeFile(seedPath, JSON.stringify(template, null, 2));
    
    console.log(`Created seed template: ${seedPath}`);
    return seedPath;
  }

  /**
   * Clear all data from tables (useful for testing)
   */
  async clearAllData(tables: string[]): Promise<void> {
    console.log('Clearing all data from tables...');
    
    // Disable foreign key checks temporarily
    await this.db.exec('SET session_replication_role = replica');
    
    try {
      for (const table of tables) {
        await this.db.exec(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
        console.log(`✓ Cleared table: ${table}`);
      }
    } finally {
      // Re-enable foreign key checks
      await this.db.exec('SET session_replication_role = DEFAULT');
    }
    
    console.log('All tables cleared successfully');
  }

  /**
   * Generate seed data from existing database
   */
  async generateSeedsFromDatabase(tables: string[], environment: string): Promise<void> {
    const envPath = path.join(this.seedsPath, environment);
    await fs.mkdir(envPath, { recursive: true });

    for (const table of tables) {
      try {
        const data = await this.db.query(`SELECT * FROM ${table} ORDER BY id`);
        
        const seedData: SeedData = {
          table,
          data,
          dependencies: []
        };

        const seedPath = path.join(envPath, `${table}.json`);
        await fs.writeFile(seedPath, JSON.stringify(seedData, null, 2));
        
        console.log(`✓ Generated seed for table: ${table} (${data.length} records)`);
      } catch (error) {
        console.error(`✗ Failed to generate seed for table ${table}:`, error);
      }
    }
  }
}