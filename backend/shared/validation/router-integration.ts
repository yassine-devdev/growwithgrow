/**
 * Router Integration for Comprehensive Validation
 * Applies validation middleware to all existing tRPC routers
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { ValidationSchemas } from './schemas';
import { ValidationConfig, withValidation } from './integration';
import { ConstraintValidator } from './constraints';
import { DataSanitizer } from './sanitizer';
import { 
  sanitizeStringsMiddleware,
  createRateLimitMiddleware,
  requireAuth,
  auditLogMiddleware,
  commonMiddlewares
} from './middleware';

/**
 * Enhanced procedure builders with comprehensive validation
 */
export function createValidatedProcedure(
  baseProcedure: any,
  config: {
    inputSchema?: z.ZodType;
    tableName?: string;
    operation?: 'create' | 'update' | 'delete' | 'read';
    rateLimitConfig?: { maxRequests: number; windowMs: number };
    requiresAuth?: boolean;
    auditAction?: string;
    customMiddleware?: any[];
  }
) {
  let procedure = baseProcedure;

  // Apply custom middleware first
  if (config.customMiddleware) {
    for (const middleware of config.customMiddleware) {
      procedure = procedure.use(middleware);
    }
  }

  // Apply common security middleware
  procedure = procedure.use(sanitizeStringsMiddleware);

  // Apply rate limiting
  if (config.rateLimitConfig) {
    procedure = procedure.use(
      createRateLimitMiddleware(
        config.rateLimitConfig.maxRequests,
        config.rateLimitConfig.windowMs
      )
    );
  } else {
    // Default rate limiting based on operation
    const defaultLimits = {
      create: { maxRequests: 50, windowMs: 60000 },
      update: { maxRequests: 100, windowMs: 60000 },
      delete: { maxRequests: 20, windowMs: 60000 },
      read: { maxRequests: 200, windowMs: 60000 }
    };
    const limit = defaultLimits[config.operation || 'read'];
    procedure = procedure.use(createRateLimitMiddleware(limit.maxRequests, limit.windowMs));
  }

  // Apply authentication if required
  if (config.requiresAuth !== false) {
    procedure = procedure.use(requireAuth);
  }

  // Apply audit logging
  if (config.auditAction) {
    procedure = procedure.use(auditLogMiddleware(config.auditAction));
  }

  // Apply input validation
  if (config.inputSchema) {
    procedure = procedure.input(config.inputSchema);
  }

  // Add database constraint validation middleware
  if (config.tableName && ['create', 'update'].includes(config.operation || '')) {
    procedure = procedure.use(async ({ input, next }) => {
      try {
        // Sanitize input
        const sanitizedInput = DataSanitizer.sanitizeJson(input);
        
        // Validate database constraints
        await ConstraintValidator.validateConstraints(
          config.tableName!,
          sanitizedInput,
          config.operation as 'create' | 'update'
        );

        return next({ ctx: { sanitizedInput } });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Validation failed: ${error.message}`,
            cause: error
          });
        }
        throw error;
      }
    });
  }

  return procedure;
}

/**
 * Validation configurations for each router
 */
export const RouterValidationConfigs = {
  // AI Router
  ai: {
    chat: {
      inputSchema: ValidationSchemas.CreateAIUsage.extend({
        message: z.string().min(1).max(4000),
        conversationId: z.number().optional(),
        provider: z.enum(['openrouter', 'ollama', 'gemini']).default('openrouter'),
        model: z.string().optional(),
        temperature: z.number().min(0).max(2).optional(),
        maxTokens: z.number().min(1).max(4000).optional(),
        systemPrompt: z.string().max(2000).optional(),
        contextType: z.enum(['general', 'academic', 'administrative', 'support']).default('general'),
      }),
      tableName: 'ai_usage',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 50, windowMs: 60000 },
      auditAction: 'ai.chat'
    },
    createPrompt: {
      inputSchema: z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        promptText: z.string().min(1),
        category: z.string().min(1).max(100),
        variables: z.array(z.string()).optional(),
        isSystem: z.boolean().default(false),
      }),
      tableName: 'prompts',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 20, windowMs: 60000 },
      auditAction: 'ai.prompt.create'
    },
    updatePrompt: {
      inputSchema: z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        promptText: z.string().min(1).optional(),
        category: z.string().min(1).max(100).optional(),
        variables: z.array(z.string()).optional(),
        isSystem: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }),
      tableName: 'prompts',
      operation: 'update' as const,
      rateLimitConfig: { maxRequests: 20, windowMs: 60000 },
      auditAction: 'ai.prompt.update'
    }
  },

  // CRM Router
  crm: {
    createContact: {
      inputSchema: ValidationSchemas.CreateContact,
      tableName: 'contacts',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 100, windowMs: 60000 },
      auditAction: 'crm.contact.create'
    },
    updateContact: {
      inputSchema: ValidationSchemas.UpdateContact,
      tableName: 'contacts',
      operation: 'update' as const,
      rateLimitConfig: { maxRequests: 100, windowMs: 60000 },
      auditAction: 'crm.contact.update'
    },
    createDeal: {
      inputSchema: ValidationSchemas.CreateDeal,
      tableName: 'deals',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 50, windowMs: 60000 },
      auditAction: 'crm.deal.create'
    },
    updateDeal: {
      inputSchema: ValidationSchemas.UpdateDeal,
      tableName: 'deals',
      operation: 'update' as const,
      rateLimitConfig: { maxRequests: 50, windowMs: 60000 },
      auditAction: 'crm.deal.update'
    },
    createCampaign: {
      inputSchema: ValidationSchemas.CreateCampaign,
      tableName: 'campaigns',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 20, windowMs: 60000 },
      auditAction: 'crm.campaign.create'
    }
  },

  // School Hub Router
  schoolHub: {
    createCourse: {
      inputSchema: ValidationSchemas.CreateCourse,
      tableName: 'courses',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 30, windowMs: 60000 },
      auditAction: 'school.course.create'
    },
    updateCourse: {
      inputSchema: ValidationSchemas.UpdateCourse,
      tableName: 'courses',
      operation: 'update' as const,
      rateLimitConfig: { maxRequests: 30, windowMs: 60000 },
      auditAction: 'school.course.update'
    },
    createClass: {
      inputSchema: ValidationSchemas.CreateClass,
      tableName: 'classes',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 30, windowMs: 60000 },
      auditAction: 'school.class.create'
    },
    createAssignment: {
      inputSchema: ValidationSchemas.CreateAssignment,
      tableName: 'assignments',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 50, windowMs: 60000 },
      auditAction: 'school.assignment.create'
    },
    createSubmission: {
      inputSchema: ValidationSchemas.CreateSubmission,
      tableName: 'submissions',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 100, windowMs: 60000 },
      auditAction: 'school.submission.create'
    },
    gradeSubmission: {
      inputSchema: ValidationSchemas.UpdateSubmission,
      tableName: 'submissions',
      operation: 'update' as const,
      rateLimitConfig: { maxRequests: 100, windowMs: 60000 },
      auditAction: 'school.submission.grade'
    },
    createEnrollment: {
      inputSchema: ValidationSchemas.CreateEnrollment,
      tableName: 'enrollments',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 50, windowMs: 60000 },
      auditAction: 'school.enrollment.create'
    }
  },

  // Dashboard Router
  dashboard: {
    createAlert: {
      inputSchema: z.object({
        title: z.string().min(1).max(255),
        message: z.string().min(1).max(1000),
        type: z.enum(['info', 'warning', 'error', 'success']),
        priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
        targetUsers: z.array(z.number()).optional(),
        expiresAt: z.date().optional(),
        metadata: z.record(z.any()).default({})
      }),
      tableName: 'alerts',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 20, windowMs: 60000 },
      auditAction: 'dashboard.alert.create'
    }
  },

  // Notifications Router
  notifications: {
    create: {
      inputSchema: ValidationSchemas.CreateNotification,
      tableName: 'notifications',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 100, windowMs: 60000 },
      auditAction: 'notification.create'
    },
    updatePreferences: {
      inputSchema: z.object({
        userId: z.number(),
        preferences: z.object({
          email: z.boolean().default(true),
          push: z.boolean().default(true),
          sms: z.boolean().default(false),
          inApp: z.boolean().default(true),
          categories: z.record(z.boolean()).default({})
        })
      }),
      tableName: 'notification_preferences',
      operation: 'update' as const,
      rateLimitConfig: { maxRequests: 10, windowMs: 60000 },
      auditAction: 'notification.preferences.update'
    }
  },

  // Analytics Router
  analytics: {
    trackEvent: {
      inputSchema: ValidationSchemas.CreateAnalyticsEvent,
      tableName: 'analytics_events',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 200, windowMs: 60000 },
      requiresAuth: false, // Analytics can be anonymous
      auditAction: 'analytics.event.track'
    },
    trackPageView: {
      inputSchema: z.object({
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
      tableName: 'page_views',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 500, windowMs: 60000 },
      requiresAuth: false,
      auditAction: 'analytics.pageview.track'
    }
  },

  // Support Router
  support: {
    createTicket: {
      inputSchema: ValidationSchemas.CreateSupportTicket,
      tableName: 'support_tickets',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 10, windowMs: 60000 },
      auditAction: 'support.ticket.create'
    },
    updateTicket: {
      inputSchema: ValidationSchemas.UpdateSupportTicket,
      tableName: 'support_tickets',
      operation: 'update' as const,
      rateLimitConfig: { maxRequests: 50, windowMs: 60000 },
      auditAction: 'support.ticket.update'
    },
    replyToTicket: {
      inputSchema: z.object({
        ticketId: z.number(),
        message: z.string().min(1).max(5000),
        isInternal: z.boolean().default(false),
        attachments: z.array(ValidationSchemas.FileUpload).optional()
      }),
      tableName: 'ticket_replies',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 50, windowMs: 60000 },
      auditAction: 'support.ticket.reply'
    }
  },

  // Settings Router
  settings: {
    updateUserSetting: {
      inputSchema: ValidationSchemas.UpdateUserSetting,
      tableName: 'user_settings',
      operation: 'update' as const,
      rateLimitConfig: { maxRequests: 50, windowMs: 60000 },
      auditAction: 'settings.user.update'
    },
    updateSystemSetting: {
      inputSchema: ValidationSchemas.UpdateSystemSetting,
      tableName: 'system_settings',
      operation: 'update' as const,
      rateLimitConfig: { maxRequests: 10, windowMs: 60000 },
      auditAction: 'settings.system.update'
    }
  },

  // Storage Router
  storage: {
    uploadFile: {
      inputSchema: ValidationSchemas.FileUpload,
      tableName: 'file_uploads',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 20, windowMs: 60000 },
      auditAction: 'storage.file.upload'
    },
    uploadMultipleFiles: {
      inputSchema: ValidationSchemas.MultipleFileUpload,
      tableName: 'file_uploads',
      operation: 'create' as const,
      rateLimitConfig: { maxRequests: 10, windowMs: 60000 },
      auditAction: 'storage.files.upload'
    }
  }
};

/**
 * Helper function to apply validation to existing router procedures
 */
export function applyValidationToRouter(
  router: any,
  routerName: keyof typeof RouterValidationConfigs,
  baseProcedure: any
) {
  const configs = RouterValidationConfigs[routerName];
  const validatedRouter: any = {};

  for (const [procedureName, config] of Object.entries(configs)) {
    validatedRouter[procedureName] = createValidatedProcedure(baseProcedure, config);
  }

  return validatedRouter;
}

/**
 * Validation middleware for bulk operations
 */
export const bulkOperationMiddleware = (tableName: string, operation: 'create' | 'update' | 'delete') => {
  return async ({ input, next }: any) => {
    if (!Array.isArray(input.items)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Bulk operations require an array of items'
      });
    }

    if (input.items.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Bulk operations require at least one item'
      });
    }

    if (input.items.length > 1000) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Bulk operations are limited to 1000 items at a time'
      });
    }

    // Validate each item
    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];
      
      try {
        // Sanitize item
        const sanitizedItem = DataSanitizer.sanitizeJson(item);
        
        // Validate constraints
        await ConstraintValidator.validateConstraints(tableName, sanitizedItem, operation);
        
        // Replace with sanitized version
        input.items[i] = sanitizedItem;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Validation failed for item ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          cause: { itemIndex: i, originalError: error }
        });
      }
    }

    return next();
  };
};

/**
 * File upload validation middleware
 */
export const fileUploadValidationMiddleware = (config: {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  maxFiles?: number;
}) => {
  return async ({ input, next }: any) => {
    const maxFileSize = config.maxFileSize || 50 * 1024 * 1024; // 50MB default
    const allowedMimeTypes = config.allowedMimeTypes || [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxFiles = config.maxFiles || 10;

    const files = Array.isArray(input.files) ? input.files : [input];

    if (files.length > maxFiles) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Maximum ${maxFiles} files allowed`
      });
    }

    for (const file of files) {
      // Validate file size
      if (file.size > maxFileSize) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `File ${file.filename} exceeds maximum size of ${maxFileSize / (1024 * 1024)}MB`
        });
      }

      // Validate MIME type
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `File type ${file.mimetype} is not allowed`
        });
      }

      // Sanitize filename
      file.filename = DataSanitizer.sanitizeFileName(file.filename);
    }

    return next();
  };
};

/**
 * Search and pagination validation middleware
 */
export const searchValidationMiddleware = async ({ input, next }: any) => {
  if (input.query) {
    // Sanitize search query
    input.query = DataSanitizer.sanitizeSearchQuery(input.query);
    
    // Limit search query length
    if (input.query.length > 500) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Search query too long (max 500 characters)'
      });
    }
  }

  // Validate pagination parameters
  if (input.page && input.page < 1) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Page number must be greater than 0'
    });
  }

  if (input.limit && (input.limit < 1 || input.limit > 100)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Limit must be between 1 and 100'
    });
  }

  // Sanitize sort parameters
  if (input.sortBy) {
    input.sortBy = DataSanitizer.sanitizeHtml(input.sortBy, { stripTags: true });
  }

  return next();
};

/**
 * Export all validation utilities for router integration
 */
export default {
  createValidatedProcedure,
  RouterValidationConfigs,
  applyValidationToRouter,
  bulkOperationMiddleware,
  fileUploadValidationMiddleware,
  searchValidationMiddleware,
  ValidationSchemas,
  ConstraintValidator,
  DataSanitizer
};