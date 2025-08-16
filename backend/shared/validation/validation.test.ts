/**
 * Comprehensive validation test suite
 * Tests all validation schemas, sanitization, and constraint checking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { ValidationSchemas } from './schemas';
import { DataSanitizer } from './sanitizer';
import { ConstraintValidator, DatabaseConstraints } from './constraints';
import { ValidationUtils } from './integration';

describe('Validation Schemas', () => {
  describe('User Validation', () => {
    it('should validate valid user creation data', () => {
      const validUser = {
        email: 'test@example.com',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student' as const,
        phone: '+1-555-123-4567',
        city: 'New York',
        country: 'USA'
      };

      expect(() => ValidationSchemas.CreateUser.parse(validUser)).not.toThrow();
    });

    it('should reject invalid email format', () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      expect(() => ValidationSchemas.CreateUser.parse(invalidUser)).toThrow();
    });

    it('should reject weak passwords', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: '123', // Too short
        firstName: 'John',
        lastName: 'Doe'
      };

      expect(() => ValidationSchemas.CreateUser.parse(invalidUser)).toThrow();
    });

    it('should validate password change with confirmation', () => {
      const validPasswordChange = {
        currentPassword: 'oldPassword123',
        newPassword: 'newSecurePassword456',
        confirmPassword: 'newSecurePassword456'
      };

      expect(() => ValidationSchemas.ChangePassword.parse(validPasswordChange)).not.toThrow();
    });

    it('should reject password change with mismatched confirmation', () => {
      const invalidPasswordChange = {
        currentPassword: 'oldPassword123',
        newPassword: 'newSecurePassword456',
        confirmPassword: 'differentPassword789'
      };

      expect(() => ValidationSchemas.ChangePassword.parse(invalidPasswordChange)).toThrow();
    });
  });

  describe('School Validation', () => {
    it('should validate valid school creation data', () => {
      const validSchool = {
        name: 'Test High School',
        schoolType: 'high' as const,
        address: '123 Education St',
        city: 'Learning City',
        state: 'CA',
        country: 'USA',
        phone: '+1-555-987-6543',
        email: 'admin@testschool.edu',
        website: 'https://testschool.edu'
      };

      expect(() => ValidationSchemas.CreateSchool.parse(validSchool)).not.toThrow();
    });

    it('should reject invalid school type', () => {
      const invalidSchool = {
        name: 'Test School',
        schoolType: 'invalid_type' as any
      };

      expect(() => ValidationSchemas.CreateSchool.parse(invalidSchool)).toThrow();
    });

    it('should reject invalid website URL', () => {
      const invalidSchool = {
        name: 'Test School',
        schoolType: 'high' as const,
        website: 'not-a-valid-url'
      };

      expect(() => ValidationSchemas.CreateSchool.parse(invalidSchool)).toThrow();
    });
  });

  describe('Course and Class Validation', () => {
    it('should validate valid course creation', () => {
      const validCourse = {
        schoolId: 1,
        name: 'Advanced Mathematics',
        code: 'MATH401',
        description: 'Advanced calculus and linear algebra',
        teacherId: 5,
        credits: 3,
        semester: 'Fall 2024',
        academicYear: '2024-2025'
      };

      expect(() => ValidationSchemas.CreateCourse.parse(validCourse)).not.toThrow();
    });

    it('should validate valid class creation', () => {
      const validClass = {
        courseId: 1,
        name: 'Math 401 - Section A',
        section: 'A',
        teacherId: 5,
        room: 'Room 201',
        maxStudents: 25
      };

      expect(() => ValidationSchemas.CreateClass.parse(validClass)).not.toThrow();
    });

    it('should reject negative credits', () => {
      const invalidCourse = {
        schoolId: 1,
        name: 'Test Course',
        credits: -1
      };

      expect(() => ValidationSchemas.CreateCourse.parse(invalidCourse)).toThrow();
    });
  });

  describe('Assignment and Submission Validation', () => {
    it('should validate valid assignment creation', () => {
      const validAssignment = {
        classId: 1,
        title: 'Homework Assignment 1',
        description: 'Complete exercises 1-10',
        instructions: 'Show all work and submit by due date',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        pointsPossible: 100,
        status: 'draft' as const
      };

      expect(() => ValidationSchemas.CreateAssignment.parse(validAssignment)).not.toThrow();
    });

    it('should validate valid submission creation', () => {
      const validSubmission = {
        assignmentId: 1,
        studentId: 10,
        content: 'My submission content here',
        fileUrls: ['https://example.com/file1.pdf', 'https://example.com/file2.docx']
      };

      expect(() => ValidationSchemas.CreateSubmission.parse(validSubmission)).not.toThrow();
    });

    it('should reject past due dates for new assignments', () => {
      const invalidAssignment = {
        classId: 1,
        title: 'Late Assignment',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      };

      expect(() => ValidationSchemas.CreateAssignment.parse(invalidAssignment)).toThrow();
    });
  });

  describe('CRM Validation', () => {
    it('should validate valid contact creation', () => {
      const validContact = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+1-555-234-5678',
        company: 'Tech Corp',
        jobTitle: 'Software Engineer',
        contactType: 'lead' as const,
        source: 'website',
        tags: ['developer', 'interested'],
        notes: 'Interested in our education platform'
      };

      expect(() => ValidationSchemas.CreateContact.parse(validContact)).not.toThrow();
    });

    it('should validate valid deal creation', () => {
      const validDeal = {
        contactId: 1,
        title: 'School District License',
        description: 'Annual license for 500 students',
        value: 50000,
        stage: 'qualification' as const,
        probability: 75,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };

      expect(() => ValidationSchemas.CreateDeal.parse(validDeal)).not.toThrow();
    });

    it('should reject invalid probability values', () => {
      const invalidDeal = {
        contactId: 1,
        title: 'Test Deal',
        value: 1000,
        probability: 150 // Invalid: > 100
      };

      expect(() => ValidationSchemas.CreateDeal.parse(invalidDeal)).toThrow();
    });
  });

  describe('AI Usage Validation', () => {
    it('should validate valid AI usage tracking', () => {
      const validUsage = {
        userId: 1,
        provider: 'openrouter' as const,
        modelName: 'gpt-3.5-turbo',
        requestType: 'chat' as const,
        tokensUsed: 150,
        cost: 0.003,
        conversationId: 5,
        promptText: 'Help me with math homework',
        responseText: 'Here is the solution...'
      };

      expect(() => ValidationSchemas.CreateAIUsage.parse(validUsage)).not.toThrow();
    });

    it('should reject negative token usage', () => {
      const invalidUsage = {
        userId: 1,
        provider: 'openrouter' as const,
        modelName: 'gpt-3.5-turbo',
        requestType: 'chat' as const,
        tokensUsed: -10, // Invalid
        cost: 0.003
      };

      expect(() => ValidationSchemas.CreateAIUsage.parse(invalidUsage)).toThrow();
    });
  });
});

describe('Data Sanitization', () => {
  describe('HTML Sanitization', () => {
    it('should remove dangerous script tags', () => {
      const maliciousInput = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const sanitized = DataSanitizer.sanitizeHtml(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('<p>Hello</p>');
      expect(sanitized).toContain('<p>World</p>');
    });

    it('should remove iframe tags', () => {
      const maliciousInput = '<p>Content</p><iframe src="evil.com"></iframe>';
      const sanitized = DataSanitizer.sanitizeHtml(maliciousInput);
      
      expect(sanitized).not.toContain('<iframe>');
      expect(sanitized).not.toContain('evil.com');
      expect(sanitized).toContain('<p>Content</p>');
    });

    it('should strip all tags when requested', () => {
      const htmlInput = '<p><strong>Bold text</strong> and <em>italic text</em></p>';
      const sanitized = DataSanitizer.sanitizeHtml(htmlInput, { stripTags: true });
      
      expect(sanitized).toBe('Bold text and italic text');
    });
  });

  describe('Email Sanitization', () => {
    it('should normalize email addresses', () => {
      const email = '  TEST@EXAMPLE.COM  ';
      const sanitized = DataSanitizer.sanitizeEmail(email);
      
      expect(sanitized).toBe('test@example.com');
    });

    it('should reject invalid email formats', () => {
      const invalidEmail = 'not-an-email';
      
      expect(() => DataSanitizer.sanitizeEmail(invalidEmail)).toThrow('Invalid email format');
    });
  });

  describe('Phone Sanitization', () => {
    it('should clean phone numbers', () => {
      const phone = '+1 (555) 123-4567 ext. 890';
      const sanitized = DataSanitizer.sanitizePhone(phone);
      
      expect(sanitized).toBe('+1 (555) 123-4567 . 890');
      expect(sanitized).not.toContain('ext');
    });

    it('should reject too short phone numbers', () => {
      const shortPhone = '123';
      
      expect(() => DataSanitizer.sanitizePhone(shortPhone)).toThrow('Phone number too short');
    });
  });

  describe('URL Sanitization', () => {
    it('should validate and normalize URLs', () => {
      const url = 'https://example.com/path?param=value';
      const sanitized = DataSanitizer.sanitizeUrl(url);
      
      expect(sanitized).toBe('https://example.com/path?param=value');
    });

    it('should reject non-HTTP protocols', () => {
      const maliciousUrl = 'javascript:alert("xss")';
      
      expect(() => DataSanitizer.sanitizeUrl(maliciousUrl)).toThrow('Invalid URL format');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should sanitize SQL injection attempts', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const sanitized = DataSanitizer.sanitizeSql(maliciousInput);
      
      expect(sanitized).not.toContain('DROP TABLE');
      expect(sanitized).not.toContain('--');
    });

    it('should escape single quotes', () => {
      const input = "O'Reilly";
      const sanitized = DataSanitizer.sanitizeSql(input);
      
      expect(sanitized).toBe("O''Reilly");
    });
  });

  describe('JSON Sanitization', () => {
    it('should recursively sanitize object properties', () => {
      const maliciousObject = {
        name: '<script>alert("xss")</script>John',
        details: {
          bio: '<iframe src="evil.com"></iframe>Developer',
          tags: ['<script>evil</script>tag1', 'tag2']
        }
      };

      const sanitized = DataSanitizer.sanitizeJson(maliciousObject);
      
      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.details.bio).not.toContain('<iframe>');
      expect(sanitized.details.tags[0]).not.toContain('<script>');
      expect(sanitized.name).toContain('John');
      expect(sanitized.details.bio).toContain('Developer');
    });
  });

  describe('Logging Sanitization', () => {
    it('should redact sensitive fields from logs', () => {
      const sensitiveData = {
        username: 'john_doe',
        password: 'secret123',
        email: 'john@example.com',
        creditCard: '4111-1111-1111-1111',
        ssn: '123-45-6789',
        apiKey: 'sk-1234567890abcdef'
      };

      const sanitized = DataSanitizer.sanitizeForLogging(sensitiveData);
      
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.creditCard).toBe('[REDACTED]');
      expect(sanitized.ssn).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.username).toBe('john_doe'); // Not sensitive
      expect(sanitized.email).toBe('john@example.com'); // Not sensitive
    });
  });
});

describe('Database Constraints', () => {
  describe('Constraint Validation', () => {
    it('should validate NOT NULL constraints', async () => {
      const invalidUser = {
        firstName: 'John',
        lastName: 'Doe'
        // Missing required email
      };

      await expect(
        ConstraintValidator.validateConstraints('users', invalidUser, 'create')
      ).rejects.toThrow('Email address is required');
    });

    it('should validate CHECK constraints for user roles', async () => {
      const invalidUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'invalid_role'
      };

      await expect(
        ConstraintValidator.validateConstraints('users', invalidUser, 'create')
      ).rejects.toThrow('Invalid user role');
    });

    it('should validate business rules for admin MFA', async () => {
      const adminWithoutMFA = {
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        mfa_enabled: false
      };

      await expect(
        ConstraintValidator.validateConstraints('users', adminWithoutMFA, 'create')
      ).rejects.toThrow('Multi-factor authentication is required for admin users');
    });

    it('should validate assignment due date business rules', async () => {
      const pastDueAssignment = {
        classId: 1,
        title: 'Late Assignment',
        status: 'published',
        due_date: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      };

      await expect(
        ConstraintValidator.validateConstraints('assignments', pastDueAssignment, 'create')
      ).rejects.toThrow('Due date cannot be in the past for published assignments');
    });

    it('should validate deal close date logic', async () => {
      const closedDealWithoutDate = {
        contactId: 1,
        title: 'Test Deal',
        stage: 'closed_won',
        value: 1000
        // Missing actual_close_date
      };

      await expect(
        ConstraintValidator.validateConstraints('deals', closedDealWithoutDate, 'create')
      ).rejects.toThrow('Closed deals must have an actual close date');
    });

    it('should validate campaign date logic', async () => {
      const invalidCampaign = {
        name: 'Test Campaign',
        start_date: new Date('2024-12-31'),
        end_date: new Date('2024-01-01') // End before start
      };

      await expect(
        ConstraintValidator.validateConstraints('campaigns', invalidCampaign, 'create')
      ).rejects.toThrow('Campaign end date must be after start date');
    });
  });

  describe('Constraint Utilities', () => {
    it('should get constraints for a specific table', () => {
      const userConstraints = ConstraintValidator.getTableConstraints('users');
      
      expect(userConstraints.length).toBeGreaterThan(0);
      expect(userConstraints.every(c => c.table === 'users')).toBe(true);
    });

    it('should find constraint by name', () => {
      const constraint = ConstraintValidator.getConstraint('users_email_unique');
      
      expect(constraint).toBeDefined();
      expect(constraint?.name).toBe('users_email_unique');
      expect(constraint?.type).toBe('unique');
    });

    it('should validate by constraint type', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      // Should not throw for valid data
      await expect(
        ConstraintValidator.validateByType('users', userData, 'not_null', 'create')
      ).resolves.not.toThrow();
    });
  });
});

describe('Integration Validation', () => {
  describe('Batch Validation', () => {
    it('should validate multiple inputs with different schemas', async () => {
      const inputs = {
        user: {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        },
        school: {
          name: 'Test School',
          schoolType: 'high'
        }
      };

      const schemas = {
        user: ValidationSchemas.CreateUser,
        school: ValidationSchemas.CreateSchool
      };

      const validated = await ValidationUtils.validateBatch(inputs, schemas);
      
      expect(validated.user.email).toBe('test@example.com');
      expect(validated.school.name).toBe('Test School');
    });

    it('should handle batch validation errors', async () => {
      const inputs = {
        user: {
          email: 'invalid-email', // Invalid
          firstName: 'John'
        },
        school: {
          schoolType: 'invalid' // Invalid
        }
      };

      const schemas = {
        user: ValidationSchemas.CreateUser,
        school: ValidationSchemas.CreateSchool
      };

      await expect(
        ValidationUtils.validateBatch(inputs, schemas)
      ).rejects.toThrow('Batch validation failed');
    });
  });

  describe('Comprehensive Input Sanitization', () => {
    it('should sanitize all input types appropriately', () => {
      const complexInput = {
        email: '  TEST@EXAMPLE.COM  ',
        phone: '+1 (555) 123-4567',
        website: 'https://example.com',
        bio: '<p>Hello <script>alert("xss")</script>World</p>',
        plainText: 'Just plain text with <script>tags</script>',
        nested: {
          description: '<iframe src="evil.com"></iframe>Safe content',
          tags: ['<script>evil</script>tag1', 'normal-tag']
        }
      };

      const sanitized = ValidationUtils.sanitizeAllInputs(complexInput);
      
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.phone).toBe('+1 (555) 123-4567');
      expect(sanitized.website).toBe('https://example.com/');
      expect(sanitized.bio).not.toContain('<script>');
      expect(sanitized.plainText).not.toContain('<script>');
      expect(sanitized.nested.description).not.toContain('<iframe>');
      expect(sanitized.nested.tags[0]).not.toContain('<script>');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should detect and prevent SQL injection attempts', () => {
      const maliciousQuery = "SELECT * FROM users WHERE id = 1; DROP TABLE users; --";
      const params = [1];

      expect(() => 
        ValidationUtils.preventSQLInjection(maliciousQuery, params)
      ).toThrow('Potentially malicious SQL detected');
    });

    it('should allow safe parameterized queries', () => {
      const safeQuery = "SELECT * FROM users WHERE id = $1 AND email = $2";
      const params = [1, 'test@example.com'];

      expect(() => 
        ValidationUtils.preventSQLInjection(safeQuery, params)
      ).not.toThrow();
    });
  });
});

describe('Performance Tests', () => {
  it('should handle large batch validation efficiently', async () => {
    const startTime = Date.now();
    
    // Create 100 user objects to validate
    const inputs: { [key: string]: any } = {};
    const schemas: { [key: string]: z.ZodType } = {};
    
    for (let i = 0; i < 100; i++) {
      inputs[`user${i}`] = {
        email: `user${i}@example.com`,
        password: 'password123',
        firstName: `User${i}`,
        lastName: 'Test'
      };
      schemas[`user${i}`] = ValidationSchemas.CreateUser;
    }

    const validated = await ValidationUtils.validateBatch(inputs, schemas);
    const endTime = Date.now();
    
    expect(Object.keys(validated)).toHaveLength(100);
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
  });

  it('should handle complex nested object sanitization efficiently', () => {
    const startTime = Date.now();
    
    // Create deeply nested object with potential XSS
    const createNestedObject = (depth: number): any => {
      if (depth === 0) {
        return '<script>alert("xss")</script>Deep content';
      }
      return {
        level: depth,
        content: `<iframe src="evil.com">Level ${depth}</iframe>`,
        nested: createNestedObject(depth - 1),
        array: Array(10).fill(0).map((_, i) => `<script>item${i}</script>`)
      };
    };

    const complexObject = createNestedObject(5);
    const sanitized = ValidationUtils.sanitizeAllInputs(complexObject);
    const endTime = Date.now();
    
    expect(JSON.stringify(sanitized)).not.toContain('<script>');
    expect(JSON.stringify(sanitized)).not.toContain('<iframe>');
    expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
  });
});