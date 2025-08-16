/**
 * Database constraints and data integrity validation
 * Implements comprehensive constraint checking and business rule validation
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';

/**
 * Database constraint definitions
 */
export interface DatabaseConstraint {
  name: string;
  table: string;
  type: 'unique' | 'foreign_key' | 'check' | 'not_null' | 'business_rule';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
  condition?: string;
  errorMessage: string;
}

/**
 * Comprehensive database constraints configuration
 */
export const DatabaseConstraints: DatabaseConstraint[] = [
  // User constraints
  {
    name: 'users_email_unique',
    table: 'users',
    type: 'unique',
    columns: ['email'],
    errorMessage: 'Email address already exists'
  },
  {
    name: 'users_email_not_null',
    table: 'users',
    type: 'not_null',
    columns: ['email'],
    errorMessage: 'Email address is required'
  },
  {
    name: 'users_password_not_null',
    table: 'users',
    type: 'not_null',
    columns: ['password_hash'],
    errorMessage: 'Password is required'
  },
  {
    name: 'users_role_valid',
    table: 'users',
    type: 'check',
    columns: ['role'],
    condition: "role IN ('student', 'teacher', 'admin', 'parent', 'principal', 'super_admin')",
    errorMessage: 'Invalid user role'
  },
  {
    name: 'users_admin_mfa_required',
    table: 'users',
    type: 'business_rule',
    columns: ['role', 'mfa_enabled'],
    condition: "role IN ('admin', 'super_admin') AND mfa_enabled = true",
    errorMessage: 'Multi-factor authentication is required for admin users'
  },

  // School constraints
  {
    name: 'schools_name_not_null',
    table: 'schools',
    type: 'not_null',
    columns: ['name'],
    errorMessage: 'School name is required'
  },
  {
    name: 'schools_principal_fk',
    table: 'schools',
    type: 'foreign_key',
    columns: ['principal_id'],
    referencedTable: 'users',
    referencedColumns: ['id'],
    errorMessage: 'Invalid principal user ID'
  },
  {
    name: 'schools_principal_role_valid',
    table: 'schools',
    type: 'business_rule',
    columns: ['principal_id'],
    condition: "principal_id IS NULL OR EXISTS (SELECT 1 FROM users WHERE id = principal_id AND role IN ('principal', 'admin', 'super_admin'))",
    errorMessage: 'Principal must have appropriate role'
  },

  // Course constraints
  {
    name: 'courses_school_fk',
    table: 'courses',
    type: 'foreign_key',
    columns: ['school_id'],
    referencedTable: 'schools',
    referencedColumns: ['id'],
    errorMessage: 'Invalid school ID'
  },
  {
    name: 'courses_teacher_fk',
    table: 'courses',
    type: 'foreign_key',
    columns: ['teacher_id'],
    referencedTable: 'users',
    referencedColumns: ['id'],
    errorMessage: 'Invalid teacher user ID'
  },
  {
    name: 'courses_name_not_null',
    table: 'courses',
    type: 'not_null',
    columns: ['name'],
    errorMessage: 'Course name is required'
  },
  {
    name: 'courses_teacher_role_valid',
    table: 'courses',
    type: 'business_rule',
    columns: ['teacher_id'],
    condition: "teacher_id IS NULL OR EXISTS (SELECT 1 FROM users WHERE id = teacher_id AND role IN ('teacher', 'admin', 'super_admin'))",
    errorMessage: 'Course teacher must have appropriate role'
  },

  // Class constraints
  {
    name: 'classes_course_fk',
    table: 'classes',
    type: 'foreign_key',
    columns: ['course_id'],
    referencedTable: 'courses',
    referencedColumns: ['id'],
    errorMessage: 'Invalid course ID'
  },
  {
    name: 'classes_teacher_fk',
    table: 'classes',
    type: 'foreign_key',
    columns: ['teacher_id'],
    referencedTable: 'users',
    referencedColumns: ['id'],
    errorMessage: 'Invalid teacher user ID'
  },
  {
    name: 'classes_name_not_null',
    table: 'classes',
    type: 'not_null',
    columns: ['name'],
    errorMessage: 'Class name is required'
  },
  {
    name: 'classes_max_students_positive',
    table: 'classes',
    type: 'check',
    columns: ['max_students'],
    condition: 'max_students > 0',
    errorMessage: 'Maximum students must be greater than 0'
  },

  // Assignment constraints
  {
    name: 'assignments_class_fk',
    table: 'assignments',
    type: 'foreign_key',
    columns: ['class_id'],
    referencedTable: 'classes',
    referencedColumns: ['id'],
    errorMessage: 'Invalid class ID'
  },
  {
    name: 'assignments_title_not_null',
    table: 'assignments',
    type: 'not_null',
    columns: ['title'],
    errorMessage: 'Assignment title is required'
  },
  {
    name: 'assignments_points_positive',
    table: 'assignments',
    type: 'check',
    columns: ['points_possible'],
    condition: 'points_possible > 0',
    errorMessage: 'Points possible must be greater than 0'
  },
  {
    name: 'assignments_status_valid',
    table: 'assignments',
    type: 'check',
    columns: ['status'],
    condition: "status IN ('draft', 'published', 'submitted', 'graded', 'returned')",
    errorMessage: 'Invalid assignment status'
  },
  {
    name: 'assignments_due_date_future',
    table: 'assignments',
    type: 'business_rule',
    columns: ['due_date', 'status'],
    condition: "status = 'draft' OR due_date IS NULL OR due_date >= CURRENT_DATE",
    errorMessage: 'Due date cannot be in the past for published assignments'
  },

  // Enrollment constraints
  {
    name: 'enrollments_student_fk',
    table: 'enrollments',
    type: 'foreign_key',
    columns: ['student_id'],
    referencedTable: 'users',
    referencedColumns: ['id'],
    errorMessage: 'Invalid student user ID'
  },
  {
    name: 'enrollments_class_fk',
    table: 'enrollments',
    type: 'foreign_key',
    columns: ['class_id'],
    referencedTable: 'classes',
    referencedColumns: ['id'],
    errorMessage: 'Invalid class ID'
  },
  {
    name: 'enrollments_unique',
    table: 'enrollments',
    type: 'unique',
    columns: ['student_id', 'class_id'],
    errorMessage: 'Student is already enrolled in this class'
  },
  {
    name: 'enrollments_student_role_valid',
    table: 'enrollments',
    type: 'business_rule',
    columns: ['student_id'],
    condition: "EXISTS (SELECT 1 FROM users WHERE id = student_id AND role = 'student')",
    errorMessage: 'Only students can be enrolled in classes'
  },
  {
    name: 'enrollments_status_valid',
    table: 'enrollments',
    type: 'check',
    columns: ['status'],
    condition: "status IN ('active', 'inactive', 'completed', 'dropped', 'suspended')",
    errorMessage: 'Invalid enrollment status'
  },

  // Submission constraints
  {
    name: 'submissions_assignment_fk',
    table: 'submissions',
    type: 'foreign_key',
    columns: ['assignment_id'],
    referencedTable: 'assignments',
    referencedColumns: ['id'],
    errorMessage: 'Invalid assignment ID'
  },
  {
    name: 'submissions_student_fk',
    table: 'submissions',
    type: 'foreign_key',
    columns: ['student_id'],
    referencedTable: 'users',
    referencedColumns: ['id'],
    errorMessage: 'Invalid student user ID'
  },
  {
    name: 'submissions_unique',
    table: 'submissions',
    type: 'unique',
    columns: ['assignment_id', 'student_id'],
    errorMessage: 'Student has already submitted this assignment'
  },
  {
    name: 'submissions_points_valid',
    table: 'submissions',
    type: 'check',
    columns: ['points_earned'],
    condition: 'points_earned IS NULL OR points_earned >= 0',
    errorMessage: 'Points earned cannot be negative'
  },
  {
    name: 'submissions_student_enrolled',
    table: 'submissions',
    type: 'business_rule',
    columns: ['student_id', 'assignment_id'],
    condition: `EXISTS (
      SELECT 1 FROM enrollments e 
      JOIN assignments a ON e.class_id = a.class_id 
      WHERE e.student_id = student_id AND a.id = assignment_id AND e.status = 'active'
    )`,
    errorMessage: 'Student must be enrolled in the class to submit assignments'
  },

  // AI Usage constraints
  {
    name: 'ai_usage_user_fk',
    table: 'ai_usage',
    type: 'foreign_key',
    columns: ['user_id'],
    referencedTable: 'users',
    referencedColumns: ['id'],
    errorMessage: 'Invalid user ID'
  },
  {
    name: 'ai_usage_school_fk',
    table: 'ai_usage',
    type: 'foreign_key',
    columns: ['school_id'],
    referencedTable: 'schools',
    referencedColumns: ['id'],
    errorMessage: 'Invalid school ID'
  },
  {
    name: 'ai_usage_provider_valid',
    table: 'ai_usage',
    type: 'check',
    columns: ['provider'],
    condition: "provider IN ('openrouter', 'ollama', 'gemini', 'openai', 'anthropic')",
    errorMessage: 'Invalid AI provider'
  },
  {
    name: 'ai_usage_request_type_valid',
    table: 'ai_usage',
    type: 'check',
    columns: ['request_type'],
    condition: "request_type IN ('chat', 'completion', 'embedding', 'image', 'audio')",
    errorMessage: 'Invalid AI request type'
  },
  {
    name: 'ai_usage_tokens_positive',
    table: 'ai_usage',
    type: 'check',
    columns: ['tokens_used'],
    condition: 'tokens_used > 0',
    errorMessage: 'Tokens used must be greater than 0'
  },
  {
    name: 'ai_usage_cost_non_negative',
    table: 'ai_usage',
    type: 'check',
    columns: ['cost'],
    condition: 'cost >= 0',
    errorMessage: 'Cost cannot be negative'
  },
  {
    name: 'ai_usage_ollama_free',
    table: 'ai_usage',
    type: 'business_rule',
    columns: ['provider', 'cost'],
    condition: "provider != 'ollama' OR cost = 0",
    errorMessage: 'Ollama usage should have zero cost'
  },

  // Contact constraints (CRM)
  {
    name: 'contacts_email_unique',
    table: 'contacts',
    type: 'unique',
    columns: ['email'],
    errorMessage: 'Contact email already exists'
  },
  {
    name: 'contacts_email_not_null',
    table: 'contacts',
    type: 'not_null',
    columns: ['email'],
    errorMessage: 'Contact email is required'
  },
  {
    name: 'contacts_first_name_not_null',
    table: 'contacts',
    type: 'not_null',
    columns: ['first_name'],
    errorMessage: 'Contact first name is required'
  },
  {
    name: 'contacts_last_name_not_null',
    table: 'contacts',
    type: 'not_null',
    columns: ['last_name'],
    errorMessage: 'Contact last name is required'
  },
  {
    name: 'contacts_type_valid',
    table: 'contacts',
    type: 'check',
    columns: ['contact_type'],
    condition: "contact_type IN ('lead', 'prospect', 'customer', 'partner', 'vendor')",
    errorMessage: 'Invalid contact type'
  },

  // Deal constraints (CRM)
  {
    name: 'deals_contact_fk',
    table: 'deals',
    type: 'foreign_key',
    columns: ['contact_id'],
    referencedTable: 'contacts',
    referencedColumns: ['id'],
    errorMessage: 'Invalid contact ID'
  },
  {
    name: 'deals_owner_fk',
    table: 'deals',
    type: 'foreign_key',
    columns: ['owner_id'],
    referencedTable: 'users',
    referencedColumns: ['id'],
    errorMessage: 'Invalid deal owner user ID'
  },
  {
    name: 'deals_title_not_null',
    table: 'deals',
    type: 'not_null',
    columns: ['title'],
    errorMessage: 'Deal title is required'
  },
  {
    name: 'deals_stage_valid',
    table: 'deals',
    type: 'check',
    columns: ['stage'],
    condition: "stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')",
    errorMessage: 'Invalid deal stage'
  },
  {
    name: 'deals_value_non_negative',
    table: 'deals',
    type: 'check',
    columns: ['value'],
    condition: 'value IS NULL OR value >= 0',
    errorMessage: 'Deal value cannot be negative'
  },
  {
    name: 'deals_probability_range',
    table: 'deals',
    type: 'check',
    columns: ['probability'],
    condition: 'probability >= 0 AND probability <= 100',
    errorMessage: 'Deal probability must be between 0 and 100'
  },
  {
    name: 'deals_closed_date_logic',
    table: 'deals',
    type: 'business_rule',
    columns: ['stage', 'actual_close_date'],
    condition: "(stage IN ('closed_won', 'closed_lost') AND actual_close_date IS NOT NULL) OR (stage NOT IN ('closed_won', 'closed_lost') AND actual_close_date IS NULL)",
    errorMessage: 'Closed deals must have an actual close date'
  },

  // Campaign constraints (CRM)
  {
    name: 'campaigns_name_not_null',
    table: 'campaigns',
    type: 'not_null',
    columns: ['name'],
    errorMessage: 'Campaign name is required'
  },
  {
    name: 'campaigns_status_valid',
    table: 'campaigns',
    type: 'check',
    columns: ['status'],
    condition: "status IN ('draft', 'active', 'paused', 'completed', 'cancelled')",
    errorMessage: 'Invalid campaign status'
  },
  {
    name: 'campaigns_budget_non_negative',
    table: 'campaigns',
    type: 'check',
    columns: ['budget'],
    condition: 'budget IS NULL OR budget >= 0',
    errorMessage: 'Campaign budget cannot be negative'
  },
  {
    name: 'campaigns_date_logic',
    table: 'campaigns',
    type: 'business_rule',
    columns: ['start_date', 'end_date'],
    condition: 'start_date IS NULL OR end_date IS NULL OR start_date <= end_date',
    errorMessage: 'Campaign end date must be after start date'
  },

  // Notification constraints
  {
    name: 'notifications_user_fk',
    table: 'notifications',
    type: 'foreign_key',
    columns: ['user_id'],
    referencedTable: 'users',
    referencedColumns: ['id'],
    errorMessage: 'Invalid user ID'
  },
  {
    name: 'notifications_title_not_null',
    table: 'notifications',
    type: 'not_null',
    columns: ['title'],
    errorMessage: 'Notification title is required'
  },
  {
    name: 'notifications_message_not_null',
    table: 'notifications',
    type: 'not_null',
    columns: ['message'],
    errorMessage: 'Notification message is required'
  },
  {
    name: 'notifications_type_valid',
    table: 'notifications',
    type: 'check',
    columns: ['notification_type'],
    condition: "notification_type IN ('info', 'success', 'warning', 'error', 'assignment', 'grade', 'announcement', 'reminder')",
    errorMessage: 'Invalid notification type'
  },
  {
    name: 'notifications_priority_valid',
    table: 'notifications',
    type: 'check',
    columns: ['priority'],
    condition: "priority IN ('low', 'normal', 'high', 'urgent')",
    errorMessage: 'Invalid notification priority'
  }
];

