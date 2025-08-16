/**
 * Database integrity checker
 * Validates data consistency and referential integrity
 */

import { SQLDatabase } from 'encore.dev/storage/sqldb';

export interface IntegrityCheckResult {
  table: string;
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  affectedRows?: number;
  details?: any[];
}

export interface IntegrityCheckSummary {
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  results: IntegrityCheckResult[];
}

export class DatabaseIntegrityChecker {
  constructor(private db: SQLDatabase) {}

  /**
   * Run all integrity checks
   */
  async runAllChecks(): Promise<IntegrityCheckSummary> {
    const results: IntegrityCheckResult[] = [];

    // Foreign key constraint checks
    results.push(...await this.checkForeignKeyConstraints());
    
    // Orphaned record checks
    results.push(...await this.checkOrphanedRecords());
    
    // Data consistency checks
    results.push(...await this.checkDataConsistency());
    
    // Business rule checks
    results.push(...await this.checkBusinessRules());
    
    // Index integrity checks
    results.push(...await this.checkIndexIntegrity());

    const summary: IntegrityCheckSummary = {
      totalChecks: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      warnings: results.filter(r => r.status === 'warning').length,
      results
    };

    return summary;
  }

  /**
   * Check foreign key constraints
   */
  private async checkForeignKeyConstraints(): Promise<IntegrityCheckResult[]> {
    const results: IntegrityCheckResult[] = [];

    try {
      // Get all foreign key constraints
      const constraints = await this.db.query(`
        SELECT 
          tc.table_name,
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      `);

      for (const constraint of constraints) {
        const violations = await this.db.query(`
          SELECT COUNT(*) as count
          FROM ${constraint.table_name} t
          WHERE t.${constraint.column_name} IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM ${constraint.foreign_table_name} f
            WHERE f.${constraint.foreign_column_name} = t.${constraint.column_name}
          )
        `);

        const violationCount = parseInt(violations[0].count);

        results.push({
          table: constraint.table_name,
          check: `Foreign Key: ${constraint.constraint_name}`,
          status: violationCount === 0 ? 'pass' : 'fail',
          message: violationCount === 0 
            ? 'No foreign key violations found'
            : `Found ${violationCount} foreign key violations`,
          affectedRows: violationCount
        });
      }
    } catch (error) {
      results.push({
        table: 'system',
        check: 'Foreign Key Constraints',
        status: 'fail',
        message: `Error checking foreign key constraints: ${error.message}`
      });
    }

    return results;
  }

  /**
   * Check for orphaned records
   */
  private async checkOrphanedRecords(): Promise<IntegrityCheckResult[]> {
    const results: IntegrityCheckResult[] = [];

    const orphanChecks = [
      {
        table: 'courses',
        parentTable: 'schools',
        foreignKey: 'school_id',
        parentKey: 'id'
      },
      {
        table: 'classes',
        parentTable: 'courses',
        foreignKey: 'course_id',
        parentKey: 'id'
      },
      {
        table: 'assignments',
        parentTable: 'classes',
        foreignKey: 'class_id',
        parentKey: 'id'
      },
      {
        table: 'enrollments',
        parentTable: 'users',
        foreignKey: 'student_id',
        parentKey: 'id'
      },
      {
        table: 'enrollments',
        parentTable: 'classes',
        foreignKey: 'class_id',
        parentKey: 'id'
      },
      {
        table: 'submissions',
        parentTable: 'assignments',
        foreignKey: 'assignment_id',
        parentKey: 'id'
      },
      {
        table: 'submissions',
        parentTable: 'users',
        foreignKey: 'student_id',
        parentKey: 'id'
      },
      {
        table: 'ai_usage',
        parentTable: 'users',
        foreignKey: 'user_id',
        parentKey: 'id'
      },
      {
        table: 'deals',
        parentTable: 'contacts',
        foreignKey: 'contact_id',
        parentKey: 'id'
      }
    ];

    for (const check of orphanChecks) {
      try {
        const orphans = await this.db.query(`
          SELECT COUNT(*) as count
          FROM ${check.table} c
          WHERE c.${check.foreignKey} IS NOT NULL
          AND c.deleted_at IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM ${check.parentTable} p
            WHERE p.${check.parentKey} = c.${check.foreignKey}
            AND p.deleted_at IS NULL
          )
        `);

        const orphanCount = parseInt(orphans[0].count);

        results.push({
          table: check.table,
          check: `Orphaned Records: ${check.foreignKey}`,
          status: orphanCount === 0 ? 'pass' : 'fail',
          message: orphanCount === 0
            ? 'No orphaned records found'
            : `Found ${orphanCount} orphaned records`,
          affectedRows: orphanCount
        });
      } catch (error) {
        results.push({
          table: check.table,
          check: `Orphaned Records: ${check.foreignKey}`,
          status: 'fail',
          message: `Error checking orphaned records: ${error.message}`
        });
      }
    }

    return results;
  }

