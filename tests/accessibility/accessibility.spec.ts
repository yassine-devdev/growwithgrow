/**
 * Accessibility testing suite using axe-core
 * Tests for WCAG compliance and accessibility best practices
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setupAuthenticatedUser } from '../e2e/utils/auth-helpers';

test.describe('Accessibility Testing', () => {
  test.describe('Authentication Pages', () => {
    test('login page should be accessible', async ({ page }) => {
      await page.goto('/login');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('registration page should be accessible', async ({ page }) => {
      await page.goto('/register');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('forgot password page should be accessible', async ({ page }) => {
      await page.goto('/forgot-password');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Dashboard Pages', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
    });

    test('student dashboard should be accessible', async ({ page }) => {
      await page.goto('/dashboard');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('profile page should be accessible', async ({ page }) => {
      await page.goto('/profile');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('AI Chat Interface', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
    });

    test('chat interface should be accessible', async ({ page }) => {
      await page.goto('/ai/chat');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('chat messages should have proper ARIA labels', async ({ page }) => {
      await page.goto('/ai/chat');

      // Send a message to generate chat content
      await page.fill('[data-testid="message-input"]', 'Test accessibility message');
      await page.click('[data-testid="send-button"]');

      // Wait for AI response
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });

      // Check accessibility of chat messages
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="chat-history"]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('chat settings should be accessible', async ({ page }) => {
      await page.goto('/ai/chat');

      // Open chat settings
      await page.click('[data-testid="chat-settings-button"]');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="chat-settings-modal"]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation on login page', async ({ page }) => {
      await page.goto('/login');

      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="forgot-password-link"]')).toBeFocused();
    });

    test('should support keyboard navigation in chat interface', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
      await page.goto('/ai/chat');

      // Tab to message input
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="message-input"]')).toBeFocused();

      // Tab to send button
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="send-button"]')).toBeFocused();

      // Tab to settings button
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="chat-settings-button"]')).toBeFocused();
    });

    test('should support Enter key for form submission', async ({ page }) => {
      await page.goto('/login');

      await page.fill('[data-testid="email-input"]', 'student@e2e.test');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');

      // Submit with Enter key
      await page.keyboard.press('Enter');

      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should support Escape key for modal closing', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
      await page.goto('/ai/chat');

      // Open settings modal
      await page.click('[data-testid="chat-settings-button"]');
      await expect(page.locator('[data-testid="chat-settings-modal"]')).toBeVisible();

      // Close with Escape key
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="chat-settings-modal"]')).not.toBeVisible();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
      await page.goto('/dashboard');

      // Check heading structure
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      expect(headings.length).toBeGreaterThan(0);

      // Verify h1 exists
      const h1Elements = await page.locator('h1').count();
      expect(h1Elements).toBeGreaterThanOrEqual(1);
    });

    test('should have descriptive page titles', async ({ page }) => {
      const pages = [
        { url: '/login', expectedTitle: /login/i },
        { url: '/register', expectedTitle: /register|sign up/i },
        { url: '/dashboard', expectedTitle: /dashboard/i },
      ];

      for (const { url, expectedTitle } of pages) {
        if (url === '/dashboard') {
          await setupAuthenticatedUser(page, 'student');
        }
        
        await page.goto(url);
        const title = await page.title();
        expect(title).toMatch(expectedTitle);
      }
    });

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/register');

      // Check that all form inputs have associated labels
      const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], select').all();

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        // Input should have either a label, aria-label, or aria-labelledby
        if (id) {
          const label = await page.locator(`label[for="${id}"]`).count();
          expect(label > 0 || ariaLabel || ariaLabelledBy).toBeTruthy();
        } else {
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    });

    test('should announce dynamic content changes', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
      await page.goto('/ai/chat');

      // Send a message
      await page.fill('[data-testid="message-input"]', 'Test screen reader announcement');
      await page.click('[data-testid="send-button"]');

      // Check that AI response has proper ARIA attributes for announcements
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });
      
      const aiMessage = page.locator('[data-testid="ai-message"]').last();
      const ariaLive = await aiMessage.getAttribute('aria-live');
      const role = await aiMessage.getAttribute('role');

      expect(ariaLive || role).toBeTruthy();
    });
  });

  test.describe('Color and Contrast', () => {
    test('should meet color contrast requirements', async ({ page }) => {
      await page.goto('/login');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('body')
        .analyze();

      // Filter for color contrast violations
      const contrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'color-contrast'
      );

      expect(contrastViolations).toEqual([]);
    });

    test('should be usable without color alone', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
      await page.goto('/ai/chat');

      // Check that status indicators don't rely solely on color
      await page.click('[data-testid="provider-selector"]');

      const providerOptions = await page.locator('[data-testid^="provider-option-"]').all();

      for (const option of providerOptions) {
        const statusIndicator = option.locator('[data-testid^="provider-status-"]');
        
        if (await statusIndicator.count() > 0) {
          // Status should be indicated by text or icons, not just color
          const text = await statusIndicator.textContent();
          expect(text).toBeTruthy();
          expect(text?.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/login');

      // Tab to first focusable element
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Check that focus is visually indicated (this is hard to test programmatically)
      // We can at least verify the element is focused
      await expect(focusedElement).toBeFocused();
    });

    test('should trap focus in modals', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
      await page.goto('/ai/chat');

      // Open modal
      await page.click('[data-testid="chat-settings-button"]');
      await expect(page.locator('[data-testid="chat-settings-modal"]')).toBeVisible();

      // Tab through modal elements
      const modalFocusableElements = await page.locator('[data-testid="chat-settings-modal"] button, [data-testid="chat-settings-modal"] input, [data-testid="chat-settings-modal"] select, [data-testid="chat-settings-modal"] textarea').all();

      if (modalFocusableElements.length > 0) {
        // Focus should be trapped within the modal
        for (let i = 0; i < modalFocusableElements.length + 2; i++) {
          await page.keyboard.press('Tab');
          const focusedElement = page.locator(':focus');
          
          // Focus should remain within the modal
          const isWithinModal = await focusedElement.locator('xpath=ancestor-or-self::*[@data-testid="chat-settings-modal"]').count() > 0;
          expect(isWithinModal).toBeTruthy();
        }
      }
    });

    test('should restore focus after modal closes', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
      await page.goto('/ai/chat');

      // Focus on settings button
      await page.focus('[data-testid="chat-settings-button"]');
      
      // Open modal
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="chat-settings-modal"]')).toBeVisible();

      // Close modal with Escape
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="chat-settings-modal"]')).not.toBeVisible();

      // Focus should return to the settings button
      await expect(page.locator('[data-testid="chat-settings-button"]')).toBeFocused();
    });
  });

  test.describe('Error Messages and Feedback', () => {
    test('should provide accessible error messages', async ({ page }) => {
      await page.goto('/login');

      // Submit empty form to trigger validation errors
      await page.click('[data-testid="login-button"]');

      // Check that error messages are properly associated with inputs
      const emailError = page.locator('[data-testid="email-error"]');
      const passwordError = page.locator('[data-testid="password-error"]');

      await expect(emailError).toBeVisible();
      await expect(passwordError).toBeVisible();

      // Errors should have proper ARIA attributes
      await expect(emailError).toHaveAttribute('role', 'alert');
      await expect(passwordError).toHaveAttribute('role', 'alert');

      // Check accessibility of error state
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should provide accessible success messages', async ({ page }) => {
      await setupAuthenticatedUser(page, 'student');
      await page.goto('/profile');

      // Update profile to trigger success message
      await page.fill('[data-testid="firstName-input"]', 'Updated Name');
      await page.click('[data-testid="save-profile-button"]');

      // Success message should be accessible
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toHaveAttribute('role', 'status');
      await expect(successMessage).toHaveAttribute('aria-live', 'polite');
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await setupAuthenticatedUser(page, 'student');
      await page.goto('/ai/chat');

      // Check that interactive elements meet minimum touch target size (44x44px)
      const interactiveElements = await page.locator('button, a, input, [role="button"]').all();

      for (const element of interactiveElements) {
        if (await element.isVisible()) {
          const boundingBox = await element.boundingBox();
          if (boundingBox) {
            expect(boundingBox.width).toBeGreaterThanOrEqual(44);
            expect(boundingBox.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });
  });
});