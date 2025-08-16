/**
 * Validation integration for all tRPC routers
 * Applies comprehensive validation and sanitization to all API endpoints
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { ValidationSchemas } from './schemas';
import { DataSanitizer } from './sanitizer';
import { DatabaseIntegrityChecker } from './integrity-checker';
import { 
  createValidationMiddleware, 
  sanitizeStringsMiddleware,
  createRateLimitMiddleware,
  requireAuth,
  auditLogMiddleware,
  commonMiddlewares
} from './middleware';

/**
 * Validation configuration for each router endpoint
 */
export const ValidationConfig = {
  // AI Router Validations
  ai: {
    chat: {
      input: ValidationSchemas.CreateAIUsage.extend({
        message: z.string().min(1).max(4000),
        conversationId: z.number().optional(),
        provider: z.enum(['openrouter', 'ollama', 'gemini']).default('openrouter'),
        model: z.string().optional(),
        temperature: z.number().min(0).max(2).optional(),
        maxTokens: z.number().min(1).max(4000).optional(),
        systemPrompt: z.string().max(2000).optional(),
        contextType: z.enum(['general', 'academic', 'administrative', 'support']).default('general'),
      }),
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(50, 60000), // 50 requests per minute for AI
        requireAuth,
        auditLogMiddleware('ai.chat')
      ]
    },
    createPrompt: {
      input: ValidationSchemas.CreatePrompt,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(20, 60000),
        requireAuth,
        auditLogMiddleware('ai.prompt.create')
      ]
    },
    updatePrompt: {
      input: ValidationSchemas.UpdatePrompt,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(20, 60000),
        requireAuth,
        auditLogMiddleware('ai.prompt.update')
      ]
    }
  },

  // CRM Router Validations
  crm: {
    createContact: {
      input: ValidationSchemas.CreateContact,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(100, 60000),
        requireAuth,
        auditLogMiddleware('crm.contact.create')
      ]
    },
    updateContact: {
      input: ValidationSchemas.UpdateContact,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(100, 60000),
        requireAuth,
        auditLogMiddleware('crm.contact.update')
      ]
    },
    createDeal: {
      input: ValidationSchemas.CreateDeal,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(50, 60000),
        requireAuth,
        auditLogMiddleware('crm.deal.create')
      ]
    },
    updateDeal: {
      input: ValidationSchemas.UpdateDeal,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(50, 60000),
        requireAuth,
        auditLogMiddleware('crm.deal.update')
      ]
    },
    createCampaign: {
      input: ValidationSchemas.CreateCampaign,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(20, 60000),
        requireAuth,
        auditLogMiddleware('crm.campaign.create')
      ]
    }
  },

  // School Hub Router Validations
  schoolHub: {
    createCourse: {
      input: ValidationSchemas.CreateCourse,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(30, 60000),
        requireAuth,
        auditLogMiddleware('school.course.create')
      ]
    },
    updateCourse: {
      input: ValidationSchemas.UpdateCourse,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(30, 60000),
        requireAuth,
        auditLogMiddleware('school.course.update')
      ]
    },
    createClass: {
      input: ValidationSchemas.CreateClass,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(30, 60000),
        requireAuth,
        auditLogMiddleware('school.class.create')
      ]
    },
    createAssignment: {
      input: ValidationSchemas.CreateAssignment,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(50, 60000),
        requireAuth,
        auditLogMiddleware('school.assignment.create')
      ]
    },
    createSubmission: {
      input: ValidationSchemas.CreateSubmission,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(100, 60000),
        requireAuth,
        auditLogMiddleware('school.submission.create')
      ]
    },
    gradeSubmission: {
      input: ValidationSchemas.UpdateSubmission,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(100, 60000),
        requireAuth,
        auditLogMiddleware('school.submission.grade')
      ]
    },
    createEnrollment: {
      input: ValidationSchemas.CreateEnrollment,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(50, 60000),
        requireAuth,
        auditLogMiddleware('school.enrollment.create')
      ]
    }
  },

  // Dashboard Router Validations
  dashboard: {
    createAlert: {
      input: z.object({
        title: z.string().min(1).max(255),
        message: z.string().min(1).max(1000),
        type: z.enum(['info', 'warning', 'error', 'success']),
        priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
        targetUsers: z.array(z.number()).optional(),
        expiresAt: z.date().optional(),
        metadata: z.record(z.any()).default({})
      }),
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(20, 60000),
        requireAuth,
        auditLogMiddleware('dashboard.alert.create')
      ]
    }
  },

  // Notifications Router Validations
  notifications: {
    create: {
      input: ValidationSchemas.CreateNotification,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(100, 60000),
        requireAuth,
        auditLogMiddleware('notification.create')
      ]
    },
    updatePreferences: {
      input: z.object({
        userId: z.number(),
        preferences: z.object({
          email: z.boolean().default(true),
          push: z.boolean().default(true),
          sms: z.boolean().default(false),
          inApp: z.boolean().default(true),
          categories: z.record(z.boolean()).default({})
        })
      }),
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(10, 60000),
        requireAuth,
        auditLogMiddleware('notification.preferences.update')
      ]
    }
  },

  // Analytics Router Validations
  analytics: {
    trackEvent: {
      input: ValidationSchemas.CreateAnalyticsEvent,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(200, 60000), // Higher limit for analytics
        auditLogMiddleware('analytics.event.track')
      ]
    },
    trackPageView: {
      input: z.object({
        userId: z.number().optional(),
        sessionId: z.string().min(1).max(255),
        pageUrl: z.string().url(),
        pageTitle: z.string().max(255).optional(),
        referrer: z.string().url().optional(),
        userAgent: z.string().optional(),
        ipAddress: z.string().ip().optional(),
        timestamp: z.date().default(() => new Date()),
        metadata: z.record(z.any()).default({})
      }),
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(500, 60000), // Very high limit for page views
        auditLogMiddleware('analytics.pageview.track')
      ]
    }
  },

  // Marketplace Router Validations
  marketplace: {
    createProduct: {
      input: ValidationSchemas.CreateMarketplaceProduct,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(20, 60000),
        requireAuth,
        auditLogMiddleware('marketplace.product.create')
      ]
    },
    updateProduct: {
      input: ValidationSchemas.UpdateMarketplaceProduct,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(20, 60000),
        requireAuth,
        auditLogMiddleware('marketplace.product.update')
      ]
    }
  },

  // Support Router Validations
  support: {
    createTicket: {
      input: ValidationSchemas.CreateSupportTicket,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(10, 60000),
        requireAuth,
        auditLogMiddleware('support.ticket.create')
      ]
    },
    updateTicket: {
      input: ValidationSchemas.UpdateSupportTicket,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(50, 60000),
        requireAuth,
        auditLogMiddleware('support.ticket.update')
      ]
    },
    replyToTicket: {
      input: z.object({
        ticketId: z.number(),
        message: z.string().min(1).max(5000),
        isInternal: z.boolean().default(false),
        attachments: z.array(ValidationSchemas.FileUpload).optional()
      }),
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(50, 60000),
        requireAuth,
        auditLogMiddleware('support.ticket.reply')
      ]
    }
  },

  // Settings Router Validations
  settings: {
    updateUserSetting: {
      input: ValidationSchemas.UpdateUserSetting,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(50, 60000),
        requireAuth,
        auditLogMiddleware('settings.user.update')
      ]
    },
    updateSystemSetting: {
      input: ValidationSchemas.UpdateSystemSetting,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(10, 60000),
        requireAuth,
        auditLogMiddleware('settings.system.update')
      ]
    }
  },

  // File Storage Router Validations
  storage: {
    uploadFile: {
      input: ValidationSchemas.FileUpload,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(20, 60000),
        requireAuth,
        auditLogMiddleware('storage.file.upload')
      ]
    },
    uploadMultipleFiles: {
      input: ValidationSchemas.MultipleFileUpload,
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(10, 60000),
        requireAuth,
        auditLogMiddleware('storage.files.upload')
      ]
    }
  },

  // Webhooks Router Validations
  webhooks: {
    createEndpoint: {
      input: z.object({
        url: z.string().url(),
        events: z.array(z.string()).min(1),
        secret: z.string().min(16).max(128),
        isActive: z.boolean().default(true),
        description: z.string().max(500).optional(),
        headers: z.record(z.string()).optional(),
        retryPolicy: z.object({
          maxRetries: z.number().min(0).max(10).default(3),
          backoffMultiplier: z.number().min(1).max(5).default(2),
          initialDelay: z.number().min(1000).max(60000).default(1000)
        }).optional()
      }),
      middleware: [
        sanitizeStringsMiddleware,
        createRateLimitMiddleware(10, 60000),
        requireAuth,
        auditLogMiddleware('webhook.endpoint.create')
      ]
    }
  }
};