/**
 * Constraint validation functions
 */
export class ConstraintValidator {
  /**
   * Validate all constraints for a table operation
   */
  static async validateConstraints(
    tableName: string,
    data: any,
    operation: 'create' | 'update' = 'create',
    existingData?: any
  ): Promise<void> {
    const tableConstraints = DatabaseConstraints.filter(c => c.table === tableName);
    const errors: string[] = [];

    for (const constraint of tableConstraints) {
      try {
        await this.validateSingleConstraint(constraint, data, operation, existingData);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Unknown constraint violation');
      }
    }

    if (errors.length > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Constraint validation failed',
        cause: { constraintErrors: errors }
      });
    }
  }

  /**
   * Validate a single constraint
   */
  private static async validateSingleConstraint(
    constraint: DatabaseConstraint,
    data: any,
    operation: 'create' | 'update',
    existingData?: any
  ): Promise<void> {
    switch (constraint.type) {
      case 'not_null':
        this.validateNotNull(constraint, data);
        break;
      case 'unique':
        await this.validateUnique(constraint, data, operation, existingData);
        break;
      case 'foreign_key':
        await this.validateForeignKey(constraint, data);
        break;
      case 'check':
        this.validateCheck(constraint, data);
        break;
      case 'business_rule':
        await this.validateBusinessRule(constraint, data, operation, existingData);
        break;
    }
  }

  /**
   * Validate NOT NULL constraints
   */
  private static validateNotNull(constraint: DatabaseConstraint, data: any): void {
    for (const column of constraint.columns) {
      const value = data[column];
      if (value === null || value === undefined || value === '') {
        throw new Error(constraint.errorMessage);
      }
    }
  }

  /**
   * Validate UNIQUE constraints
   */
  private static async validateUnique(
    constraint: DatabaseConstraint,
    data: any,
    operation: 'create' | 'update',
    existingData?: any
  ): Promise<void> {
    // In a real implementation, this would query the database
    // For now, we'll simulate the validation logic
    
    const values = constraint.columns.map(col => data[col]).filter(v => v !== undefined);
    if (values.length === 0) return;

    // Simulate database check
    console.log(`Checking unique constraint ${constraint.name} for values:`, values);
    
    // For update operations, exclude the current record
    if (operation === 'update' && existingData) {
      console.log('Excluding current record from unique check:', existingData.id);
    }

    // In production, this would be:
    // const exists = await db.query(`SELECT 1 FROM ${constraint.table} WHERE ${constraint.columns.map(col => `${col} = ?`).join(' AND ')}`, values);
    // if (exists.length > 0) throw new Error(constraint.errorMessage);
  }

  /**
   * Validate FOREIGN KEY constraints
   */
  private static async validateForeignKey(constraint: DatabaseConstraint, data: any): Promise<void> {
    if (!constraint.referencedTable || !constraint.referencedColumns) return;

    const values = constraint.columns.map(col => data[col]).filter(v => v !== undefined && v !== null);
    if (values.length === 0) return;

    // Simulate foreign key validation
    console.log(`Checking foreign key constraint ${constraint.name}:`, {
      table: constraint.table,
      columns: constraint.columns,
      referencedTable: constraint.referencedTable,
      referencedColumns: constraint.referencedColumns,
      values
    });

    // In production, this would be:
    // const exists = await db.query(`SELECT 1 FROM ${constraint.referencedTable} WHERE ${constraint.referencedColumns.map(col => `${col} = ?`).join(' AND ')}`, values);
    // if (exists.length === 0) throw new Error(constraint.errorMessage);
  }

  /**
   * Validate CHECK constraints
   */
  private static validateCheck(constraint: DatabaseConstraint, data: any): void {
    // For simple enum checks, we can validate client-side
    if (constraint.condition?.includes('IN (')) {
      const column = constraint.columns[0];
      const value = data[column];
      
      if (value !== undefined && value !== null) {
        // Extract allowed values from condition
        const match = constraint.condition.match(/IN \((.*?)\)/);
        if (match) {
          const allowedValues = match[1]
            .split(',')
            .map(v => v.trim().replace(/'/g, ''));
          
          if (!allowedValues.includes(value)) {
            throw new Error(constraint.errorMessage);
          }
        }
      }
    }

    // For numeric range checks
    if (constraint.condition?.includes('>') || constraint.condition?.includes('<')) {
      const column = constraint.columns[0];
      const value = data[column];
      
      if (value !== undefined && value !== null) {
        // Simple validation for positive numbers
        if (constraint.condition.includes('> 0') && value <= 0) {
          throw new Error(constraint.errorMessage);
        }
        if (constraint.condition.includes('>= 0') && value < 0) {
          throw new Error(constraint.errorMessage);
        }
      }
    }
  }

  /**
   * Validate business rule constraints
   */
  private static async validateBusinessRule(
    constraint: DatabaseConstraint,
    data: any,
    operation: 'create' | 'update',
    existingData?: any
  ): Promise<void> {
    // Handle specific business rules
    switch (constraint.name) {
      case 'users_admin_mfa_required':
        if (data.role && ['admin', 'super_admin'].includes(data.role)) {
          if (!data.mfa_enabled && data.mfa_enabled !== true) {
            throw new Error(constraint.errorMessage);
          }
        }
        break;

      case 'assignments_due_date_future':
        if (data.status === 'published' && data.due_date) {
          const dueDate = new Date(data.due_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (dueDate < today) {
            throw new Error(constraint.errorMessage);
          }
        }
        break;

      case 'deals_closed_date_logic':
        const isClosedStage = data.stage && ['closed_won', 'closed_lost'].includes(data.stage);
        const hasCloseDate = data.actual_close_date !== undefined && data.actual_close_date !== null;
        
        if (isClosedStage && !hasCloseDate) {
          throw new Error(constraint.errorMessage);
        }
        if (!isClosedStage && hasCloseDate) {
          throw new Error('Open deals cannot have an actual close date');
        }
        break;

      case 'campaigns_date_logic':
        if (data.start_date && data.end_date) {
          const startDate = new Date(data.start_date);
          const endDate = new Date(data.end_date);
          
          if (startDate > endDate) {
            throw new Error(constraint.errorMessage);
          }
        }
        break;

      default:
        // For complex business rules, log for manual review
        console.log(`Business rule validation needed for ${constraint.name}:`, data);
    }
  }

  /**
   * Get constraints for a specific table
   */
  static getTableConstraints(tableName: string): DatabaseConstraint[] {
    return DatabaseConstraints.filter(c => c.table === tableName);
  }

  /**
   * Get constraint by name
   */
  static getConstraint(name: string): DatabaseConstraint | undefined {
    return DatabaseConstraints.find(c => c.name === name);
  }

  /**
   * Validate data against specific constraint types
   */
  static async validateByType(
    tableName: string,
    data: any,
    constraintType: DatabaseConstraint['type'],
    operation: 'create' | 'update' = 'create'
  ): Promise<void> {
    const constraints = DatabaseConstraints.filter(
      c => c.table === tableName && c.type === constraintType
    );

    for (const constraint of constraints) {
      await this.validateSingleConstraint(constraint, data, operation);
    }
  }
}

/**
 * SQL constraint generation for database migrations
 */
export class ConstraintSQLGenerator {
  /**
   * Generate SQL for creating constraints
   */
  static generateConstraintSQL(constraint: DatabaseConstraint): string {
    switch (constraint.type) {
      case 'unique':
        return `ALTER TABLE ${constraint.table} ADD CONSTRAINT ${constraint.name} UNIQUE (${constraint.columns.join(', ')});`;
      
      case 'foreign_key':
        if (!constraint.referencedTable || !constraint.referencedColumns) {
          throw new Error('Foreign key constraint missing referenced table/columns');
        }
        return `ALTER TABLE ${constraint.table} ADD CONSTRAINT ${constraint.name} FOREIGN KEY (${constraint.columns.join(', ')}) REFERENCES ${constraint.referencedTable} (${constraint.referencedColumns.join(', ')});`;
      
      case 'check':
        return `ALTER TABLE ${constraint.table} ADD CONSTRAINT ${constraint.name} CHECK (${constraint.condition});`;
      
      case 'not_null':
        return constraint.columns.map(col => 
          `ALTER TABLE ${constraint.table} ALTER COLUMN ${col} SET NOT NULL;`
        ).join('\n');
      
      default:
        return `-- Business rule constraint: ${constraint.name} (manual implementation required)`;
    }
  }

  /**
   * Generate SQL for dropping constraints
   */
  static generateDropConstraintSQL(constraint: DatabaseConstraint): string {
    if (constraint.type === 'not_null') {
      return constraint.columns.map(col => 
        `ALTER TABLE ${constraint.table} ALTER COLUMN ${col} DROP NOT NULL;`
      ).join('\n');
    }
    
    return `ALTER TABLE ${constraint.table} DROP CONSTRAINT IF EXISTS ${constraint.name};`;
  }

  /**
   * Generate complete migration SQL
   */
  static generateMigrationSQL(): string {
    const upSQL = DatabaseConstraints
      .filter(c => c.type !== 'business_rule') // Skip business rules in SQL
      .map(c => this.generateConstraintSQL(c))
      .join('\n\n');

    const downSQL = DatabaseConstraints
      .filter(c => c.type !== 'business_rule')
      .reverse()
      .map(c => this.generateDropConstraintSQL(c))
      .join('\n\n');

    return `-- Up Migration\n${upSQL}\n\n-- Down Migration\n${downSQL}`;
  }
}

export default {
  DatabaseConstraints,
  ConstraintValidator,
  ConstraintSQLGenerator
};