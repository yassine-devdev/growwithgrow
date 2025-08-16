/**
 * Advanced data sanitization utilities
 * Provides comprehensive input sanitization for security
 */

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

export class DataSanitizer {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(input: string, options?: {
    allowedTags?: string[];
    allowedAttributes?: { [key: string]: string[] };
    stripTags?: boolean;
  }): string {
    if (!input || typeof input !== 'string') return '';

    const defaultOptions = {
      ALLOWED_TAGS: options?.allowedTags || ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
      ALLOWED_ATTR: options?.allowedAttributes || {},
      STRIP_COMMENTS: true,
      STRIP_CDATA_SECTIONS: true
    };

    if (options?.stripTags) {
      return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
    }

    return DOMPurify.sanitize(input, defaultOptions);
  }

  /**
   * Sanitize and validate email addresses
   */
  static sanitizeEmail(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    const sanitized = input.toLowerCase().trim();
    
    if (!validator.isEmail(sanitized)) {
      throw new Error('Invalid email format');
    }
    
    return sanitized;
  }

  /**
   * Sanitize phone numbers
   */
  static sanitizePhone(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove all non-digit characters except +, -, (, ), and spaces
    const sanitized = input.replace(/[^\d\s\-\(\)\+\.]/g, '').trim();
    
    if (sanitized.length < 10) {
      throw new Error('Phone number too short');
    }
    
    return sanitized;
  }

  /**
   * Sanitize URLs
   */
  static sanitizeUrl(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    const trimmed = input.trim();
    
    if (!validator.isURL(trimmed, {
      protocols: ['http', 'https'],
      require_protocol: true
    })) {
      throw new Error('Invalid URL format');
    }
    
    return trimmed;
  }

  /**
   * Sanitize file names
   */
  static sanitizeFileName(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove path traversal attempts and dangerous characters
    return input
      .replace(/[\/\\:*?"<>|]/g, '')
      .replace(/\.\./g, '')
      .replace(/^\.+/, '')
      .trim()
      .substring(0, 255);
  }

  /**
   * Sanitize SQL input to prevent injection
   */
  static sanitizeSql(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Escape single quotes and remove common SQL injection patterns
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/\bUNION\b/gi, '')
      .replace(/\bSELECT\b/gi, '')
      .replace(/\bINSERT\b/gi, '')
      .replace(/\bUPDATE\b/gi, '')
      .replace(/\bDELETE\b/gi, '')
      .replace(/\bDROP\b/gi, '')
      .replace(/\bCREATE\b/gi, '')
      .replace(/\bALTER\b/gi, '')
      .trim();
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJson(input: any): any {
    if (input === null || input === undefined) return input;
    
    if (typeof input === 'string') {
      return this.sanitizeHtml(input, { stripTags: true });
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeJson(item));
    }
    
    if (typeof input === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        const sanitizedKey = this.sanitizeHtml(key, { stripTags: true });
        sanitized[sanitizedKey] = this.sanitizeJson(value);
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Sanitize search queries
   */
  static sanitizeSearchQuery(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/[<>\"']/g, '')
      .replace(/[^\w\s\-\.]/g, '')
      .trim()
      .substring(0, 500);
  }

  /**
   * Sanitize user input for display
   */
  static sanitizeForDisplay(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return validator.escape(input);
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: any, options?: {
    min?: number;
    max?: number;
    integer?: boolean;
  }): number {
    const num = Number(input);
    
    if (isNaN(num)) {
      throw new Error('Invalid number format');
    }
    
    if (options?.integer && !Number.isInteger(num)) {
      throw new Error('Must be an integer');
    }
    
    if (options?.min !== undefined && num < options.min) {
      throw new Error(`Number must be at least ${options.min}`);
    }
    
    if (options?.max !== undefined && num > options.max) {
      throw new Error(`Number must be at most ${options.max}`);
    }
    
    return num;
  }

  /**
   * Sanitize boolean input
   */
  static sanitizeBoolean(input: any): boolean {
    if (typeof input === 'boolean') return input;
    if (typeof input === 'string') {
      const lower = input.toLowerCase().trim();
      if (['true', '1', 'yes', 'on'].includes(lower)) return true;
      if (['false', '0', 'no', 'off'].includes(lower)) return false;
    }
    if (typeof input === 'number') {
      return input !== 0;
    }
    
    throw new Error('Invalid boolean value');
  }

  /**
   * Sanitize date input
   */
  static sanitizeDate(input: any): Date {
    const date = new Date(input);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    
    return date;
  }

  /**
   * Sanitize array input
   */
  static sanitizeArray<T>(
    input: any,
    itemSanitizer: (item: any) => T,
    options?: {
      maxLength?: number;
      minLength?: number;
    }
  ): T[] {
    if (!Array.isArray(input)) {
      throw new Error('Input must be an array');
    }
    
    if (options?.minLength && input.length < options.minLength) {
      throw new Error(`Array must have at least ${options.minLength} items`);
    }
    
    if (options?.maxLength && input.length > options.maxLength) {
      throw new Error(`Array must have at most ${options.maxLength} items`);
    }
    
    return input.map(itemSanitizer);
  }

  /**
   * Comprehensive input sanitization
   */
  static sanitizeInput(input: any, type: string): any {
    switch (type) {
      case 'email':
        return this.sanitizeEmail(input);
      case 'phone':
        return this.sanitizePhone(input);
      case 'url':
        return this.sanitizeUrl(input);
      case 'html':
        return this.sanitizeHtml(input);
      case 'text':
        return this.sanitizeHtml(input, { stripTags: true });
      case 'search':
        return this.sanitizeSearchQuery(input);
      case 'filename':
        return this.sanitizeFileName(input);
      case 'number':
        return this.sanitizeNumber(input);
      case 'boolean':
        return this.sanitizeBoolean(input);
      case 'date':
        return this.sanitizeDate(input);
      case 'json':
        return this.sanitizeJson(input);
      default:
        return this.sanitizeForDisplay(input);
    }
  }

  /**
   * Batch sanitize multiple inputs
   */
  static sanitizeBatch(inputs: { [key: string]: any }, schema: { [key: string]: string }): { [key: string]: any } {
    const sanitized: { [key: string]: any } = {};
    
    for (const [key, value] of Object.entries(inputs)) {
      const type = schema[key] || 'text';
      try {
        sanitized[key] = this.sanitizeInput(value, type);
      } catch (error) {
        throw new Error(`Validation failed for field '${key}': ${error.message}`);
      }
    }
    
    return sanitized;
  }

  /**
   * Remove sensitive information from logs
   */
  static sanitizeForLogging(input: any): any {
    if (!input || typeof input !== 'object') return input;
    
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'ssn', 'social', 'credit', 'card', 'cvv', 'pin'
    ];
    
    const sanitized = JSON.parse(JSON.stringify(input));
    
    const sanitizeObject = (obj: any): void => {
      if (Array.isArray(obj)) {
        obj.forEach(sanitizeObject);
      } else if (obj && typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          const lowerKey = key.toLowerCase();
          
          if (sensitiveFields.some(field => lowerKey.includes(field))) {
            obj[key] = '[REDACTED]';
          } else if (typeof value === 'object') {
            sanitizeObject(value);
          }
        }
      }
    };
    
    sanitizeObject(sanitized);
    return sanitized;
  }
}

export default DataSanitizer;