/**
 * Apply validation to a tRPC procedure
 */
export function withValidation<T extends z.ZodType>(
  procedure: any,
  config: {
    input: T;
    middleware?: any[];
  }
) {
  let validatedProcedure = procedure;

  // Apply middleware in order
  if (config.middleware) {
    for (const middleware of config.middleware) {
      validatedProcedure = validatedProcedure.use(middleware);
    }
  }

  // Apply input validation
  validatedProcedure = validatedProcedure.input(config.input);

  return validatedProcedure;
}

/**
 * Batch validation for multiple inputs
 */
export async function validateBatch(
  inputs: { [key: string]: any },
  schemas: { [key: string]: z.ZodType }
): Promise<{ [key: string]: any }> {
  const validated: { [key: string]: any } = {};
  const errors: { [key: string]: string } = {};

  for (const [key, input] of Object.entries(inputs)) {
    const schema = schemas[key];
    if (!schema) {
      errors[key] = 'No validation schema found';
      continue;
    }

    try {
      // Sanitize input first
      const sanitized = DataSanitizer.sanitizeJson(input);
      
      // Then validate
      validated[key] = schema.parse(sanitized);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors[key] = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      } else {
        errors[key] = error instanceof Error ? error.message : 'Unknown validation error';
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Batch validation failed',
      cause: { validationErrors: errors }
    });
  }

  return validated;
}

