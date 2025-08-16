import { describe, it, expect, beforeEach } from 'vitest';
import { SecurityMiddleware } from './index';
import { rateLimiter } from './rate-limiter';
import { corsHandler } from './cors';
import { helmetHandler } from './helmet';
import { validateBody, CommonSchemas } from './validator';
import { sanitizeText, sanitizeObject, detectXssAttempt } from './sanitizer';

describe('Security Middleware', () => {
  describe('SecurityMiddleware', () => {
    it('should create security context from request', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0',
          'origin': 'http://localhost:3000'
        },
        connection: {
          remoteAddress: '127.0.0.1'
        }
      };

      const context = SecurityMiddleware.createSecurityContext(mockReq);

      expect(context.ip).toBe('192.168.1.1');
      expect(context.userAgent).toBe('Mozilla/5.0');
      expect(context.origin).toBe('http://localhost:3000');
      expect(context.requestId).toMatch(/^req_/);
      expect(context.timestamp).toBeInstanceOf(Date);
    });

    it('should apply security middleware successfully', async () => {
      const mockReq = {
        method: 'GET',
        headers: {
          'origin': 'http://localhost:3000',
          'user-agent': 'Mozilla/5.0'
        },
        connection: {
          remoteAddress: '127.0.0.1'
        }
      };

      const result = await SecurityMiddleware.applySecurityMiddleware(mockReq, null);

      expect(result.allowed).toBe(true);
      expect(result.headers).toHaveProperty('Content-Security-Policy');
      expect(result.headers).toHaveProperty('X-Frame-Options');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin');
      expect(result.violations).toBeInstanceOf(Array);
    });
  });

  describe('CORS Handler', () => {
    it('should allow valid origins', () => {
      expect(corsHandler.isOriginAllowed('http://localhost:3000')).toBe(true);
      expect(corsHandler.isOriginAllowed('http://localhost:5173')).toBe(true);
      expect(corsHandler.isOriginAllowed(undefined)).toBe(true); // No origin
    });

    it('should reject invalid origins', () => {
      expect(corsHandler.isOriginAllowed('http://malicious.com')).toBe(false);
      expect(corsHandler.isOriginAllowed('https://evil.site')).toBe(false);
    });

    it('should generate proper CORS headers', () => {
      const headers = corsHandler.generateCorsHeaders('http://localhost:3000');
      
      expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
      expect(headers['Access-Control-Allow-Methods']).toContain('GET');
      expect(headers['Access-Control-Allow-Headers']).toContain('Content-Type');
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });
  });

  describe('Rate Limiter', () => {
    beforeEach(async () => {
      // Reset rate limiter for each test
      const context = {
        ip: '127.0.0.1',
        requestId: 'test',
        timestamp: new Date()
      };
      await rateLimiter.resetRateLimit(context);
    });

    it('should allow requests within limit', async () => {
      const context = {
        ip: '127.0.0.1',
        requestId: 'test',
        timestamp: new Date()
      };

      const result = await rateLimiter.checkRateLimit(context);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should track multiple requests from same IP', async () => {
      const context = {
        ip: '127.0.0.1',
        requestId: 'test',
        timestamp: new Date()
      };

      // Make first request
      const result1 = await rateLimiter.checkRateLimit(context);
      expect(result1.allowed).toBe(true);
      
      // Make second request
      const result2 = await rateLimiter.checkRateLimit(context);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(result1.remaining - 1);
    });
  });

  describe('Helmet Handler', () => {
    it('should generate security headers', () => {
      const headers = helmetHandler.generateSecurityHeaders();
      
      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('X-Frame-Options');
      expect(headers).toHaveProperty('X-Content-Type-Options');
      expect(headers).toHaveProperty('Referrer-Policy');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    });

    it('should validate response headers', () => {
      const secureHeaders = helmetHandler.generateSecurityHeaders();
      const validation = helmetHandler.validateResponseHeaders(secureHeaders);
      
      expect(validation.secure).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should detect insecure headers', () => {
      const insecureHeaders = {
        'X-Frame-Options': 'ALLOWALL', // Invalid value
        'Content-Security-Policy': "default-src 'unsafe-eval'" // Unsafe in production
      };
      
      const validation = helmetHandler.validateResponseHeaders(insecureHeaders);
      
      expect(validation.secure).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Input Sanitizer', () => {
    it('should sanitize text input', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeText(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('Hello World');
    });

    it('should sanitize object recursively', () => {
      const maliciousObject = {
        name: 'John<script>alert("xss")</script>',
        email: 'john@example.com',
        nested: {
          description: 'javascript:alert("xss")'
        }
      };
      
      const sanitized = sanitizeObject(maliciousObject);
      
      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.nested.description).not.toContain('javascript:');
      expect(sanitized.email).toBe('john@example.com'); // Should remain unchanged
    });

    it('should detect XSS attempts', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img onerror="alert(1)" src="x">',
        'vbscript:msgbox("xss")'
      ];
      
      xssAttempts.forEach(attempt => {
        const result = detectXssAttempt(attempt);
        expect(result.isXss).toBe(true);
        expect(result.patterns.length).toBeGreaterThan(0);
      });
    });

    it('should not flag safe content as XSS', () => {
      const safeContent = [
        'Hello World',
        'user@example.com',
        'This is a normal description',
        '123-456-7890'
      ];
      
      safeContent.forEach(content => {
        const result = detectXssAttempt(content);
        expect(result.isXss).toBe(false);
      });
    });
  });

  describe('Request Validator', () => {
    it('should validate email format', () => {
      const validEmails = ['user@example.com', 'test.email+tag@domain.co.uk'];
      const invalidEmails = ['invalid-email', '@domain.com', 'user@'];
      
      validEmails.forEach(email => {
        const result = CommonSchemas.email.safeParse(email);
        expect(result.success).toBe(true);
      });
      
      invalidEmails.forEach(email => {
        const result = CommonSchemas.email.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('should validate password strength', () => {
      const validPasswords = ['Password123', 'MySecure1Pass', 'Complex9Password'];
      const invalidPasswords = ['weak', 'password', '12345678', 'PASSWORD123'];
      
      validPasswords.forEach(password => {
        const result = CommonSchemas.password.safeParse(password);
        expect(result.success).toBe(true);
      });
      
      invalidPasswords.forEach(password => {
        const result = CommonSchemas.password.safeParse(password);
        expect(result.success).toBe(false);
      });
    });

    it('should validate and sanitize request body', () => {
      const schema = CommonSchemas.email;
      const context = {
        ip: '127.0.0.1',
        requestId: 'test',
        timestamp: new Date()
      };
      
      const validResult = validateBody('user@example.com', schema, context);
      expect(validResult.success).toBe(true);
      expect(validResult.data).toBe('user@example.com');
      
      const invalidResult = validateBody('invalid-email', schema, context);
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.errors).toBeDefined();
    });
  });
});