  /**
   * Check data consistency
   */
  private async checkDataConsistency(): Promise<IntegrityCheckResult[]> {
    const results: IntegrityCheckResult[] = [];

    // Check email uniqueness across users
    try {
      const duplicateEmails = await this.db.query(`
        SELECT email, COUNT(*) as count
        FROM users
        WHERE deleted_at IS NULL
        GROUP BY email
        HAVING COUNT(*) > 1
      `);

      results.push({
        table: 'users',
        check: 'Email Uniqueness',
        status: duplicateEmails.length === 0 ? 'pass' : 'fail',
        message: duplicateEmails.length === 0
          ? 'All emails are unique'
          : `Found ${duplicateEmails.length} duplicate emails`,
        affectedRows: duplicateEmails.length,
        details: duplicateEmails
      });
    } catch (error) {
      results.push({
        table: 'users',
        check: 'Email Uniqueness',
        status: 'fail',
        message: `Error checking email uniqueness: ${error.message}`
      });
    }

    // Check enrollment consistency
    try {
      const invalidEnrollments = await this.db.query(`
        SELECT e.id, e.student_id, e.class_id
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        WHERE e.deleted_at IS NULL
        AND u.role != 'student'
      `);

      results.push({
        table: 'enrollments',
        check: 'Student Role Consistency',
        status: invalidEnrollments.length === 0 ? 'pass' : 'fail',
        message: invalidEnrollments.length === 0
          ? 'All enrollments have valid student roles'
          : `Found ${invalidEnrollments.length} enrollments with non-student users`,
        affectedRows: invalidEnrollments.length,
        details: invalidEnrollments
      });
    } catch (error) {
      results.push({
        table: 'enrollments',
        check: 'Student Role Consistency',
        status: 'fail',
        message: `Error checking enrollment consistency: ${error.message}`
      });
    }

    // Check assignment due dates
    try {
      const pastDueDrafts = await this.db.query(`
        SELECT id, title, due_date, status
        FROM assignments
        WHERE status = 'draft'
        AND due_date < NOW()
        AND deleted_at IS NULL
      `);

      results.push({
        table: 'assignments',
        check: 'Due Date Consistency',
        status: pastDueDrafts.length === 0 ? 'pass' : 'warning',
        message: pastDueDrafts.length === 0
          ? 'No draft assignments with past due dates'
          : `Found ${pastDueDrafts.length} draft assignments with past due dates`,
        affectedRows: pastDueDrafts.length,
        details: pastDueDrafts
      });
    } catch (error) {
      results.push({
        table: 'assignments',
        check: 'Due Date Consistency',
        status: 'fail',
        message: `Error checking due date consistency: ${error.message}`
      });
    }

    // Check AI usage cost consistency
    try {
      const invalidCosts = await this.db.query(`
        SELECT id, provider, cost, tokens_used
        FROM ai_usage
        WHERE (provider = 'ollama' AND cost > 0)
        OR (cost < 0)
        OR (tokens_used <= 0)
      `);

      results.push({
        table: 'ai_usage',
        check: 'AI Cost Consistency',
        status: invalidCosts.length === 0 ? 'pass' : 'fail',
        message: invalidCosts.length === 0
          ? 'All AI usage costs are consistent'
          : `Found ${invalidCosts.length} records with invalid costs`,
        affectedRows: invalidCosts.length,
        details: invalidCosts
      });
    } catch (error) {
      results.push({
        table: 'ai_usage',
        check: 'AI Cost Consistency',
        status: 'fail',
        message: `Error checking AI cost consistency: ${error.message}`
      });
    }

    return results;
  }

