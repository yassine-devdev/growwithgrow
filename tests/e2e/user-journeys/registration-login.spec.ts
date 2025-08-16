/**
 * E2E tests for user registration and login journeys
 * Tests the complete user onboarding flow
 */

import { test, expect } from '@playwright/test';
import { 
  loginAs, 
  loginWithCredentials, 
  logout, 
  registerUser, 
  expectLoginError, 
  expectRegistrationError,
  clearAuthState,
  TEST_USERS 
} from '../utils/auth-helpers';

test.describe('User Registration and Login', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test.describe('Registration Flow', () => {
    test('should register new user successfully', async ({ page }) => {
      const newUser = {
        email: 'newuser@e2e.test',
        password: 'NewUserPass123!',
        firstName: 'New',
        lastName: 'User',
        role: 'student' as const,
      };

      await registerUser(page, newUser);

      // Should redirect to dashboard after successful registration
      await expect(page).toHaveURL(/\/dashboard/);
      
      // Should show welcome message
      await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, New');
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      await page.goto('/register');

      // Try to submit empty form
      await page.click('[data-testid="register-button"]');

      // Should show validation errors
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="firstName-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="lastName-error"]')).toBeVisible();
    });

    test('should reject weak passwords', async ({ page }) => {
      const weakPasswordUser = {
        email: 'weakpass@e2e.test',
        password: 'weak',
        firstName: 'Weak',
        lastName: 'Password',
        role: 'student' as const,
      };

      await registerUser(page, weakPasswordUser);

      // Should show password strength error
      await expectRegistrationError(page, 'Password must be at least 8 characters');
    });

    test('should reject invalid email format', async ({ page }) => {
      const invalidEmailUser = {
        email: 'invalid-email',
        password: 'ValidPass123!',
        firstName: 'Invalid',
        lastName: 'Email',
        role: 'student' as const,
      };

      await registerUser(page, invalidEmailUser);

      // Should show email validation error
      await expectRegistrationError(page, 'Please enter a valid email');
    });

    test('should prevent duplicate email registration', async ({ page }) => {
      // Try to register with existing user email
      const duplicateUser = {
        ...TEST_USERS.student,
        firstName: 'Duplicate',
        lastName: 'User',
      };

      await registerUser(page, duplicateUser);

      // Should show duplicate email error
      await expectRegistrationError(page, 'Email already exists');
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept registration request and simulate network error
      await page.route('**/api/auth/register', route => {
        route.abort('failed');
      });

      const newUser = {
        email: 'networkerror@e2e.test',
        password: 'NetworkError123!',
        firstName: 'Network',
        lastName: 'Error',
        role: 'student' as const,
      };

      await registerUser(page, newUser);

      // Should show network error message
      await expectRegistrationError(page, 'Network error');
    });
  });

  test.describe('Login Flow', () => {
    test('should login with valid credentials', async ({ page }) => {
      await loginAs(page, 'student');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/);
      
      // Should show user menu
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      
      // Should show correct user name
      await page.click('[data-testid="user-menu"]');
      await expect(page.locator('[data-testid="user-name"]')).toContainText('Test Student');
    });

    test('should reject invalid credentials', async ({ page }) => {
      await loginWithCredentials(page, 'student@e2e.test', 'wrongpassword');

      // Should show error message
      await expectLoginError(page, 'Invalid credentials');
      
      // Should remain on login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should reject non-existent user', async ({ page }) => {
      await loginWithCredentials(page, 'nonexistent@e2e.test', 'anypassword');

      // Should show error message
      await expectLoginError(page, 'Invalid credentials');
    });

    test('should handle empty form submission', async ({ page }) => {
      await page.goto('/login');
      await page.click('[data-testid="login-button"]');

      // Should show validation errors
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    });

    test('should remember user session', async ({ page }) => {
      await loginAs(page, 'student');

      // Refresh the page
      await page.reload();

      // Should still be logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should handle session expiration', async ({ page }) => {
      await loginAs(page, 'student');

      // Simulate expired token
      await page.evaluate(() => {
        localStorage.setItem('auth_token', 'expired.jwt.token');
      });

      // Navigate to a protected page
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
    });

    test('should show loading state during login', async ({ page }) => {
      // Intercept login request to add delay
      await page.route('**/api/auth/login', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        route.continue();
      });

      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', TEST_USERS.student.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.student.password);
      
      await page.click('[data-testid="login-button"]');

      // Should show loading state
      await expect(page.locator('[data-testid="login-loading"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
    });
  });

  test.describe('Logout Flow', () => {
    test('should logout successfully', async ({ page }) => {
      await loginAs(page, 'student');

      await logout(page);

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
      
      // Should show logout success message
      await expect(page.locator('[data-testid="logout-success-message"]')).toBeVisible();
    });

    test('should clear session data on logout', async ({ page }) => {
      await loginAs(page, 'student');

      await logout(page);

      // Try to access protected page
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should handle logout from multiple tabs', async ({ context }) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      // Login in first tab
      await loginAs(page1, 'student');

      // Navigate to dashboard in second tab
      await page2.goto('/dashboard');
      await expect(page2.locator('[data-testid="user-menu"]')).toBeVisible();

      // Logout from first tab
      await logout(page1);

      // Second tab should also be logged out
      await page2.reload();
      await expect(page2).toHaveURL(/\/login/);
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should initiate password reset', async ({ page }) => {
      await page.goto('/login');
      await page.click('[data-testid="forgot-password-link"]');

      await expect(page).toHaveURL(/\/forgot-password/);

      await page.fill('[data-testid="email-input"]', TEST_USERS.student.email);
      await page.click('[data-testid="reset-password-button"]');

      // Should show success message
      await expect(page.locator('[data-testid="reset-email-sent"]')).toBeVisible();
      await expect(page.locator('[data-testid="reset-email-sent"]')).toContainText('reset link has been sent');
    });

    test('should handle non-existent email gracefully', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('[data-testid="email-input"]', 'nonexistent@e2e.test');
      await page.click('[data-testid="reset-password-button"]');

      // Should show generic success message (to prevent email enumeration)
      await expect(page.locator('[data-testid="reset-email-sent"]')).toBeVisible();
    });

    test('should validate email format in password reset', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="reset-password-button"]');

      // Should show validation error
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    });
  });

  test.describe('Role-based Access', () => {
    test('should redirect students to student dashboard', async ({ page }) => {
      await loginAs(page, 'student');

      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('[data-testid="student-dashboard"]')).toBeVisible();
    });

    test('should redirect teachers to teacher dashboard', async ({ page }) => {
      await loginAs(page, 'teacher');

      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible();
    });

    test('should redirect admins to admin dashboard', async ({ page }) => {
      await loginAs(page, 'admin');

      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
    });

    test('should prevent unauthorized access to admin pages', async ({ page }) => {
      await loginAs(page, 'student');

      // Try to access admin page
      await page.goto('/admin/users');

      // Should redirect to unauthorized page or dashboard
      await expect(page).not.toHaveURL(/\/admin/);
      await expect(page.locator('[data-testid="unauthorized-message"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/login');

      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused();

      // Should be able to submit with Enter
      await page.fill('[data-testid="email-input"]', TEST_USERS.student.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.student.password);
      await page.keyboard.press('Enter');

      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/login');

      // Check for proper labels
      await expect(page.locator('[data-testid="email-input"]')).toHaveAttribute('aria-label', 'Email address');
      await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('aria-label', 'Password');
      await expect(page.locator('[data-testid="login-button"]')).toHaveAttribute('aria-label', 'Sign in');
    });

    test('should announce errors to screen readers', async ({ page }) => {
      await page.goto('/login');
      await page.click('[data-testid="login-button"]');

      // Error messages should have proper ARIA attributes
      await expect(page.locator('[data-testid="email-error"]')).toHaveAttribute('role', 'alert');
      await expect(page.locator('[data-testid="password-error"]')).toHaveAttribute('role', 'alert');
    });
  });
});