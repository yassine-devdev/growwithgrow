/**
 * Unit tests for BackupManager
 * Tests backup creation, restoration, and management functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BackupManager, BackupConfig } from '@backend/shared/database/backup-manager';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import * as fs from 'fs/promises';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('encore.dev/storage/sqldb');

describe('BackupManager', () => {
  let backupManager: BackupManager;
  let mockConfig: BackupConfig;
  let mockDatabases: Map<string, SQLDatabase>;
  let mockDb: SQLDatabase;

  beforeEach(() => {
    // Setup mock database
    mockDb = {
      query: vi.fn(),
      exec: vi.fn()
    } as any;

    mockDatabases = new Map([
      ['main', mockDb],
      ['analytics', mockDb]
    ]);

    mockConfig = {
      backupPath: '/tmp/backups',
      retentionDays: 30,
      compressionEnabled: false,
      encryptionEnabled: false
    };

    backupManager = new BackupManager(mockConfig, mockDatabases);

    // Mock file system operations
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('mock file content');
    vi.mocked(fs.stat).mockResolvedValue({ size: 1024 } as any);
    vi.mocked(fs.access).mockResolvedValue(undefined);
  });

  describe('createFullBackup', () => {
    it('should create a full backup successfully', async () => {
      // Mock database queries
      vi.mocked(mockDb.query).mockResolvedValue([
        { table_name: 'users' },
        { table_name: 'schools' }
      ]);

      const result = await backupManager.createFullBackup();

      expect(result).toMatchObject({
        status: 'completed',
        databases: ['main', 'analytics'],
        compressed: false,
        encrypted: false,
        size: 1024
      });

      expect(result.id).toMatch(/^backup_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
      expect(result.checksum).toBeDefined();
      expect(result.location).toContain('/tmp/backups');
    });

    it('should handle backup creation errors', async () => {
      // Mock database error
      vi.mocked(mockDb.query).mockRejectedValue(new Error('Database connection failed'));

      await expect(backupManager.createFullBackup()).rejects.toThrow('Database connection failed');
    });

    it('should create compressed backup when enabled', async () => {
      mockConfig.compressionEnabled = true;
      backupManager = new BackupManager(mockConfig, mockDatabases);

      // Mock spawn for gzip
      const mockSpawn = vi.fn().mockReturnValue({
        stdout: { pipe: vi.fn() },
        on: vi.fn().mockImplementation((event, callback) => {
          if (event === 'close') {
            callback(0); // Success exit code
          }
        })
      });
      vi.doMock('child_process', () => ({ spawn: mockSpawn }));

      vi.mocked(mockDb.query).mockResolvedValue([]);

      const result = await backupManager.createFullBackup();

      expect(result.compressed).toBe(true);
      expect(result.location).toContain('.gz');
    });

    it('should create encrypted backup when enabled', async () => {
      mockConfig.encryptionEnabled = true;
      mockConfig.encryptionKey = 'test-encryption-key-32-chars-long';
      backupManager = new BackupManager(mockConfig, mockDatabases);

      vi.mocked(mockDb.query).mockResolvedValue([]);

      const result = await backupManager.createFullBackup();

      expect(result.encrypted).toBe(true);
      expect(result.location).toContain('.enc');
    });
  });

  describe('createSelectiveBackup', () => {
    it('should create backup for selected databases', async () => {
      vi.mocked(mockDb.query).mockResolvedValue([
        { table_name: 'users' }
      ]);

      const result = await backupManager.createSelectiveBackup(['main']);

      expect(result.databases).toEqual(['main']);
      expect(result.status).toBe('completed');
    });

    it('should reject unknown database names', async () => {
      await expect(
        backupManager.createSelectiveBackup(['unknown'])
      ).rejects.toThrow('Database not found: unknown');
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore from backup successfully', async () => {
      // Mock backup metadata
      const mockMetadata = {
        id: 'test-backup-123',
        status: 'completed',
        location: '/tmp/backups/test-backup-123.sql',
        compressed: false,
        encrypted: false,
        checksum: 'mock-checksum'
      };

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(mockMetadata)) // metadata file
        .mockResolvedValueOnce('-- SQL backup content'); // backup file

      await expect(
        backupManager.restoreFromBackup({ backupId: 'test-backup-123' })
      ).resolves.not.toThrow();
    });

    it('should reject restore from non-existent backup', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      await expect(
        backupManager.restoreFromBackup({ backupId: 'non-existent' })
      ).rejects.toThrow('Backup not found: non-existent');
    });

    it('should reject restore from incomplete backup', async () => {
      const mockMetadata = {
        id: 'test-backup-123',
        status: 'failed',
        location: '/tmp/backups/test-backup-123.sql'
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockMetadata));

      await expect(
        backupManager.restoreFromBackup({ backupId: 'test-backup-123' })
      ).rejects.toThrow('Backup is not in completed state: failed');
    });
  });

  describe('listBackups', () => {
    it('should list available backups', async () => {
      const mockBackups = [
        {
          id: 'backup-1',
          timestamp: new Date('2024-01-01'),
          status: 'completed'
        },
        {
          id: 'backup-2',
          timestamp: new Date('2024-01-02'),
          status: 'completed'
        }
      ];

      vi.mocked(fs.readdir).mockResolvedValue(['backup-1.json', 'backup-2.json'] as any);
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(mockBackups[0]))
        .mockResolvedValueOnce(JSON.stringify(mockBackups[1]));

      const result = await backupManager.listBackups();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('backup-2'); // Should be sorted by timestamp desc
      expect(result[1].id).toBe('backup-1');
    });

    it('should return empty array when no backups exist', async () => {
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Directory not found'));

      const result = await backupManager.listBackups();

      expect(result).toEqual([]);
    });
  });

  describe('verifyBackup', () => {
    it('should verify backup integrity successfully', async () => {
      const mockMetadata = {
        id: 'test-backup',
        location: '/tmp/backups/test-backup.sql',
        size: 1024,
        checksum: 'expected-checksum',
        compressed: false,
        encrypted: false
      };

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(mockMetadata))
        .mockResolvedValueOnce('backup content');

      // Mock crypto for checksum calculation
      const mockCrypto = {
        createHash: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnThis(),
          digest: vi.fn().mockReturnValue('expected-checksum')
        })
      };
      vi.doMock('crypto', () => mockCrypto);

      const result = await backupManager.verifyBackup('test-backup');

      expect(result).toBe(true);
    });

    it('should fail verification for corrupted backup', async () => {
      const mockMetadata = {
        id: 'test-backup',
        location: '/tmp/backups/test-backup.sql',
        size: 1024,
        checksum: 'expected-checksum',
        compressed: false,
        encrypted: false
      };

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(mockMetadata))
        .mockResolvedValueOnce('corrupted content');

      // Mock crypto for different checksum
      const mockCrypto = {
        createHash: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnThis(),
          digest: vi.fn().mockReturnValue('different-checksum')
        })
      };
      vi.doMock('crypto', () => mockCrypto);

      const result = await backupManager.verifyBackup('test-backup');

      expect(result).toBe(false);
    });
  });

  describe('cleanupOldBackups', () => {
    it('should clean up old backups', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35); // 35 days old

      const mockBackups = [
        {
          id: 'old-backup',
          timestamp: oldDate,
          location: '/tmp/backups/old-backup.sql',
          size: 1024
        },
        {
          id: 'recent-backup',
          timestamp: new Date(),
          location: '/tmp/backups/recent-backup.sql',
          size: 2048
        }
      ];

      vi.mocked(fs.readdir).mockResolvedValue(['old-backup.json', 'recent-backup.json'] as any);
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(mockBackups[0]))
        .mockResolvedValueOnce(JSON.stringify(mockBackups[1]));
      vi.mocked(fs.unlink).mockResolvedValue(undefined);

      await backupManager.cleanupOldBackups();

      // Should delete old backup but not recent one
      expect(fs.unlink).toHaveBeenCalledWith('/tmp/backups/old-backup.sql');
      expect(fs.unlink).toHaveBeenCalledWith('/tmp/backups/metadata/old-backup.json');
      expect(fs.unlink).not.toHaveBeenCalledWith('/tmp/backups/recent-backup.sql');
    });
  });

  describe('createPointInTimeBackup', () => {
    it('should create point-in-time backup', async () => {
      const targetTime = new Date('2024-01-01T12:00:00Z');
      vi.mocked(mockDb.query).mockResolvedValue([]);

      const result = await backupManager.createPointInTimeBackup(targetTime);

      expect(result.id).toContain('_pit');
      expect((result as any).pointInTime).toEqual(targetTime);
    });
  });
});