  /**
   * Check business rules
   */
  private async checkBusinessRules(): Promise<IntegrityCheckResult[]> {
    const results: IntegrityCheckResult[] = [];

    // Check admin users have MFA enabled
    try {
      const adminsWithoutMFA = await this.db.query(`
        SELECT id, email, role
        FROM users
        WHERE role IN ('admin', 'super_admin')
        AND (mfa_enabled = false OR mfa_enabled IS NULL)
        AND deleted_at IS NULL
      `);

      results.push({
        table: 'users',
        check: 'Admin MFA Requirement',
        status: adminsWithoutMFA.length === 0 ? 'pass' : 'warning',
        message: adminsWithoutMFA.length === 0
          ? 'All admin users have MFA enabled'
          : `Found ${adminsWithoutMFA.length} admin users without MFA`,
        affectedRows: adminsWithoutMFA.length,
        details: adminsWithoutMFA
      });
    } catch (error) {
      results.push({
        table: 'users',
        check: 'Admin MFA Requirement',
        status: 'fail',
        message: `Error checking admin MFA requirement: ${error.message}`
      });
    }

    // Check school principals are valid users
    try {
      const invalidPrincipals = await this.db.query(`
        SELECT s.id, s.name, s.principal_id, u.role
        FROM schools s
        LEFT JOIN users u ON s.principal_id = u.id
        WHERE s.principal_id IS NOT NULL
        AND s.deleted_at IS NULL
        AND (u.id IS NULL OR u.role NOT IN ('principal', 'admin', 'super_admin'))
      `);

      results.push({
        table: 'schools',
        check: 'Principal Role Validation',
        status: invalidPrincipals.length === 0 ? 'pass' : 'fail',
        message: invalidPrincipals.length === 0
          ? 'All school principals have valid roles'
          : `Found ${invalidPrincipals.length} schools with invalid principals`,
        affectedRows: invalidPrincipals.length,
        details: invalidPrincipals
      });
    } catch (error) {
      results.push({
        table: 'schools',
        check: 'Principal Role Validation',
        status: 'fail',
        message: `Error checking principal role validation: ${error.message}`
      });
    }

    // Check submission dates are logical
    try {
      const invalidSubmissions = await this.db.query(`
        SELECT s.id, s.assignment_id, s.submitted_at, a.due_date
        FROM submissions s
        JOIN assignments a ON s.assignment_id = a.id
        WHERE s.submitted_at > a.due_date + INTERVAL '30 days'
        AND s.deleted_at IS NULL
      `);

      results.push({
        table: 'submissions',
        check: 'Submission Date Logic',
        status: invalidSubmissions.length === 0 ? 'pass' : 'warning',
        message: invalidSubmissions.length === 0
          ? 'All submission dates are logical'
          : `Found ${invalidSubmissions.length} submissions more than 30 days after due date`,
        affectedRows: invalidSubmissions.length,
        details: invalidSubmissions
      });
    } catch (error) {
      results.push({
        table: 'submissions',
        check: 'Submission Date Logic',
        status: 'fail',
        message: `Error checking submission date logic: ${error.message}`
      });
    }

    return results;
  }

  /**
   * Check index integrity
   */
  private async checkIndexIntegrity(): Promise<IntegrityCheckResult[]> {
    const results: IntegrityCheckResult[] = [];

    try {
      // Check for missing indexes on foreign keys
      const missingIndexes = await this.db.query(`
        SELECT 
          tc.table_name,
          kcu.column_name,
          tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND NOT EXISTS (
          SELECT 1 FROM pg_indexes pi
          WHERE pi.tablename = tc.table_name
          AND pi.indexdef LIKE '%' || kcu.column_name || '%'
        )
      `);

      results.push({
        table: 'system',
        check: 'Foreign Key Indexes',
        status: missingIndexes.length === 0 ? 'pass' : 'warning',
        message: missingIndexes.length === 0
          ? 'All foreign keys have indexes'
          : `Found ${missingIndexes.length} foreign keys without indexes`,
        affectedRows: missingIndexes.length,
        details: missingIndexes
      });
    } catch (error) {
      results.push({
        table: 'system',
        check: 'Foreign Key Indexes',
        status: 'fail',
        message: `Error checking index integrity: ${error.message}`
      });
    }

    return results;
  }

