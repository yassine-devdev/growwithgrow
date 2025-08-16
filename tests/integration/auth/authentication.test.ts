/**
 * Integration tests for authentication and authorization flows
 * Tests complete auth workflows including JWT, sessions, and permissions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase, resetTestData, createTestUser } from '../../utils/database';
import { mockHTTPRequest } from '../../utils/server';

describe('Authentication Integration', () => {
  beforeEach(async () => {
    await setupTestDatabase();
    await resetTestData();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
    vi.clearAllMocks();
  });

  describe('User Registration', () => {
    it('should register new user successfully', async () => {
      const registrationData = {
        email: 'newuser@test.com',
        password: 'SecurePass123!',
        firstName: 'New',
        lastName: 'User',
        role: 'student',
      };

      const response = await mockHTTPRequest('POST', '/api/auth/register', {
        body: registrationData,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        success: true,
        data: {
          user: {
            id: expect.any(Number),
            email: 'newuser@test.com',
            firstName: 'New',
            lastName: 'User',
            role: 'student',
          },
          token: expect.any(String),
        },
      });

      // Verify user was created in database
      const user = global.mockDb.findUserByEmail('newuser@test.com');
      expect(user).toBeDefined();
      expect(user.email).toBe('newuser@test.com');
    });

    it('should hash password before storing', async () => {
      const registrationData = {
        email: 'hashtest@test.com',
        password: 'PlainTextPassword',
        firstName: 'Hash',
        lastName: 'Test',
        role: 'student',
      };

      const response = await mockHTTPRequest('POST', '/api/auth/register', {
        body: registrationData,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(201);

      // Verify password is hashed in database
      const user = global.mockDb.findUserByEmail('hashtest@test.com');
      expect(user.password).not.toBe('PlainTextPassword');
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should reject duplicate email registration', async () => {
      const registrationData = {
        email: 'duplicate@test.com',
        password: 'SecurePass123!',
        firstName: 'First',
        lastName: 'User',
        role: 'student',
      };

      // First registration should succeed
      const response1 = await mockHTTPRequest('POST', '/api/auth/register', {
        body: registrationData,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response1.status).toBe(201);

      // Second registration with same email should fail
      const response2 = await mockHTTPRequest('POST', '/api/auth/register', {
        body: registrationData,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response2.status).toBe(409);
      expect(response2.data).toMatchObject({
        success: false,
        error: expect.stringContaining('already exists'),
      });
    });

    it('should validate password strength', async () => {
      const weakPasswordData = {
        email: 'weakpass@test.com',
        password: 'weak',
        firstName: 'Weak',
        lastName: 'Password',
        role: 'student',
      };

      const response = await mockHTTPRequest('POST', '/api/auth/register', {
        body: weakPasswordData,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(400);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('password'),
      });
    });

    it('should validate email format', async () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'Invalid',
        lastName: 'Email',
        role: 'student',
      };

      const response = await mockHTTPRequest('POST', '/api/auth/register', {
        body: invalidEmailData,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(400);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('email'),
      });
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        email: 'incomplete@test.com',
        password: 'SecurePass123!',
        // Missing firstName, lastName, role
      };

      const response = await mockHTTPRequest('POST', '/api/auth/register', {
        body: incompleteData,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(400);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('required'),
      });
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create test user for login tests
      const user = createTestUser({
        email: 'logintest@test.com',
        password: '$2a$10$hashedpassword', // Mock hashed password
      });
      global.mockDb.createUser(user);
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'logintest@test.com',
        password: 'correctpassword',
      };

      const response = await mockHTTPRequest('POST', '/api/auth/login', {
        body: loginData,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        data: {
          user: {
            id: expect.any(Number),
            email: 'logintest@test.com',
            role: expect.any(String),
          },
          token: expect.any(String),
        },
      });
    });

    it('should reject invalid password', async () => {
      const loginData = {
        email: 'logintest@test.com',
        password: 'wrongpassword',
      };

      const response = await mockHTTPRequest('POST', '/api/auth/login', {
        body: loginData,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(401);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid credentials'),
      });
    });

    it('should reject non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'anypassword',
      };

      const response = await mockHTTPRequest('POST', '/api/auth/login', {
        body: loginData,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(401);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid credentials'),
      });
    });

    it('should reject inactive user', async () => {
      // Create inactive user
      const inactiveUser = createTestUser({
        email: 'inactive@test.com',
        isActive: false,
      });
      global.mockDb.createUser(inactiveUser);

      const loginData = {
        email: 'inactive@test.com',
        password: 'correctpassword',
      };

      const response = await mockHTTPRequest('POST', '/api/auth/login', {
        body: loginData,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(401);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('Account is inactive'),
      });
    });

    it('should generate valid JWT token', async () => {
      const loginData = {
        email: 'logintest@test.com',
        password: 'correctpassword',
      };

      const response = await mockHTTPRequest('POST', '/api/auth/login', {
        body: loginData,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(200);
      
      const token = response.data.data.token;
      expect(token).toBeTruthy();
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('Token Validation', () => {
    let validToken: string;
    let testUser: any;

    beforeEach(async () => {
      testUser = createTestUser({
        email: 'tokentest@test.com',
      });
      global.mockDb.createUser(testUser);

      // Mock valid token
      validToken = 'mock.jwt.token';
    });

    it('should validate valid JWT token', async () => {
      const response = await mockHTTPRequest('GET', '/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${validToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        data: {
          user: {
            id: expect.any(Number),
            email: expect.any(String),
            role: expect.any(String),
          },
        },
      });
    });

    it('should reject missing token', async () => {
      const response = await mockHTTPRequest('GET', '/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('token'),
      });
    });

    it('should reject invalid token format', async () => {
      const response = await mockHTTPRequest('GET', '/api/auth/me', {
        headers: {
          'Authorization': 'Invalid token format',
        },
      });

      expect(response.status).toBe(401);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid token'),
      });
    });

    it('should reject expired token', async () => {
      const expiredToken = 'expired.jwt.token';

      const response = await mockHTTPRequest('GET', '/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${expiredToken}`,
        },
      });

      expect(response.status).toBe(401);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('expired'),
      });
    });

    it('should reject malformed token', async () => {
      const malformedToken = 'malformed.token';

      const response = await mockHTTPRequest('GET', '/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${malformedToken}`,
        },
      });

      expect(response.status).toBe(401);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid token'),
      });
    });
  });

  describe('Authorization', () => {
    let studentUser: any;
    let teacherUser: any;
    let adminUser: any;
    let validToken: string;

    beforeEach(async () => {
      studentUser = createTestUser({
        email: 'student@test.com',
        role: 'student',
      });
      teacherUser = createTestUser({
        email: 'teacher@test.com',
        role: 'teacher',
      });
      adminUser = createTestUser({
        email: 'admin@test.com',
        role: 'admin',
      });

      global.mockDb.createUser(studentUser);
      global.mockDb.createUser(teacherUser);
      global.mockDb.createUser(adminUser);

      validToken = 'mock.jwt.token';
    });

    it('should allow student access to student endpoints', async () => {
      const response = await mockHTTPRequest('GET', '/api/student/dashboard', {
        headers: {
          'Authorization': `Bearer ${validToken}`,
        },
        user: studentUser,
      });

      expect(response.status).toBe(200);
    });

    it('should deny student access to admin endpoints', async () => {
      const response = await mockHTTPRequest('GET', '/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${validToken}`,
        },
        user: studentUser,
      });

      expect(response.status).toBe(403);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('permission'),
      });
    });

    it('should allow teacher access to teacher endpoints', async () => {
      const response = await mockHTTPRequest('GET', '/api/teacher/classes', {
        headers: {
          'Authorization': `Bearer ${validToken}`,
        },
        user: teacherUser,
      });

      expect(response.status).toBe(200);
    });

    it('should allow admin access to all endpoints', async () => {
      const endpoints = [
        '/api/student/dashboard',
        '/api/teacher/classes',
        '/api/admin/users',
      ];

      for (const endpoint of endpoints) {
        const response = await mockHTTPRequest('GET', endpoint, {
          headers: {
            'Authorization': `Bearer ${validToken}`,
          },
          user: adminUser,
        });

        expect(response.status).toBe(200);
      }
    });

    it('should enforce resource ownership', async () => {
      // Student should only access their own data
      const response = await mockHTTPRequest('GET', `/api/users/${studentUser.id}/profile`, {
        headers: {
          'Authorization': `Bearer ${validToken}`,
        },
        user: studentUser,
      });

      expect(response.status).toBe(200);

      // Student should not access other user's data
      const unauthorizedResponse = await mockHTTPRequest('GET', `/api/users/${teacherUser.id}/profile`, {
        headers: {
          'Authorization': `Bearer ${validToken}`,
        },
        user: studentUser,
      });

      expect(unauthorizedResponse.status).toBe(403);
    });
  });

  describe('Session Management', () => {
    let testUser: any;
    let validToken: string;

    beforeEach(async () => {
      testUser = createTestUser({
        email: 'session@test.com',
      });
      global.mockDb.createUser(testUser);
      validToken = 'mock.jwt.token';
    });

    it('should logout user successfully', async () => {
      const response = await mockHTTPRequest('POST', '/api/auth/logout', {
        headers: {
          'Authorization': `Bearer ${validToken}`,
        },
        user: testUser,
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        message: expect.stringContaining('logged out'),
      });
    });

    it('should refresh token successfully', async () => {
      const response = await mockHTTPRequest('POST', '/api/auth/refresh', {
        headers: {
          'Authorization': `Bearer ${validToken}`,
        },
        user: testUser,
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        data: {
          token: expect.any(String),
        },
      });
    });

    it('should handle concurrent sessions', async () => {
      // Simulate multiple login sessions
      const loginPromises = Array.from({ length: 3 }, () =>
        mockHTTPRequest('POST', '/api/auth/login', {
          body: {
            email: 'session@test.com',
            password: 'correctpassword',
          },
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const responses = await Promise.all(loginPromises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data.data.token).toBeTruthy();
      });
    });
  });

  describe('Password Reset', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = createTestUser({
        email: 'reset@test.com',
      });
      global.mockDb.createUser(testUser);
    });

    it('should initiate password reset', async () => {
      const response = await mockHTTPRequest('POST', '/api/auth/forgot-password', {
        body: {
          email: 'reset@test.com',
        },
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        message: expect.stringContaining('reset'),
      });
    });

    it('should handle non-existent email gracefully', async () => {
      const response = await mockHTTPRequest('POST', '/api/auth/forgot-password', {
        body: {
          email: 'nonexistent@test.com',
        },
        headers: { 'Content-Type': 'application/json' },
      });

      // Should return success to prevent email enumeration
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        message: expect.stringContaining('reset'),
      });
    });

    it('should reset password with valid token', async () => {
      const resetToken = 'valid-reset-token';

      const response = await mockHTTPRequest('POST', '/api/auth/reset-password', {
        body: {
          token: resetToken,
          newPassword: 'NewSecurePass123!',
        },
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        message: expect.stringContaining('reset'),
      });
    });

    it('should reject invalid reset token', async () => {
      const invalidToken = 'invalid-reset-token';

      const response = await mockHTTPRequest('POST', '/api/auth/reset-password', {
        body: {
          token: invalidToken,
          newPassword: 'NewSecurePass123!',
        },
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(400);
      expect(response.data).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid'),
      });
    });
  });

  describe('Security', () => {
    it('should prevent brute force attacks', async () => {
      const loginData = {
        email: 'bruteforce@test.com',
        password: 'wrongpassword',
      };

      // Make multiple failed login attempts
      const attempts = Array.from({ length: 6 }, () =>
        mockHTTPRequest('POST', '/api/auth/login', {
          body: loginData,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const responses = await Promise.all(attempts);

      // Later attempts should be rate limited
      const rateLimitedResponses = responses.slice(-2);
      rateLimitedResponses.forEach(response => {
        expect(response.status).toBe(429);
      });
    });

    it('should sanitize input data', async () => {
      const maliciousData = {
        email: '<script>alert("xss")</script>@test.com',
        password: 'SecurePass123!',
        firstName: '<img src=x onerror=alert("xss")>',
        lastName: 'User',
        role: 'student',
      };

      const response = await mockHTTPRequest('POST', '/api/auth/register', {
        body: maliciousData,
        headers: { 'Content-Type': 'application/json' },
      });

      // Should either reject or sanitize the input
      if (response.status === 201) {
        const user = global.mockDb.findUserByEmail(maliciousData.email);
        expect(user.firstName).not.toContain('<script>');
        expect(user.firstName).not.toContain('<img');
      } else {
        expect(response.status).toBe(400);
      }
    });

    it('should use secure headers', async () => {
      const response = await mockHTTPRequest('POST', '/api/auth/login', {
        body: {
          email: 'test@test.com',
          password: 'password',
        },
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.headers).toMatchObject({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      });
    });
  });
});