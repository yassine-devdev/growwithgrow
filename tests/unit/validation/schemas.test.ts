/**
 * Unit tests for validation schemas
 * Tests Zod schemas for data validation and sanitization
 */

import { describe, it, expect } from 'vitest';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserLoginSchema,
  CreateSchoolSchema,
  CreateCourseSchema,
  CreateAIUsageSchema,
  ValidationSchemas
} from '@backend/shared/validation/schemas';

describe('Validation Schemas', () => {
  describe('CreateUserSchema', () => {
    it('should validate valid user data', () => {
      const validUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student' as const
      };

      const result = CreateUserSchema.parse(validUser);
      
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.role).toBe('student');
      expect(result.preferences).toEqual({});
      expect(result.metadata).toEqual({});
    });

    it('should transform email to lowercase', () => {
      const userData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const result = CreateUserSchema.parse(userData);
      expect(result.email).toBe('test@example.com');
    });

    it('should trim string fields', () => {
      const userData = {
        email: '  test@example.com  ',
        password: 'password123',
        firstName: '  John  ',
        lastName: '  Doe  '
      };

      const result = CreateUserSchema.parse(userData);
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      expect(() => CreateUserSchema.parse(invalidUser)).toThrow();
    });

    it('should reject short password', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe'
      };

      expect(() => CreateUserSchema.parse(invalidUser)).toThrow();
    });

    it('should reject empty required fields', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: '',
        lastName: 'Doe'
      };

      expect(() => CreateUserSchema.parse(invalidUser)).toThrow();
    });

    it('should validate optional fields', () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        city: 'New York',
        country: 'USA'
      };

      const result = CreateUserSchema.parse(userData);
      expect(result.phone).toBe('+1234567890');
      expect(result.dateOfBirth).toBeInstanceOf(Date);
      expect(result.city).toBe('New York');
      expect(result.country).toBe('USA');
    });

    it('should reject future birth date', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2030-01-01')
      };

      expect(() => CreateUserSchema.parse(invalidUser)).toThrow();
    });
  });

  describe('UpdateUserSchema', () => {
    it('should allow partial updates', () => {
      const updateData = {
        firstName: 'Jane',
        city: 'Boston'
      };

      const result = UpdateUserSchema.parse(updateData);
      expect(result.firstName).toBe('Jane');
      expect(result.city).toBe('Boston');
      expect(result.email).toBeUndefined();
      expect(result.password).toBeUndefined();
    });

    it('should not allow email updates', () => {
      const updateData = {
        email: 'newemail@example.com',
        firstName: 'Jane'
      };

      // Email should be omitted from the schema
      const result = UpdateUserSchema.parse(updateData);
      expect(result.email).toBeUndefined();
      expect(result.firstName).toBe('Jane');
    });
  });

  describe('UserLoginSchema', () => {
    it('should validate login credentials', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = UserLoginSchema.parse(credentials);
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBe('password123');
    });

    it('should transform email to lowercase', () => {
      const credentials = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      };

      const result = UserLoginSchema.parse(credentials);
      expect(result.email).toBe('test@example.com');
    });

    it('should reject empty password', () => {
      const credentials = {
        email: 'test@example.com',
        password: ''
      };

      expect(() => UserLoginSchema.parse(credentials)).toThrow();
    });
  });

  describe('CreateSchoolSchema', () => {
    it('should validate valid school data', () => {
      const validSchool = {
        name: 'Test Elementary School',
        schoolType: 'elementary' as const,
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        country: 'USA',
        email: 'info@testschool.edu'
      };

      const result = CreateSchoolSchema.parse(validSchool);
      expect(result.name).toBe('Test Elementary School');
      expect(result.schoolType).toBe('elementary');
      expect(result.settings).toEqual({});
      expect(result.metadata).toEqual({});
    });

    it('should reject empty school name', () => {
      const invalidSchool = {
        name: '',
        schoolType: 'elementary' as const
      };

      expect(() => CreateSchoolSchema.parse(invalidSchool)).toThrow();
    });

    it('should validate optional website URL', () => {
      const schoolData = {
        name: 'Test School',
        schoolType: 'elementary' as const,
        website: 'https://testschool.edu'
      };

      const result = CreateSchoolSchema.parse(schoolData);
      expect(result.website).toBe('https://testschool.edu');
    });

    it('should reject invalid website URL', () => {
      const invalidSchool = {
        name: 'Test School',
        schoolType: 'elementary' as const,
        website: 'not-a-url'
      };

      expect(() => CreateSchoolSchema.parse(invalidSchool)).toThrow();
    });
  });

  describe('CreateCourseSchema', () => {
    it('should validate valid course data', () => {
      const validCourse = {
        schoolId: 1,
        name: 'Introduction to Mathematics',
        code: 'MATH101',
        description: 'Basic mathematics course',
        credits: 3,
        semester: 'Fall',
        academicYear: '2024-2025'
      };

      const result = CreateCourseSchema.parse(validCourse);
      expect(result.schoolId).toBe(1);
      expect(result.name).toBe('Introduction to Mathematics');
      expect(result.code).toBe('MATH101');
      expect(result.credits).toBe(3);
    });

    it('should sanitize HTML in description', () => {
      const courseData = {
        schoolId: 1,
        name: 'Test Course',
        description: '<script>alert("xss")</script>Safe content'
      };

      const result = CreateCourseSchema.parse(courseData);
      expect(result.description).not.toContain('<script>');
      expect(result.description).toContain('Safe content');
    });

    it('should default credits to 0', () => {
      const courseData = {
        schoolId: 1,
        name: 'Test Course'
      };

      const result = CreateCourseSchema.parse(courseData);
      expect(result.credits).toBe(0);
    });
  });

  describe('CreateAIUsageSchema', () => {
    it('should validate valid AI usage data', () => {
      const validUsage = {
        userId: 1,
        provider: 'openrouter' as const,
        modelName: 'gpt-3.5-turbo',
        requestType: 'chat' as const,
        tokensUsed: 100,
        cost: 0.002
      };

      const result = CreateAIUsageSchema.parse(validUsage);
      expect(result.userId).toBe(1);
      expect(result.provider).toBe('openrouter');
      expect(result.tokensUsed).toBe(100);
      expect(result.cost).toBe(0.002);
    });

    it('should reject negative cost', () => {
      const invalidUsage = {
        provider: 'openrouter' as const,
        modelName: 'gpt-3.5-turbo',
        requestType: 'chat' as const,
        tokensUsed: 100,
        cost: -0.001
      };

      expect(() => CreateAIUsageSchema.parse(invalidUsage)).toThrow();
    });

    it('should reject zero or negative tokens', () => {
      const invalidUsage = {
        provider: 'openrouter' as const,
        modelName: 'gpt-3.5-turbo',
        requestType: 'chat' as const,
        tokensUsed: 0,
        cost: 0.002
      };

      expect(() => CreateAIUsageSchema.parse(invalidUsage)).toThrow();
    });

    it('should sanitize prompt and response text', () => {
      const usageData = {
        provider: 'openrouter' as const,
        modelName: 'gpt-3.5-turbo',
        requestType: 'chat' as const,
        tokensUsed: 100,
        cost: 0.002,
        promptText: '<script>alert("xss")</script>What is AI?',
        responseText: '<iframe src="evil.com"></iframe>AI is artificial intelligence.'
      };

      const result = CreateAIUsageSchema.parse(usageData);
      expect(result.promptText).not.toContain('<script>');
      expect(result.responseText).not.toContain('<iframe>');
      expect(result.promptText).toContain('What is AI?');
      expect(result.responseText).toContain('AI is artificial intelligence.');
    });
  });

  describe('ValidationSchemas export', () => {
    it('should export all schemas', () => {
      expect(ValidationSchemas.CreateUser).toBeDefined();
      expect(ValidationSchemas.UpdateUser).toBeDefined();
      expect(ValidationSchemas.UserLogin).toBeDefined();
      expect(ValidationSchemas.CreateSchool).toBeDefined();
      expect(ValidationSchemas.CreateCourse).toBeDefined();
      expect(ValidationSchemas.CreateAIUsage).toBeDefined();
    });

    it('should have consistent schema structure', () => {
      // All create schemas should have similar structure
      const createSchemas = [
        ValidationSchemas.CreateUser,
        ValidationSchemas.CreateSchool,
        ValidationSchemas.CreateCourse
      ];

      createSchemas.forEach(schema => {
        expect(schema._def).toBeDefined();
        expect(schema.parse).toBeInstanceOf(Function);
        expect(schema.safeParse).toBeInstanceOf(Function);
      });
    });
  });
});