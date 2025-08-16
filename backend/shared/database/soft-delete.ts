/**
 * Soft Delete Utility Functions
 * Provides consistent soft delete functionality across all database models
 */

import { SQLDatabase } from 'encore.dev/storage/sqldb';

export interface SoftDeleteOptions {
  deletedBy?: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RestoreOptions {
  restoredBy?: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export class SoftDeleteManager {
  constructor(private db: SQLDatabase) {}

  /**
   * Soft delete a record by setting deleted_at timestamp
   */
  async softDelete(
    table: string,
    id: number,
    options: SoftDeleteOptions = {}
  ): Promise<void> {
    const { deletedBy, reason, metadata = {} } = options;
    
    // Add deletion metadata
    const deletionMetadata = {
      ...metadata,
      deletedBy,
      deletionReason: reason,
      deletedAt: new Date().toISOString(),
    };

    await this.db.exec`
      UPDATE ${this.db.raw(table)}
      SET 
        deleted_at = NOW(),
        metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify(deletionMetadata)}::jsonb,
        updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
    `;

    // Log the soft delete action
    if (deletedBy) {
      await this.logAuditAction(deletedBy, 'soft_delete', table, id, {
        reason,
        metadata: deletionMetadata,
      });
    }
  }

  /**
   * Restore a soft-deleted record
   */
  async restore(
    table: string,
    id: number,
    options: RestoreOptions = {}
  ): Promise<void> {
    const { restoredBy, reason, metadata = {} } = options;
    
    // Add restoration metadata
    const restorationMetadata = {
      ...metadata,
      restoredBy,
      restorationReason: reason,
      restoredAt: new Date().toISOString(),
    };

    await this.db.exec`
      UPDATE ${this.db.raw(table)}
      SET 
        deleted_at = NULL,
        metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify(restorationMetadata)}::jsonb,
        updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NOT NULL
    `;

    // Log the restore action
    if (restoredBy) {
      await this.logAuditAction(restoredBy, 'restore', table, id, {
        reason,
        metadata: restorationMetadata,
      });
    }
  }

  /**
   * Permanently delete soft-deleted records older than specified days
   */
  async permanentlyDelete(
    table: string,
    olderThanDays: number = 30
  ): Promise<number> {
    const result = await this.db.exec`
      DELETE FROM ${this.db.raw(table)}
      WHERE deleted_at IS NOT NULL 
        AND deleted_at < NOW() - INTERVAL '${olderThanDays} days'
    `;

    return result.rowCount || 0;
  }

  /**
   * Get soft-deleted records for a table
   */
  async getSoftDeleted(
    table: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    const result = await this.db.query`
      SELECT * FROM ${this.db.raw(table)}
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return result.rows;
  }

  /**
   * Check if a record is soft-deleted
   */
  async isSoftDeleted(table: string, id: number): Promise<boolean> {
    const result = await this.db.query`
      SELECT deleted_at FROM ${this.db.raw(table)}
      WHERE id = ${id}
    `;

    return result.rows.length > 0 && result.rows[0].deleted_at !== null;
  }

  /**
   * Bulk soft delete multiple records
   */
  async bulkSoftDelete(
    table: string,
    ids: number[],
    options: SoftDeleteOptions = {}
  ): Promise<void> {
    if (ids.length === 0) return;

    const { deletedBy, reason, metadata = {} } = options;
    
    const deletionMetadata = {
      ...metadata,
      deletedBy,
      deletionReason: reason,
      deletedAt: new Date().toISOString(),
      bulkOperation: true,
    };

    await this.db.exec`
      UPDATE ${this.db.raw(table)}
      SET 
        deleted_at = NOW(),
        metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify(deletionMetadata)}::jsonb,
        updated_at = NOW()
      WHERE id = ANY(${ids}) AND deleted_at IS NULL
    `;

    // Log bulk delete action
    if (deletedBy) {
      await this.logAuditAction(deletedBy, 'bulk_soft_delete', table, null, {
        reason,
        affectedIds: ids,
        metadata: deletionMetadata,
      });
    }
  }

  /**
   * Get statistics about soft-deleted records
   */
  async getSoftDeleteStats(table: string): Promise<{
    total: number;
    softDeleted: number;
    active: number;
    deletionRate: number;
  }> {
    const result = await this.db.query`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as soft_deleted,
        COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active
      FROM ${this.db.raw(table)}
    `;

    const stats = result.rows[0];
    const total = parseInt(stats.total);
    const softDeleted = parseInt(stats.soft_deleted);
    const active = parseInt(stats.active);
    const deletionRate = total > 0 ? (softDeleted / total) * 100 : 0;

    return {
      total,
      softDeleted,
      active,
      deletionRate: Math.round(deletionRate * 100) / 100,
    };
  }

  /**
   * Clean up old soft-deleted records across all tables
   */
  async cleanupOldSoftDeleted(olderThanDays: number = 90): Promise<{
    [table: string]: number;
  }> {
    const tables = [
      'users', 'schools', 'courses', 'classes', 'assignments', 'enrollments',
      'submissions', 'contacts', 'deals', 'campaigns', 'notifications',
      'marketplace_categories', 'marketplace_products', 'marketplace_orders',
      'marketplace_reviews', 'support_tickets'
    ];

    const results: { [table: string]: number } = {};

    for (const table of tables) {
      try {
        const deletedCount = await this.permanentlyDelete(table, olderThanDays);
        results[table] = deletedCount;
      } catch (error) {
        console.error(`Error cleaning up ${table}:`, error);
        results[table] = 0;
      }
    }

    return results;
  }

  /**
   * Log audit action for soft delete operations
   */
  private async logAuditAction(
    userId: number,
    action: string,
    resourceType: string,
    resourceId: number | null,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      await this.db.exec`
        INSERT INTO audit_logs (
          user_id, action, resource_type, resource_id, 
          new_values, metadata, created_at
        ) VALUES (
          ${userId}, ${action}, ${resourceType}, ${resourceId},
          ${JSON.stringify(metadata)}, ${JSON.stringify(metadata)}, NOW()
        )
      `;
    } catch (error) {
      console.error('Failed to log audit action:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }
}

/**
 * Query builder helper for filtering out soft-deleted records
 */
export class SoftDeleteQueryBuilder {
  /**
   * Add WHERE clause to exclude soft-deleted records
   */
  static excludeDeleted(baseQuery: string): string {
    if (baseQuery.toLowerCase().includes('where')) {
      return `${baseQuery} AND deleted_at IS NULL`;
    } else {
      return `${baseQuery} WHERE deleted_at IS NULL`;
    }
  }

  /**
   * Add WHERE clause to include only soft-deleted records
   */
  static onlyDeleted(baseQuery: string): string {
    if (baseQuery.toLowerCase().includes('where')) {
      return `${baseQuery} AND deleted_at IS NOT NULL`;
    } else {
      return `${baseQuery} WHERE deleted_at IS NOT NULL`;
    }
  }

  /**
   * Add WHERE clause to include all records (active and soft-deleted)
   */
  static includeAll(baseQuery: string): string {
    return baseQuery; // No additional filtering
  }
}

/**
 * Decorator for automatic soft delete functionality
 */
export function withSoftDelete<T extends { new(...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    softDeleteManager?: SoftDeleteManager;

    initSoftDelete(db: SQLDatabase) {
      this.softDeleteManager = new SoftDeleteManager(db);
    }
  };
}

export default SoftDeleteManager;