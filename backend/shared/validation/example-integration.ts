/**
 * Example Integration of Comprehensive Validation System
 * Demonstrates how to apply validation to existing tRPC routers
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc/router';
import { ValidationSchemas } from './schemas';
import { createValidatedProcedure, RouterValidationConfigs } from './router-integration';
import { ConstraintValidator } from './constraints';
import { DataSanitizer } from './sanitizer';

/**
 * Example: Enhanced AI Router with Comprehensive Validation
 */
export const enhancedAIRouter = router({
  // Chat endpoint with full validation
  chat: createValidatedProcedure(protectedProcedure, {
    inputSchema: z.object({
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
    operation: 'create',
    rateLimitConfig: { maxRequests: 50, windowMs: 60000 },
    auditAction: 'ai.chat'
  }).mutation(async ({ input, ctx }) => {
    // Input is already validated and sanitized by middleware
    console.log('Processing validated chat request:', {
      userId: ctx.user.id,
      messageLength: input.message.length,
      provider: input.provider
    });

    // Simulate AI processing
    const response = {
      content: `AI response to: ${input.message.substring(0, 50)}...`,
      model: input.model || 'default-model',
      provider: input.provider,
      tokensUsed: Math.floor(Math.random() * 100) + 50,
      cost: input.provider === 'ollama' ? 0 : Math.random() * 0.01,
      conversationId: input.conversationId || Math.floor(Math.random() * 1000),
      messageId: Math.floor(Math.random() * 10000)
    };

    return response;
  }),

  // Create prompt with validation
  createPrompt: createValidatedProcedure(protectedProcedure, {
    inputSchema: ValidationSchemas.CreatePrompt,
    tableName: 'prompts',
    operation: 'create',
    rateLimitConfig: { maxRequests: 20, windowMs: 60000 },
    auditAction: 'ai.prompt.create'
  }).mutation(async ({ input, ctx }) => {
    console.log('Creating validated prompt:', {
      name: input.name,
      category: input.category,
      userId: ctx.user.id
    });

    // Simulate database insertion
    const prompt = {
      id: Math.floor(Math.random() * 1000),
      ...input,
      createdBy: ctx.user.id,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return prompt;
  })
});

/**
 * Example: Enhanced CRM Router with Comprehensive Validation
 */
export const enhancedCRMRouter = router({
  // Create contact with full validation
  createContact: createValidatedProcedure(protectedProcedure, {
    inputSchema: ValidationSchemas.CreateContact,
    tableName: 'contacts',
    operation: 'create',
    rateLimitConfig: { maxRequests: 100, windowMs: 60000 },
    auditAction: 'crm.contact.create'
  }).mutation(async ({ input, ctx }) => {
    console.log('Creating validated contact:', {
      email: input.email,
      company: input.company,
      contactType: input.contactType
    });

    // Simulate database insertion with constraint validation
    const contact = {
      id: Math.floor(Math.random() * 1000),
      ...input,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return contact;
  }),

  // Create deal with validation
  createDeal: createValidatedProcedure(protectedProcedure, {
    inputSchema: ValidationSchemas.CreateDeal,
    tableName: 'deals',
    operation: 'create',
    rateLimitConfig: { maxRequests: 50, windowMs: 60000 },
    auditAction: 'crm.deal.create'
  }).mutation(async ({ input, ctx }) => {
    console.log('Creating validated deal:', {
      title: input.title,
      value: input.value,
      stage: input.stage,
      probability: input.probability
    });

    // Simulate database insertion
    const deal = {
      id: Math.floor(Math.random() * 1000),
      ...input,
      ownerId: ctx.user.id,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return deal;
  })
});

/**
 * Example: Enhanced School Hub Router with Comprehensive Validation
 */
export const enhancedSchoolHubRouter = router({
  // Create course with validation
  createCourse: createValidatedProcedure(protectedProcedure, {
    inputSchema: ValidationSchemas.CreateCourse,
    tableName: 'courses',
    operation: 'create',
    rateLimitConfig: { maxRequests: 30, windowMs: 60000 },
    auditAction: 'school.course.create'
  }).mutation(async ({ input, ctx }) => {
    console.log('Creating validated course:', {
      name: input.name,
      schoolId: input.schoolId,
      credits: input.credits
    });

    const course = {
      id: Math.floor(Math.random() * 1000),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return course;
  }),

  // Create assignment with validation
  createAssignment: createValidatedProcedure(protectedProcedure, {
    inputSchema: ValidationSchemas.CreateAssignment,
    tableName: 'assignments',
    operation: 'create',
    rateLimitConfig: { maxRequests: 50, windowMs: 60000 },
    auditAction: 'school.assignment.create'
  }).mutation(async ({ input, ctx }) => {
    console.log('Creating validated assignment:', {
      title: input.title,
      classId: input.classId,
      pointsPossible: input.pointsPossible,
      dueDate: input.dueDate
    });

    const assignment = {
      id: Math.floor(Math.random() * 1000),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return assignment;
  }),

  // Grade submission with validation
  gradeSubmission: createValidatedProcedure(protectedProcedure, {
    inputSchema: ValidationSchemas.UpdateSubmission,
    tableName: 'submissions',
    operation: 'update',
    rateLimitConfig: { maxRequests: 100, windowMs: 60000 },
    auditAction: 'school.submission.grade'
  }).mutation(async ({ input, ctx }) => {
    console.log('Grading validated submission:', {
      pointsEarned: input.pointsEarned,
      feedback: input.feedback ? 'Feedback provided' : 'No feedback'
    });

    const gradedSubmission = {
      ...input,
      gradedAt: new Date().toISOString(),
      gradedBy: ctx.user.id,
      updatedAt: new Date().toISOString()
    };

    return gradedSubmission;
  })
});

/**
 * Example: Analytics Router with Public Endpoints and Validation
 */
export const enhancedAnalyticsRouter = router({
  // Track event (public endpoint with validation)
  trackEvent: createValidatedProcedure(publicProcedure, {
    inputSchema: ValidationSchemas.CreateAnalyticsEvent,
    tableName: 'analytics_events',
    operation: 'create',
    rateLimitConfig: { maxRequests: 200, windowMs: 60000 },
    requiresAuth: false,
    auditAction: 'analytics.event.track'
  }).mutation(async ({ input }) => {
    console.log('Tracking validated event:', {
      eventName: input.eventName,
      eventCategory: input.eventCategory,
      userId: input.userId || 'anonymous'
    });

    const event = {
      id: Math.floor(Math.random() * 10000),
      ...input,
      createdAt: new Date().toISOString()
    };

    return { success: true, eventId: event.id };
  }),

  // Track page view (high volume, minimal validation)
  trackPageView: createValidatedProcedure(publicProcedure, {
    inputSchema: z.object({
      userId: z.number().optional(),
      sessionId: z.string().min(1).max(255),
      pageUrl: z.string().url(),
      pageTitle: z.string().max(255).optional(),
      referrer: z.string().url().optional(),
      userAgent: z.string().optional(),
      timestamp: z.date().default(() => new Date())
    }),
    tableName: 'page_views',
    operation: 'create',
    rateLimitConfig: { maxRequests: 500, windowMs: 60000 },
    requiresAuth: false,
    auditAction: 'analytics.pageview.track'
  }).mutation(async ({ input }) => {
    console.log('Tracking page view:', {
      pageUrl: input.pageUrl,
      userId: input.userId || 'anonymous'
    });

    return { success: true };
  })
});

/**
 * Example: Bulk Operations with Validation
 */
export const enhancedBulkRouter = router({
  // Bulk create contacts
  bulkCreateContacts: protectedProcedure
    .input(z.object({
      contacts: z.array(ValidationSchemas.CreateContact).min(1).max(100)
    }))
    .mutation(async ({ input, ctx }) => {
      const results = [];
      const errors = [];

      for (let i = 0; i < input.contacts.length; i++) {
        const contact = input.contacts[i];
        
        try {
          // Validate each contact
          await ConstraintValidator.validateConstraints('contacts', contact, 'create');
          
          // Sanitize contact data
          const sanitizedContact = DataSanitizer.sanitizeJson(contact);
          
          // Simulate creation
          const createdContact = {
            id: Math.floor(Math.random() * 1000) + i,
            ...sanitizedContact,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          results.push(createdContact);
        } catch (error) {
          errors.push({
            index: i,
            contact: contact.email,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return {
        success: errors.length === 0,
        created: results.length,
        errors: errors.length,
        results,
        errorDetails: errors
      };
    })
});

/**
 * Example: File Upload with Validation
 */
export const enhancedFileRouter = router({
  // Upload file with comprehensive validation
  uploadFile: createValidatedProcedure(protectedProcedure, {
    inputSchema: ValidationSchemas.FileUpload,
    tableName: 'file_uploads',
    operation: 'create',
    rateLimitConfig: { maxRequests: 20, windowMs: 60000 },
    auditAction: 'storage.file.upload',
    customMiddleware: [
      // Custom file validation middleware
      async ({ input, next }) => {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif',
          'application/pdf', 'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (input.size > maxSize) {
          throw new Error(`File size ${input.size} exceeds maximum of ${maxSize} bytes`);
        }

        if (!allowedTypes.includes(input.mimetype)) {
          throw new Error(`File type ${input.mimetype} is not allowed`);
        }

        // Sanitize filename
        input.filename = DataSanitizer.sanitizeFileName(input.filename);

        return next();
      }
    ]
  }).mutation(async ({ input, ctx }) => {
    console.log('Uploading validated file:', {
      filename: input.filename,
      size: input.size,
      mimetype: input.mimetype,
      userId: ctx.user.id
    });

    const fileRecord = {
      id: Math.floor(Math.random() * 1000),
      ...input,
      uploadedBy: ctx.user.id,
      uploadedAt: new Date().toISOString()
    };

    return fileRecord;
  })
});

/**
 * Example: Search with Validation
 */
export const enhancedSearchRouter = router({
  // Search with comprehensive input validation
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1).max(500),
      type: z.enum(['users', 'courses', 'assignments', 'contacts']),
      filters: z.record(z.any()).default({}),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).default('desc')
    }))
    .use(async ({ input, next }) => {
      // Sanitize search query
      input.query = DataSanitizer.sanitizeSearchQuery(input.query);
      
      // Sanitize sort field
      if (input.sortBy) {
        input.sortBy = DataSanitizer.sanitizeHtml(input.sortBy, { stripTags: true });
      }

      return next();
    })
    .query(async ({ input, ctx }) => {
      console.log('Processing validated search:', {
        query: input.query,
        type: input.type,
        userId: ctx.user.id
      });

      // Simulate search results
      const results = Array.from({ length: Math.min(input.limit, 10) }, (_, i) => ({
        id: i + 1,
        title: `Result ${i + 1} for "${input.query}"`,
        type: input.type,
        relevance: Math.random()
      }));

      return {
        results,
        total: 50,
        page: input.page,
        limit: input.limit,
        hasMore: input.page * input.limit < 50
      };
    })
});

/**
 * Example: Complete Router with All Validation Features
 */
export const completeValidatedRouter = router({
  ai: enhancedAIRouter,
  crm: enhancedCRMRouter,
  schoolHub: enhancedSchoolHubRouter,
  analytics: enhancedAnalyticsRouter,
  bulk: enhancedBulkRouter,
  files: enhancedFileRouter,
  search: enhancedSearchRouter
});

/**
 * Usage Examples and Documentation
 */
export const ValidationExamples = {
  // Example 1: Basic validation usage
  basicUsage: `
    // Apply validation to a simple procedure
    const validatedProcedure = createValidatedProcedure(protectedProcedure, {
      inputSchema: z.object({
        name: z.string().min(1).max(100),
        email: z.string().email()
      }),
      tableName: 'users',
      operation: 'create',
      auditAction: 'user.create'
    });
  `,

  // Example 2: Custom validation middleware
  customMiddleware: `
    // Add custom validation logic
    const customValidatedProcedure = createValidatedProcedure(protectedProcedure, {
      inputSchema: ValidationSchemas.CreateUser,
      tableName: 'users',
      operation: 'create',
      customMiddleware: [
        async ({ input, next }) => {
          // Custom business logic validation
          if (input.role === 'admin' && !input.mfa_enabled) {
            throw new Error('Admin users must have MFA enabled');
          }
          return next();
        }
      ]
    });
  `,

  // Example 3: Bulk operations
  bulkOperations: `
    // Validate bulk operations
    const bulkProcedure = protectedProcedure
      .input(z.object({
        items: z.array(ValidationSchemas.CreateContact).min(1).max(100)
      }))
      .use(bulkOperationMiddleware('contacts', 'create'))
      .mutation(async ({ input }) => {
        // Process validated bulk items
        return { created: input.items.length };
      });
  `,

  // Example 4: File upload validation
  fileUpload: `
    // Validate file uploads
    const uploadProcedure = protectedProcedure
      .input(ValidationSchemas.FileUpload)
      .use(fileUploadValidationMiddleware({
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        maxFiles: 5
      }))
      .mutation(async ({ input }) => {
        // Process validated file
        return { uploaded: true };
      });
  `
};

export default {
  enhancedAIRouter,
  enhancedCRMRouter,
  enhancedSchoolHubRouter,
  enhancedAnalyticsRouter,
  enhancedBulkRouter,
  enhancedFileRouter,
  enhancedSearchRouter,
  completeValidatedRouter,
  ValidationExamples
};