  /**
   * Fix common integrity issues
   */
  async fixIntegrityIssues(dryRun: boolean = true): Promise<{
    fixed: IntegrityCheckResult[];
    errors: IntegrityCheckResult[];
  }> {
    const fixed: IntegrityCheckResult[] = [];
    const errors: IntegrityCheckResult[] = [];

    // Fix orphaned records by soft deleting them
    try {
      const orphanedSubmissions = await this.db.query(`
        SELECT s.id
        FROM submissions s
        WHERE s.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM assignments a
          WHERE a.id = s.assignment_id
          AND a.deleted_at IS NULL
        )
      `);

      if (orphanedSubmissions.length > 0 && !dryRun) {
        await this.db.exec(`
          UPDATE submissions
          SET deleted_at = NOW(), updated_at = NOW()
          WHERE id IN (${orphanedSubmissions.map(r => r.id).join(',')})
        `);
      }

      fixed.push({
        table: 'submissions',
        check: 'Fix Orphaned Submissions',
        status: 'pass',
        message: `${dryRun ? 'Would fix' : 'Fixed'} ${orphanedSubmissions.length} orphaned submissions`,
        affectedRows: orphanedSubmissions.length
      });
    } catch (error) {
      errors.push({
        table: 'submissions',
        check: 'Fix Orphaned Submissions',
        status: 'fail',
        message: `Error fixing orphaned submissions: ${error.message}`
      });
    }

    // Fix invalid enrollment statuses
    try {
      const invalidEnrollments = await this.db.query(`
        SELECT e.id
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        WHERE e.deleted_at IS NULL
        AND u.role != 'student'
        AND e.status = 'active'
      `);

      if (invalidEnrollments.length > 0 && !dryRun) {
        await this.db.exec(`
          UPDATE enrollments
          SET status = 'suspended', updated_at = NOW()
          WHERE id IN (${invalidEnrollments.map(r => r.id).join(',')})
        `);
      }

      fixed.push({
        table: 'enrollments',
        check: 'Fix Invalid Enrollments',
        status: 'pass',
        message: `${dryRun ? 'Would fix' : 'Fixed'} ${invalidEnrollments.length} invalid enrollments`,
        affectedRows: invalidEnrollments.length
      });
    } catch (error) {
      errors.push({
        table: 'enrollments',
        check: 'Fix Invalid Enrollments',
        status: 'fail',
        message: `Error fixing invalid enrollments: ${error.message}`
      });
    }

    return { fixed, errors };
  }

  /**
   * Generate integrity report
   */
  async generateReport(): Promise<string> {
    const summary = await this.runAllChecks();
    
    let report = `# Database Integrity Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `- **Total Checks:** ${summary.totalChecks}\n`;
    report += `- **Passed:** ${summary.passed}\n`;
    report += `- **Failed:** ${summary.failed}\n`;
    report += `- **Warnings:** ${summary.warnings}\n\n`;

    if (summary.failed > 0) {
      report += `## Failed Checks\n\n`;
      summary.results
        .filter(r => r.status === 'fail')
        .forEach(result => {
          report += `### ${result.table} - ${result.check}\n`;
          report += `**Status:** ❌ FAILED\n`;
          report += `**Message:** ${result.message}\n`;
          if (result.affectedRows) {
            report += `**Affected Rows:** ${result.affectedRows}\n`;
          }
          report += `\n`;
        });
    }

    if (summary.warnings > 0) {
      report += `## Warnings\n\n`;
      summary.results
        .filter(r => r.status === 'warning')
        .forEach(result => {
          report += `### ${result.table} - ${result.check}\n`;
          report += `**Status:** ⚠️ WARNING\n`;
          report += `**Message:** ${result.message}\n`;
          if (result.affectedRows) {
            report += `**Affected Rows:** ${result.affectedRows}\n`;
          }
          report += `\n`;
        });
    }

    report += `## All Checks\n\n`;
    summary.results.forEach(result => {
      const statusIcon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      report += `- ${statusIcon} **${result.table}** - ${result.check}: ${result.message}\n`;
    });

    return report;
  }
}

export default DatabaseIntegrityChecker;