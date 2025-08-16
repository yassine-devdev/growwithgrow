import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { z } from 'zod';
import { securityConfig } from './config';
import { SecurityViolation, SecurityViolationType } from './types';

// Initialize DOMPurify with JSDOM
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

// Configure DOMPurify based on security config
const configurePurify = () => {
  const config = securityConfig.sanitization;
  
  purify.setConfig({
    ALLOWED_TAGS: config.allowedTags,
    ALLOWED_ATTR: Object.keys(config.allowedAttributes),
    STRIP_IGNORE_TAG: config.stripIgnoreTag,
    STRIP_IGNORE_TAG_BODY: config.stripIgnoreTagBody,
    KEEP_CONTENT: false,
    IN_PLACE: false
  });
};

// Initialize purify configuration
configurePurify();

export class InputSanitizer {
  // Sanitize HTML content
  static sanitizeHtml(input: string): string {
    if (typeof input !== 'string') {
      return String(input);
    }
    
    return purify.sanitize(input, {
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false
    });
  }
  
  // Sanitize plain text (remove potential XSS vectors)
  static sanitizeText(input: string): string {
    if (typeof input !== 'string') {
      return String(input);
    }
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:text\/html/gi, '') // Remove data URLs with HTML
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .trim();
  }
  
  // Sanitize object recursively
  static sanitizeObject(obj: any, depth: number = 0): any {
    // Prevent deep recursion attacks
    if (depth > 10) {
      throw new Error('Object nesting too deep');
    }
    
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'string') {
      return this.sanitizeText(obj);
    }
    
    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, depth + 1));
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize the key as well
        const sanitizedKey = this.sanitizeText(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value, depth + 1);
      }
      
      return sanitized;
    }
    
    return obj;
  }
  
  // Check for potential XSS attempts
  static detectXssAttempt(input: string): {
    isXss: boolean;
    patterns: string[];
    severity: 'low' | 'medium' | 'high';
  } {
    if (typeof input !== 'string') {
      return { isXss: false, patterns: [], severity: 'low' };
    }
    
    const xssPatterns = [
      // Script tags
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      // Event handlers
      /on\w+\s*=/gi,
      // JavaScript protocol
      /javascript:/gi,
      // VBScript protocol
      /vbscript:/gi,
      // Data URLs with HTML
      /data:text\/html/gi,
      // Expression() CSS
      /expression\s*\(/gi,
      // Import statements
      /@import/gi,
      // Iframe tags
      /<iframe\b[^>]*>/gi,
      // Object/embed tags
      /<(object|embed)\b[^>]*>/gi,
      // Meta refresh
      /<meta\s+http-equiv\s*=\s*["\']refresh["\'][^>]*>/gi,
      // Form tags with suspicious action
      /<form\s+[^>]*action\s*=\s*["\']javascript:/gi
    ];
    
    const detectedPatterns: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' = 'low';
    
    for (const pattern of xssPatterns) {
      const matches = input.match(pattern);
      if (matches) {
        detectedPatterns.push(pattern.toString());
        
        // Determine severity based on pattern type
        if (pattern.toString().includes('script') || pattern.toString().includes('javascript')) {
          maxSeverity = 'high';
        } else if (pattern.toString().includes('on\\w+') || pattern.toString().includes('iframe')) {
          maxSeverity = maxSeverity === 'high' ? 'high' : 'medium';
        }
      }
    }
    
    return {
      isXss: detectedPatterns.length > 0,
      patterns: detectedPatterns,
      severity: maxSeverity
    };
  }
  
  // Validate and sanitize input with Zod schema
  static validateAndSanitize<T>(
    input: unknown,
    schema: z.ZodSchema<T>,
    sanitize: boolean = true
  ): {
    success: boolean;
    data?: T;
    error?: z.ZodError;
    violations?: SecurityViolation[];
  } {
    try {
      // First sanitize if requested
      const processedInput = sanitize ? this.sanitizeObject(input) : input;
      
      // Then validate with schema
      const result = schema.safeParse(processedInput);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      // Check for XSS attempts in string fields
      const violations: SecurityViolation[] = [];
      
      if (sanitize && typeof input === 'object' && input !== null) {
        const checkForXss = (obj: any, path: string = '') => {
          if (typeof obj === 'string') {
            const xssCheck = this.detectXssAttempt(obj);
            if (xssCheck.isXss) {
              violations.push({
                type: SecurityViolationType.XSS_ATTEMPT,
                ip: 'unknown', // Will be filled by middleware
                details: {
                  field: path,
                  patterns: xssCheck.patterns,
                  originalValue: obj
                },
                timestamp: new Date(),
                severity: xssCheck.severity
              });
            }
          } else if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
              checkForXss(item, `${path}[${index}]`);
            });
          } else if (typeof obj === 'object' && obj !== null) {
            Object.entries(obj).forEach(([key, value]) => {
              checkForXss(value, path ? `${path}.${key}` : key);
            });
          }
        };
        
        checkForXss(input);
      }
      
      return {
        success: true,
        data: result.data,
        violations: violations.length > 0 ? violations : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: new z.ZodError([{
          code: 'custom',
          message: `Sanitization error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          path: []
        }])
      };
    }
  }
}

// Export singleton methods
export const sanitizeHtml = InputSanitizer.sanitizeHtml.bind(InputSanitizer);
export const sanitizeText = InputSanitizer.sanitizeText.bind(InputSanitizer);
export const sanitizeObject = InputSanitizer.sanitizeObject.bind(InputSanitizer);
export const detectXssAttempt = InputSanitizer.detectXssAttempt.bind(InputSanitizer);
export const validateAndSanitize = InputSanitizer.validateAndSanitize.bind(InputSanitizer);