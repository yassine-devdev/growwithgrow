/**
 * Unit tests for validation utilities
 * Tests input validation, sanitization, and data integrity checks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// Mock validation utilities
const mockValidationUtils = {
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .trim();
  },
  
  validatePhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },
  
  validateURL: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  validateUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },
  
  validateDate: (date: string): boolean => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  },
  
  validateAge: (birthDate: string): { isValid: boolean; age?: number; error?: string } => {
    if (!mockValidationUtils.validateDate(birthDate)) {
      return { isValid: false, error: 'Invalid date format' };
    }
    
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return { isValid: true, age: age - 1 };
    }
    
    return { isValid: true, age };
  },
  
  validateSchoolType: (type: string): boolean => {
    const validTypes = ['elementary', 'middle', 'high', 'university', 'other'];
    return validTypes.includes(type.toLowerCase());
  },
  
  validateUserRole: (role: string): boolean => {
    const validRoles = ['student', 'teacher', 'admin', 'parent', 'staff'];
    return validRoles.includes(role.toLowerCase());
  },
};

// Zod schemas for testing
const userSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(8),
  role: z.enum(['student', 'teacher', 'admin', 'parent', 'staff']),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

const schoolSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['elementary', 'middle', 'high', 'university', 'other']),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

const aiRequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  provider: z.enum(['openrouter', 'ollama', 'gemini']).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
  systemPrompt: z.string().max(5000).optional(),
});

describe('Validation Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('email validation', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com',
      ];

      validEmails.forEach(email => {
        expect(mockValidationUtils.validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(mockValidationUtils.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('password validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MySecure@Pass1',
        'Complex#Password9',
        'Strong$Pass123',
      ];

      strongPasswords.forEach(password => {
        const result = mockValidationUtils.validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'weak',
        'password',
        'PASSWORD',
        '12345678',
        'Password',
        'password123',
        'PASSWORD123',
      ];

      weakPasswords.forEach(password => {
        const result = mockValidationUtils.validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should provide specific error messages', () => {
      const result = mockValidationUtils.validatePassword('weak');
      
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('input sanitization', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = mockValidationUtils.sanitizeInput(input);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
      expect(sanitized).toContain('Hello World');
    });

    it('should remove quotes', () => {
      const input = 'Hello "World" and \'Universe\'';
      const sanitized = mockValidationUtils.sanitizeInput(input);
      
      expect(sanitized).not.toContain('"');
      expect(sanitized).not.toContain("'");
      expect(sanitized).toContain('Hello World and Universe');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const sanitized = mockValidationUtils.sanitizeInput(input);
      
      expect(sanitized).toBe('Hello World');
    });

    it('should handle empty strings', () => {
      const input = '';
      const sanitized = mockValidationUtils.sanitizeInput(input);
      
      expect(sanitized).toBe('');
    });
  });

  describe('phone number validation', () => {
    it('should validate correct phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '(555) 123-4567',
        '555-123-4567',
        '555 123 4567',
        '+44 20 7946 0958',
        '1234567890',
      ];

      validPhones.forEach(phone => {
        expect(mockValidationUtils.validatePhoneNumber(phone)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        'abc-def-ghij',
        '555-12-34',
        '',
        '++1234567890',
      ];

      invalidPhones.forEach(phone => {
        expect(mockValidationUtils.validatePhoneNumber(phone)).toBe(false);
      });
    });
  });

  describe('URL validation', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://subdomain.example.co.uk/path?query=value',
        'ftp://files.example.com',
      ];

      validUrls.forEach(url => {
        expect(mockValidationUtils.validateURL(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'http://',
        'https://',
        'example.com', // Missing protocol
        '',
      ];

      invalidUrls.forEach(url => {
        expect(mockValidationUtils.validateURL(url)).toBe(false);
      });
    });
  });

  describe('UUID validation', () => {
    it('should validate correct UUIDs', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ];

      validUuids.forEach(uuid => {
        expect(mockValidationUtils.validateUUID(uuid)).toBe(true);
      });
    });

    it('should reject invalid UUIDs', () => {
      const invalidUuids = [
        'not-a-uuid',
        '123e4567-e89b-12d3-a456',
        '123e4567-e89b-12d3-a456-426614174000-extra',
        '',
        '123e4567e89b12d3a456426614174000', // Missing hyphens
      ];

      invalidUuids.forEach(uuid => {
        expect(mockValidationUtils.validateUUID(uuid)).toBe(false);
      });
    });
  });

  describe('date validation', () => {
    it('should validate correct dates', () => {
      const validDates = [
        '2024-01-01',
        '2024-12-31T23:59:59Z',
        'January 1, 2024',
        '01/01/2024',
      ];

      validDates.forEach(date => {
        expect(mockValidationUtils.validateDate(date)).toBe(true);
      });
    });

    it('should reject invalid dates', () => {
      const invalidDates = [
        'not-a-date',
        '2024-13-01', // Invalid month
        '2024-01-32', // Invalid day
        '',
        '2024/02/30', // Invalid date
      ];

      invalidDates.forEach(date => {
        expect(mockValidationUtils.validateDate(date)).toBe(false);
      });
    });
  });

  describe('age validation', () => {
    it('should calculate age correctly', () => {
      const birthDate = '2000-01-01';
      const result = mockValidationUtils.validateAge(birthDate);
      
      expect(result.isValid).toBe(true);
      expect(result.age).toBeGreaterThan(20);
      expect(result.age).toBeLessThan(30);
    });

    it('should handle invalid birth dates', () => {
      const invalidDate = 'invalid-date';
      const result = mockValidationUtils.validateAge(invalidDate);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid date format');
    });

    it('should handle future dates', () => {
      const futureDate = '2030-01-01';
      const result = mockValidationUtils.validateAge(futureDate);
      
      expect(result.isValid).toBe(true);
      expect(result.age).toBeLessThan(0);
    });
  });

  describe('school type validation', () => {
    it('should validate correct school types', () => {
      const validTypes = ['elementary', 'middle', 'high', 'university', 'other'];
      
      validTypes.forEach(type => {
        expect(mockValidationUtils.validateSchoolType(type)).toBe(true);
        expect(mockValidationUtils.validateSchoolType(type.toUpperCase())).toBe(true);
      });
    });

    it('should reject invalid school types', () => {
      const invalidTypes = ['primary', 'secondary', 'college', 'kindergarten', ''];
      
      invalidTypes.forEach(type => {
        expect(mockValidationUtils.validateSchoolType(type)).toBe(false);
      });
    });
  });

  describe('user role validation', () => {
    it('should validate correct user roles', () => {
      const validRoles = ['student', 'teacher', 'admin', 'parent', 'staff'];
      
      validRoles.forEach(role => {
        expect(mockValidationUtils.validateUserRole(role)).toBe(true);
        expect(mockValidationUtils.validateUserRole(role.toUpperCase())).toBe(true);
      });
    });

    it('should reject invalid user roles', () => {
      const invalidRoles = ['user', 'guest', 'moderator', 'owner', ''];
      
      invalidRoles.forEach(role => {
        expect(mockValidationUtils.validateUserRole(role)).toBe(false);
      });
    });
  });

  describe('Zod schema validation', () => {
    describe('user schema', () => {
      it('should validate correct user data', () => {
        const validUser = {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'SecurePass123!',
          role: 'student' as const,
          phone: '+1234567890',
          dateOfBirth: '2000-01-01',
        };

        const result = userSchema.safeParse(validUser);
        expect(result.success).toBe(true);
      });

      it('should reject invalid user data', () => {
        const invalidUser = {
          email: 'invalid-email',
          firstName: '',
          lastName: 'Doe',
          password: 'weak',
          role: 'invalid-role',
        };

        const result = userSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });

      it('should handle optional fields', () => {
        const minimalUser = {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'SecurePass123!',
          role: 'student' as const,
        };

        const result = userSchema.safeParse(minimalUser);
        expect(result.success).toBe(true);
      });
    });

    describe('school schema', () => {
      it('should validate correct school data', () => {
        const validSchool = {
          name: 'Test Elementary School',
          type: 'elementary' as const,
          address: '123 Main St, City, State',
          phone: '+1234567890',
          email: 'info@school.edu',
          website: 'https://school.edu',
        };

        const result = schoolSchema.safeParse(validSchool);
        expect(result.success).toBe(true);
      });

      it('should reject invalid school data', () => {
        const invalidSchool = {
          name: '',
          type: 'invalid-type',
          email: 'invalid-email',
          website: 'not-a-url',
        };

        const result = schoolSchema.safeParse(invalidSchool);
        expect(result.success).toBe(false);
      });
    });

    describe('AI request schema', () => {
      it('should validate correct AI request data', () => {
        const validRequest = {
          prompt: 'Hello, AI!',
          provider: 'openrouter' as const,
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 1000,
          systemPrompt: 'You are a helpful assistant.',
        };

        const result = aiRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should reject invalid AI request data', () => {
        const invalidRequest = {
          prompt: '',
          provider: 'invalid-provider',
          temperature: 3, // Too high
          maxTokens: -1, // Negative
        };

        const result = aiRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should handle minimal AI request', () => {
        const minimalRequest = {
          prompt: 'Simple question',
        };

        const result = aiRequestSchema.safeParse(minimalRequest);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined values', () => {
      expect(mockValidationUtils.validateEmail(null as any)).toBe(false);
      expect(mockValidationUtils.validateEmail(undefined as any)).toBe(false);
      expect(mockValidationUtils.sanitizeInput(null as any)).toBe('');
      expect(mockValidationUtils.sanitizeInput(undefined as any)).toBe('');
    });

    it('should handle very long inputs', () => {
      const longString = 'a'.repeat(10000);
      const sanitized = mockValidationUtils.sanitizeInput(longString);
      
      expect(sanitized).toBe(longString);
    });

    it('should handle special characters in validation', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const sanitized = mockValidationUtils.sanitizeInput(specialChars);
      
      // Should remove < and > but keep others
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).toContain('!@#$%^&*()_+-=[]{}|;:,.');
    });
  });
});