/**
 * Security testing suite
 * Tests for common security vulnerabilities and attack vectors
 */

import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser, loginWithCredentials } from '../e2e/utils/auth-helpers';

test.describe('Security Testing', () => {
  test.describe('Authentication Security', () => {
    test('should prevent SQL injection in login', async ({ page }) => {
      const sqlInjectionAttempts = [
        "admin'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "admin'/**/OR/**/1=1--",
        "' OR 1=1#",
      ];

      for (const maliciousInput of sqlInjectionAttempts) {
        await loginWithCredentials(page, maliciousInput, 'anypassword');
        
        // Should not be successful
        await expect(page).toHaveURL(/\/login/);
        
        // Should show appropriate error
        const errorElement = page.locator('[data-testid="login-error"]');
        await expect(errorElement).toBeVisible();
      }
    });

    test('should prevent brute force attacks', async ({ page }) => {
      const maxAttempts = 5;
      
      // Make multiple failed login attempts
      for (let i = 0; i < maxAttempts + 1; i++) {
        await loginWithCredentials(page, 'test@example.com', 'wrongpassword');
        await page.waitForTimeout(100); // Small delay between attempts
      }

      // Should be rate limited after max attempts
      const errorElement = page.locator('[data-testid="rate-limit-error"]');
      await expect(errorElement).toBeVisible();
      await expect(errorElement).toContainText('too many attempts');
    });

    test('should enforce secure password requirements', async ({ page }) => {
      await page.goto('/register');

      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        '12345678',
      ];

      for (const weakPassword of weakPasswords) {
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', weakPassword);
        await page.fill('[data-testid="firstName-input"]', 'Test');
        await page.fill('[data-testid="lastName-input"]', 'User');
        await page.selectOption('[data-testid="role-select"]', 'student');
        
        await page.click('[data-testid="register-button"]');

        // Should show password strength error
        const errorElement = page.locator('[data-testid="password-error"]');
        await expect(errorElement).toBeVisible();
        
        // Clear form for next attempt
        await page.reload();
      }
    });

    test('should invalidate sessions on logout', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');

      // Get the auth token
      const token = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(token).toBeTruthy();

      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      // Try to use the old token
      await page.evaluate((oldToken) => {
        localStorage.setItem('auth_token', oldToken);
      }, token);

      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Input Validation and Sanitization', () => {
    test('should prevent XSS attacks in chat messages', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
      await page.goto('/ai/chat');

      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
        '<svg onload=alert("XSS")>',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      ];

      for (const payload of xssPayloads) {
        await page.fill('[data-testid="message-input"]', payload);
        await page.click('[data-testid="send-button"]');

        // Wait for message to appear
        await expect(page.locator('[data-testid="user-message"]').last()).toBeVisible();

        // Check that script tags are not executed
        const messageContent = await page.locator('[data-testid="user-message"]').last().textContent();
        expect(messageContent).not.toContain('<script>');
        expect(messageContent).not.toContain('javascript:');
        
        // Verify no alert dialogs appeared
        page.on('dialog', dialog => {
          throw new Error('XSS payload executed: ' + dialog.message());
        });
      }
    });

    test('should sanitize HTML in user profile data', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
      await page.goto('/profile');

      const maliciousInputs = [
        '<script>alert("profile XSS")</script>',
        '<img src=x onerror=alert("profile")>',
        '<b onmouseover=alert("hover")>Bold Text</b>',
      ];

      for (const maliciousInput of maliciousInputs) {
        // Try to update profile with malicious input
        await page.fill('[data-testid="firstName-input"]', maliciousInput);
        await page.click('[data-testid="save-profile-button"]');

        // Check that the input is sanitized
        const savedValue = await page.inputValue('[data-testid="firstName-input"]');
        expect(savedValue).not.toContain('<script>');
        expect(savedValue).not.toContain('onerror');
      }
    });

    test('should validate file uploads', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
      await page.goto('/profile');

      // Test malicious file types
      const maliciousFiles = [
        { name: 'malicious.exe', content: 'MZ\x90\x00' }, // Executable
        { name: 'script.js', content: 'alert("malicious")' }, // JavaScript
        { name: 'shell.php', content: '<?php system($_GET["cmd"]); ?>' }, // PHP shell
      ];

      for (const file of maliciousFiles) {
        // Create a temporary file
        const buffer = Buffer.from(file.content);
        
        // Try to upload the file
        const fileInput = page.locator('[data-testid="avatar-upload"]');
        await fileInput.setInputFiles({
          name: file.name,
          mimeType: 'application/octet-stream',
          buffer,
        });

        // Should show validation error
        const errorElement = page.locator('[data-testid="file-upload-error"]');
        await expect(errorElement).toBeVisible();
        await expect(errorElement).toContainText('file type not allowed');
      }
    });
  });

  test.describe('Authorization and Access Control', () => {
    test('should prevent privilege escalation', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');

      // Try to access admin endpoints
      const adminEndpoints = [
        '/admin/users',
        '/admin/settings',
        '/admin/analytics',
        '/api/admin/users',
        '/api/admin/system-settings',
      ];

      for (const endpoint of adminEndpoints) {
        await page.goto(endpoint);

        // Should not have access
        if (endpoint.startsWith('/api/')) {
          // API endpoints should return 403
          const response = await page.waitForResponse(response => 
            response.url().includes(endpoint) && response.status() === 403
          );
          expect(response.status()).toBe(403);
        } else {
          // UI routes should redirect or show unauthorized
          await expect(page.locator('[data-testid="unauthorized-message"]')).toBeVisible();
        }
      }
    });

    test('should enforce resource ownership', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');

      // Try to access another user's data
      const otherUserEndpoints = [
        '/api/users/999/profile',
        '/api/users/999/usage',
        '/api/conversations/999',
      ];

      for (const endpoint of otherUserEndpoints) {
        const response = await page.request.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('auth_token'))}`,
          },
        });

        // Should return 403 Forbidden or 404 Not Found
        expect([403, 404]).toContain(response.status());
      }
    });

    test('should validate JWT tokens properly', async ({ page }) => {
      const invalidTokens = [
        'invalid.jwt.token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
        '', // Empty token
        'Bearer malformed-token',
        'not-a-jwt-at-all',
      ];

      for (const invalidToken of invalidTokens) {
        await page.evaluate((token) => {
          localStorage.setItem('auth_token', token);
        }, invalidToken);

        await page.goto('/dashboard');

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);
      }
    });
  });

  test.describe('Data Protection', () => {
    test('should not expose sensitive data in responses', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');

      // Intercept API responses
      const sensitiveDataPatterns = [
        /password/i,
        /secret/i,
        /private.*key/i,
        /api.*key/i,
        /token.*secret/i,
      ];

      page.on('response', response => {
        if (response.url().includes('/api/')) {
          response.text().then(body => {
            for (const pattern of sensitiveDataPatterns) {
              if (pattern.test(body)) {
                console.warn(`Potential sensitive data exposure in ${response.url()}: ${body.substring(0, 100)}`);
              }
            }
          }).catch(() => {
            // Ignore non-text responses
          });
        }
      });

      // Navigate through the application
      await page.goto('/dashboard');
      await page.goto('/ai/chat');
      await page.goto('/profile');
    });

    test('should implement proper CORS headers', async ({ page }) => {
      const response = await page.request.get('/api/auth/me', {
        headers: {
          'Origin': 'https://malicious-site.com',
        },
      });

      const corsHeader = response.headers()['access-control-allow-origin'];
      
      // Should not allow arbitrary origins
      expect(corsHeader).not.toBe('*');
      expect(corsHeader).not.toBe('https://malicious-site.com');
    });

    test('should set secure HTTP headers', async ({ page }) => {
      await page.goto('/');

      const response = await page.waitForResponse(response => response.url().includes('/'));
      const headers = response.headers();

      // Check for security headers
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-xss-protection']).toBe('1; mode=block');
      expect(headers['strict-transport-security']).toBeTruthy();
      expect(headers['content-security-policy']).toBeTruthy();
    });
  });

  test.describe('Session Security', () => {
    test('should implement session timeout', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');

      // Simulate session timeout by manipulating token expiration
      await page.evaluate(() => {
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
        localStorage.setItem('auth_token', expiredToken);
      });

      await page.goto('/dashboard');

      // Should redirect to login with session expired message
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
    });

    test('should prevent session fixation', async ({ page }) => {
      // Get initial session
      await page.goto('/login');
      const initialSessionId = await page.evaluate(() => document.cookie);

      // Login
      await setupAuthenticatedUser(page, 'student');

      // Session should change after login
      const postLoginSessionId = await page.evaluate(() => document.cookie);
      expect(postLoginSessionId).not.toBe(initialSessionId);
    });

    test('should handle concurrent sessions properly', async ({ context }) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      // Login in both tabs
      await setupAuthenticatedUser(page1, 'student');
      await setupAuthenticatedUser(page2, 'student');

      // Both should be logged in
      await expect(page1.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page2.locator('[data-testid="user-menu"]')).toBeVisible();

      // Logout from one tab
      await page1.click('[data-testid="user-menu"]');
      await page1.click('[data-testid="logout-button"]');

      // Other tab should also be logged out (if single session policy)
      await page2.reload();
      await expect(page2).toHaveURL(/\/login/);
    });
  });

  test.describe('API Security', () => {
    test('should implement rate limiting', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');

      const token = await page.evaluate(() => localStorage.getItem('auth_token'));

      // Make rapid API requests
      const requests = Array.from({ length: 20 }, (_, i) =>
        page.request.post('/api/ai/chat', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          data: {
            message: `Rate limit test ${i}`,
          },
        })
      );

      const responses = await Promise.all(requests);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should validate request content types', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');

      const token = await page.evaluate(() => localStorage.getItem('auth_token'));

      // Try to send request with wrong content type
      const response = await page.request.post('/api/ai/chat', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
        data: 'This is not JSON',
      });

      // Should reject non-JSON content
      expect(response.status()).toBe(400);
    });

    test('should prevent CSRF attacks', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');

      // Try to make request without proper CSRF protection
      const response = await page.request.post('/api/ai/chat', {
        headers: {
          'Origin': 'https://malicious-site.com',
          'Referer': 'https://malicious-site.com/attack',
        },
        data: {
          message: 'CSRF attack attempt',
        },
      });

      // Should be blocked
      expect([403, 400]).toContain(response.status());
    });
  });

  test.describe('Error Handling Security', () => {
    test('should not expose stack traces in production', async ({ page }) => {
      // Trigger an error
      const response = await page.request.post('/api/nonexistent-endpoint', {
        data: { invalid: 'data' },
      });

      const body = await response.text();

      // Should not contain stack traces or internal paths
      expect(body).not.toMatch(/at\s+\w+\s+\(/); // Stack trace pattern
      expect(body).not.toMatch(/\/home\/|\/usr\/|C:\\/); // File paths
      expect(body).not.toContain('node_modules');
      expect(body).not.toContain('Error:');
    });

    test('should handle malformed requests gracefully', async ({ page }) => {
      const malformedRequests = [
        { data: '{"invalid": json}', contentType: 'application/json' },
        { data: 'not-json-at-all', contentType: 'application/json' },
        { data: null, contentType: 'application/json' },
      ];

      for (const request of malformedRequests) {
        const response = await page.request.post('/api/ai/chat', {
          headers: {
            'Content-Type': request.contentType,
          },
          data: request.data,
        });

        // Should return proper error status
        expect([400, 422]).toContain(response.status());

        // Should not crash the server
        const body = await response.text();
        expect(body).toBeTruthy();
      }
    });
  });
});