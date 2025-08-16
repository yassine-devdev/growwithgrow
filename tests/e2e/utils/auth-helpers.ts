/**
 * Authentication helpers for E2E tests
 * Provides utilities for login, logout, and user management
 */

import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
}

export const TEST_USERS: Record<string, TestUser> = {
  student: {
    email: 'student@e2e.test',
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'Student',
    role: 'student',
  },
  teacher: {
    email: 'teacher@e2e.test',
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'Teacher',
    role: 'teacher',
  },
  admin: {
    email: 'admin@e2e.test',
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin',
  },
};

/**
 * Login with test user credentials
 */
export async function loginAs(page: Page, userType: keyof typeof TEST_USERS) {
  const user = TEST_USERS[userType];
  
  await page.goto('/login');
  
  // Fill login form
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  
  // Submit form
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login
  await expect(page).toHaveURL(/\/dashboard/);
  
  // Verify user is logged in
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  
  return user;
}

/**
 * Login with custom credentials
 */
export async function loginWithCredentials(page: Page, email: string, password: string) {
  await page.goto('/login');
  
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  
  await page.click('[data-testid="login-button"]');
  
  // Wait for navigation or error
  await page.waitForLoadState('networkidle');
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu"]');
  
  // Click logout option
  await page.click('[data-testid="logout-button"]');
  
  // Wait for redirect to login page
  await expect(page).toHaveURL(/\/login/);
}

/**
 * Register a new user
 */
export async function registerUser(page: Page, userData: TestUser) {
  await page.goto('/register');
  
  // Fill registration form
  await page.fill('[data-testid="email-input"]', userData.email);
  await page.fill('[data-testid="password-input"]', userData.password);
  await page.fill('[data-testid="firstName-input"]', userData.firstName);
  await page.fill('[data-testid="lastName-input"]', userData.lastName);
  await page.selectOption('[data-testid="role-select"]', userData.role);
  
  // Submit form
  await page.click('[data-testid="register-button"]');
  
  // Wait for successful registration
  await page.waitForLoadState('networkidle');
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.locator('[data-testid="user-menu"]').waitFor({ timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current user info from the page
 */
export async function getCurrentUser(page: Page): Promise<{ name: string; email: string; role: string } | null> {
  try {
    // Click user menu to reveal user info
    await page.click('[data-testid="user-menu"]');
    
    const name = await page.textContent('[data-testid="user-name"]');
    const email = await page.textContent('[data-testid="user-email"]');
    const role = await page.textContent('[data-testid="user-role"]');
    
    // Close menu
    await page.click('[data-testid="user-menu"]');
    
    return {
      name: name || '',
      email: email || '',
      role: role || '',
    };
  } catch {
    return null;
  }
}

/**
 * Wait for authentication state to be ready
 */
export async function waitForAuthReady(page: Page) {
  // Wait for either login form or user menu to appear
  await Promise.race([
    page.locator('[data-testid="login-form"]').waitFor(),
    page.locator('[data-testid="user-menu"]').waitFor(),
  ]);
}

/**
 * Clear authentication state (cookies, localStorage, etc.)
 */
export async function clearAuthState(page: Page) {
  // Clear cookies
  await page.context().clearCookies();
  
  // Clear localStorage and sessionStorage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Setup authentication for tests that need a logged-in user
 */
export async function setupAuthenticatedUser(page: Page, userType: keyof typeof TEST_USERS = 'student') {
  await clearAuthState(page);
  await loginAs(page, userType);
  return TEST_USERS[userType];
}

/**
 * Verify user has specific role
 */
export async function verifyUserRole(page: Page, expectedRole: string) {
  const user = await getCurrentUser(page);
  expect(user?.role.toLowerCase()).toBe(expectedRole.toLowerCase());
}

/**
 * Handle login errors
 */
export async function expectLoginError(page: Page, expectedError?: string) {
  const errorElement = page.locator('[data-testid="login-error"]');
  await expect(errorElement).toBeVisible();
  
  if (expectedError) {
    await expect(errorElement).toContainText(expectedError);
  }
}

/**
 * Handle registration errors
 */
export async function expectRegistrationError(page: Page, expectedError?: string) {
  const errorElement = page.locator('[data-testid="registration-error"]');
  await expect(errorElement).toBeVisible();
  
  if (expectedError) {
    await expect(errorElement).toContainText(expectedError);
  }
}