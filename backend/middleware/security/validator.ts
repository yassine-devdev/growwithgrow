import { z } from 'zod';
import { validateAndSanitize } from './sanitizer';
import { SecurityContext, SecurityViolation, SecurityViolationType } from './types';

// Common validation schemas
export const CommonSchemas = {
  // Email validation
  email: z.string().email().max(255),
  
  // Password validation (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  // Name validation (letters, spaces, hyphens, apostrophes)
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  // Phone number validation
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters'),
  
  // URL validation
  url: z.string().url().max(2048),
  
  // ID validation (positive integer)
  id: z.number().int().positive(),
  
  // Text content validation
  text: z.string().max(10000, 'Text content too long'),
  
  // Search query validation
  searchQuery: z.string()
    .min(1, 'Search query cannot be empty')
    .max(200, 'Search query too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, 'Search query contains invalid characters'),
  
  // Pagination parameters
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),
  
  // Date range validation
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  }).refine(data => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  }, 'Start date must be before end date'),
  
  // File upload validation
  fileUpload: z.object({
    filename: z.string().min(1).max(255),
    mimetype: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/),
    size: z.number().int().min(1).max(10 * 1024 * 1024) // 10MB max
  })
};

// Request validation middleware
export class RequestValidator {
  // Validate request body
  static validateBody<T>(
    body: unknown,
    schema: z.ZodSchema<T>,
    context: SecurityContext
  ): {
    success: boolean;
    data?: T;
    errors?: string[];
    violations?: SecurityViolation[];
  } {
    const result = validateAndSanitize(body, schema, true);
    
    if (!result.success) {
      const errors = result.error?.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ) || ['Validation failed'];
      
      const violation: SecurityViolation = {
        type: SecurityViolationType.INVALID_INPUT,
        ip: context.ip,
        userAgent: context.userAgent,
        details: {
          errors,
          input: typeof body === 'object' ? '[OBJECT]' : String(body)
        },
        timestamp: context.timestamp,
        severity: 'low'
      };
      
      return {
        success: false,
        errors,
        violations: [violation, ...(result.violations || [])]
      };
    }
    
    return {
      success: true,
      data: result.data,
      violations: result.violations
    };
  }
  
  // Validate query parameters
  static validateQuery<T>(
    query: unknown,
    schema: z.ZodSchema<T>,
    context: SecurityContext
  ): {
    success: boolean;
    data?: T;
    errors?: string[];
    violations?: SecurityViolation[];
  } {
    // Query parameters are typically strings, so we need to transform them
    const transformedQuery = this.transformQueryParams(query);
    return this.validateBody(transformedQuery, schema, context);
  }
  
  // Transform query parameters to appropriate types
  private static transformQueryParams(query: unknown): any {
    if (typeof query !== 'object' || query === null) {
      return query;
    }
    
    const transformed: any = {};
    
    Object.entries(query as Record<string, any>).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Try to convert string values to appropriate types
        if (value === 'true') {
          transformed[key] = true;
        } else if (value === 'false') {
          transformed[key] = false;
        } else if (/^\d+$/.test(value)) {
          transformed[key] = parseInt(value, 10);
        } else if (/^\d+\.\d+$/.test(value)) {
          transformed[key] = parseFloat(value);
        } else {
          transformed[key] = value;
        }
      } else {
        transformed[key] = value;
      }
    });
    
    return transformed;
  }
  
  // Validate request headers
  static validateHeaders(
    headers: Record<string, string>,
    requiredHeaders: string[] = []
  ): {
    valid: boolean;
    missing: string[];
    suspicious: string[];
  } {
    const missing: string[] = [];
    const suspicious: string[] = [];
    
    // Check for required headers
    requiredHeaders.forEach(header => {
      if (!headers[header.toLowerCase()]) {
        missing.push(header);
      }
    });
    
    // Check for suspicious headers
    Object.entries(headers).forEach(([key, value]) => {
      // Check for potential header injection
      if (value.includes('\n') || value.includes('\r')) {
        suspicious.push(`${key}: Header injection attempt`);
      }
      
      // Check for suspicious user agents
      if (key.toLowerCase() === 'user-agent') {
        const suspiciousPatterns = [
          /sqlmap/i,
          /nikto/i,
          /nmap/i,
          /masscan/i,
          /zap/i,
          /burp/i,
          /wget/i,
          /curl.*bot/i
        ];
        
        if (suspiciousPatterns.some(pattern => pattern.test(value))) {
          suspicious.push(`${key}: Suspicious user agent`);
        }
      }
      
      // Check for overly long headers
      if (value.length > 8192) {
        suspicious.push(`${key}: Header value too long`);
      }
    });
    
    return {
      valid: missing.length === 0 && suspicious.length === 0,
      missing,
      suspicious
    };
  }
  
  // Create validation middleware for tRPC
  static createTRPCValidator<T>(schema: z.ZodSchema<T>) {
    return (input: unknown, context: SecurityContext) => {
      return this.validateBody(input, schema, context);
    };
  }
  
  // Validate file uploads
  static validateFileUpload(
    file: any,
    allowedTypes: string[] = [],
    maxSize: number = 10 * 1024 * 1024 // 10MB
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!file) {
      errors.push('No file provided');
      return { valid: false, errors };
    }
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }
    
    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }
    
    // Check filename for suspicious patterns
    const suspiciousPatterns = [
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Invalid filename characters
      /\.(exe|bat|cmd|scr|pif|com)$/i,  // Executable files
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i  // Reserved Windows names
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(file.filename))) {
      errors.push('Filename contains invalid or suspicious characters');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export common validation functions
export const validateBody = RequestValidator.validateBody.bind(RequestValidator);
export const validateQuery = RequestValidator.validateQuery.bind(RequestValidator);
export const validateHeaders = RequestValidator.validateHeaders.bind(RequestValidator);
export const validateFileUpload = RequestValidator.validateFileUpload.bind(RequestValidator);