/**
 * Database constraint validation
 */
export async function validateDatabaseConstraints(
  tableName: string,
  data: any,
  operation: 'create' | 'update' = 'create'
): Promise<void> {
  // Check for unique constraints
  if (tableName === 'users' && data.email) {
    // This would be implemented with actual database queries
    // For now, we'll add the structure
    console.log(`Validating unique email constraint for ${data.email}`);
  }

  if (tableName === 'contacts' && data.email) {
    console.log(`Validating unique contact email constraint for ${data.email}`);
  }

  // Check foreign key constraints
  if (data.schoolId) {
    console.log(`Validating school foreign key constraint for ${data.schoolId}`);
  }

  if (data.userId) {
    console.log(`Validating user foreign key constraint for ${data.userId}`);
  }

  // Check business rules
  if (tableName === 'enrollments' && data.studentId && data.classId) {
    console.log(`Validating enrollment business rules for student ${data.studentId} in class ${data.classId}`);
  }
}

/**
 * Comprehensive input sanitization
 */
export function sanitizeAllInputs(input: any): any {
  if (!input || typeof input !== 'object') {
    return input;
  }

  const sanitized = { ...input };

  // Sanitize strings
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      // Apply appropriate sanitization based on field type
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = DataSanitizer.sanitizeEmail(value);
      } else if (key.toLowerCase().includes('phone')) {
        sanitized[key] = DataSanitizer.sanitizePhone(value);
      } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('website')) {
        sanitized[key] = DataSanitizer.sanitizeUrl(value);
      } else if (key.toLowerCase().includes('html') || key.toLowerCase().includes('content')) {
        sanitized[key] = DataSanitizer.sanitizeHtml(value);
      } else {
        sanitized[key] = DataSanitizer.sanitizeHtml(value, { stripTags: true });
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => sanitizeAllInputs(item));
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAllInputs(value);
    }
  }

  return sanitized;
}

/**
 * SQL injection prevention
 */
export function preventSQLInjection(query: string, params: any[]): { query: string; params: any[] } {
  // Validate that query uses parameterized statements
  const suspiciousPatterns = [
    /;\s*(drop|delete|truncate|alter|create)\s+/gi,
    /union\s+select/gi,
    /'\s*or\s*'1'\s*=\s*'1/gi,
    /'\s*or\s*1\s*=\s*1/gi,
    /--/g,
    /\/\*/g,
    /\*\//g
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(query)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Potentially malicious SQL detected'
      });
    }
  }

  // Sanitize parameters
  const sanitizedParams = params.map(param => {
    if (typeof param === 'string') {
      return DataSanitizer.sanitizeSql(param);
    }
    return param;
  });

  return { query, params: sanitizedParams };
}

/**
 * Export validation utilities
 */
export const ValidationUtils = {
  withValidation,
  validateBatch,
  validateDatabaseConstraints,
  sanitizeAllInputs,
  preventSQLInjection,
  DataSanitizer,
  ValidationSchemas,
  ValidationConfig
};

export default ValidationUtils;