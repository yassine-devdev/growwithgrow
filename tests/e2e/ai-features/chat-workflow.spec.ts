/**
 * E2E tests for AI chat workflow
 * Tests the complete AI interaction experience
 */

import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser, TEST_USERS } from '../utils/auth-helpers';

test.describe('AI Chat Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page, 'student');
  });

  test.describe('Basic Chat Functionality', () => {
    test('should send message and receive AI response', async ({ page }) => {
      await page.goto('/ai/chat');

      // Wait for chat interface to load
      await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();

      // Type a message
      const messageInput = page.locator('[data-testid="message-input"]');
      await messageInput.fill('Hello, can you help me with my homework?');

      // Send message
      await page.click('[data-testid="send-button"]');

      // Should show user message in chat
      await expect(page.locator('[data-testid="user-message"]').last()).toContainText('Hello, can you help me with my homework?');

      // Should show loading indicator
      await expect(page.locator('[data-testid="ai-typing-indicator"]')).toBeVisible();

      // Should receive AI response
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="ai-message"]').last()).not.toBeEmpty();

      // Loading indicator should disappear
      await expect(page.locator('[data-testid="ai-typing-indicator"]')).not.toBeVisible();
    });

    test('should handle empty message submission', async ({ page }) => {
      await page.goto('/ai/chat');

      // Try to send empty message
      await page.click('[data-testid="send-button"]');

      // Should show validation error or prevent submission
      const messageInput = page.locator('[data-testid="message-input"]');
      await expect(messageInput).toHaveAttribute('required');
    });

    test('should handle very long messages', async ({ page }) => {
      await page.goto('/ai/chat');

      const longMessage = 'This is a very long message. '.repeat(100);
      
      await page.fill('[data-testid="message-input"]', longMessage);
      await page.click('[data-testid="send-button"]');

      // Should either accept the message or show length validation
      const userMessage = page.locator('[data-testid="user-message"]').last();
      await expect(userMessage).toBeVisible();
    });

    test('should maintain conversation history', async ({ page }) => {
      await page.goto('/ai/chat');

      // Send first message
      await page.fill('[data-testid="message-input"]', 'What is 2 + 2?');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });

      // Send follow-up message
      await page.fill('[data-testid="message-input"]', 'What about 3 + 3?');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });

      // Should have both messages in history
      const userMessages = page.locator('[data-testid="user-message"]');
      await expect(userMessages).toHaveCount(2);

      const aiMessages = page.locator('[data-testid="ai-message"]');
      await expect(aiMessages).toHaveCount(2);
    });

    test('should clear conversation when requested', async ({ page }) => {
      await page.goto('/ai/chat');

      // Send a message
      await page.fill('[data-testid="message-input"]', 'Hello AI');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });

      // Clear conversation
      await page.click('[data-testid="clear-chat-button"]');

      // Confirm clear action
      await page.click('[data-testid="confirm-clear-button"]');

      // Chat should be empty
      await expect(page.locator('[data-testid="user-message"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="ai-message"]')).toHaveCount(0);
    });
  });

  test.describe('AI Provider Selection', () => {
    test('should allow provider selection', async ({ page }) => {
      await page.goto('/ai/chat');

      // Open provider selection
      await page.click('[data-testid="provider-selector"]');

      // Should show available providers
      await expect(page.locator('[data-testid="provider-option-openrouter"]')).toBeVisible();
      await expect(page.locator('[data-testid="provider-option-ollama"]')).toBeVisible();
      await expect(page.locator('[data-testid="provider-option-gemini"]')).toBeVisible();

      // Select different provider
      await page.click('[data-testid="provider-option-ollama"]');

      // Should update provider indicator
      await expect(page.locator('[data-testid="current-provider"]')).toContainText('Ollama');
    });

    test('should show provider status', async ({ page }) => {
      await page.goto('/ai/chat');

      await page.click('[data-testid="provider-selector"]');

      // Should show provider status indicators
      const providers = ['openrouter', 'ollama', 'gemini'];
      
      for (const provider of providers) {
        const statusIndicator = page.locator(`[data-testid="provider-status-${provider}"]`);
        await expect(statusIndicator).toBeVisible();
        
        // Status should be online, offline, or error
        const status = await statusIndicator.textContent();
        expect(['online', 'offline', 'error']).toContain(status?.toLowerCase());
      }
    });

    test('should handle provider switching mid-conversation', async ({ page }) => {
      await page.goto('/ai/chat');

      // Send message with default provider
      await page.fill('[data-testid="message-input"]', 'Hello from OpenRouter');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });

      // Switch provider
      await page.click('[data-testid="provider-selector"]');
      await page.click('[data-testid="provider-option-ollama"]');

      // Send another message
      await page.fill('[data-testid="message-input"]', 'Hello from Ollama');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });

      // Should have responses from both providers
      const aiMessages = page.locator('[data-testid="ai-message"]');
      await expect(aiMessages).toHaveCount(2);
    });
  });

  test.describe('Model Configuration', () => {
    test('should allow model selection', async ({ page }) => {
      await page.goto('/ai/chat');

      // Open model selector
      await page.click('[data-testid="model-selector"]');

      // Should show available models
      await expect(page.locator('[data-testid="model-list"]')).toBeVisible();
      
      // Select a different model
      await page.click('[data-testid="model-option"]').first();

      // Should update current model display
      await expect(page.locator('[data-testid="current-model"]')).not.toBeEmpty();
    });

    test('should allow temperature adjustment', async ({ page }) => {
      await page.goto('/ai/chat');

      // Open settings
      await page.click('[data-testid="chat-settings-button"]');

      // Adjust temperature
      const temperatureSlider = page.locator('[data-testid="temperature-slider"]');
      await temperatureSlider.fill('0.8');

      // Should update temperature display
      await expect(page.locator('[data-testid="temperature-value"]')).toContainText('0.8');

      // Close settings
      await page.click('[data-testid="close-settings-button"]');

      // Send message with new temperature
      await page.fill('[data-testid="message-input"]', 'Creative response please');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });
    });

    test('should allow max tokens configuration', async ({ page }) => {
      await page.goto('/ai/chat');

      await page.click('[data-testid="chat-settings-button"]');

      // Set max tokens
      const maxTokensInput = page.locator('[data-testid="max-tokens-input"]');
      await maxTokensInput.fill('500');

      await page.click('[data-testid="close-settings-button"]');

      // Send message
      await page.fill('[data-testid="message-input"]', 'Give me a detailed explanation');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });

      // Response should respect token limit (hard to test exact length)
      const response = await page.locator('[data-testid="ai-message"]').last().textContent();
      expect(response).toBeTruthy();
    });
  });

  test.describe('System Prompts', () => {
    test('should allow custom system prompt', async ({ page }) => {
      await page.goto('/ai/chat');

      await page.click('[data-testid="chat-settings-button"]');

      // Set system prompt
      const systemPromptInput = page.locator('[data-testid="system-prompt-input"]');
      await systemPromptInput.fill('You are a helpful math tutor. Always explain step by step.');

      await page.click('[data-testid="close-settings-button"]');

      // Send math question
      await page.fill('[data-testid="message-input"]', 'How do I solve 2x + 5 = 15?');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });

      // Response should reflect the system prompt
      const response = await page.locator('[data-testid="ai-message"]').last().textContent();
      expect(response?.toLowerCase()).toContain('step');
    });

    test('should provide preset system prompts', async ({ page }) => {
      await page.goto('/ai/chat');

      await page.click('[data-testid="chat-settings-button"]');

      // Open preset prompts
      await page.click('[data-testid="preset-prompts-button"]');

      // Should show preset options
      await expect(page.locator('[data-testid="preset-academic"]')).toBeVisible();
      await expect(page.locator('[data-testid="preset-creative"]')).toBeVisible();
      await expect(page.locator('[data-testid="preset-coding"]')).toBeVisible();

      // Select academic preset
      await page.click('[data-testid="preset-academic"]');

      // Should update system prompt
      const systemPromptInput = page.locator('[data-testid="system-prompt-input"]');
      const promptValue = await systemPromptInput.inputValue();
      expect(promptValue).toContain('academic');
    });
  });

  test.describe('Usage Tracking', () => {
    test('should display token usage', async ({ page }) => {
      await page.goto('/ai/chat');

      // Send a message
      await page.fill('[data-testid="message-input"]', 'Count my tokens');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });

      // Should show token usage
      await expect(page.locator('[data-testid="tokens-used"]')).toBeVisible();
      await expect(page.locator('[data-testid="tokens-used"]')).not.toContainText('0');
    });

    test('should display cost information', async ({ page }) => {
      await page.goto('/ai/chat');

      // Send a message
      await page.fill('[data-testid="message-input"]', 'What does this cost?');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });

      // Should show cost (may be $0.00 for free providers)
      await expect(page.locator('[data-testid="message-cost"]')).toBeVisible();
    });

    test('should show session usage summary', async ({ page }) => {
      await page.goto('/ai/chat');

      // Send multiple messages
      for (let i = 0; i < 3; i++) {
        await page.fill('[data-testid="message-input"]', `Message ${i + 1}`);
        await page.click('[data-testid="send-button"]');
        await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });
      }

      // Check session summary
      await page.click('[data-testid="usage-summary-button"]');

      await expect(page.locator('[data-testid="session-messages"]')).toContainText('3');
      await expect(page.locator('[data-testid="session-tokens"]')).not.toContainText('0');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle AI service errors gracefully', async ({ page }) => {
      // Intercept AI request and simulate error
      await page.route('**/api/ai/chat', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'AI service unavailable' }),
        });
      });

      await page.goto('/ai/chat');

      await page.fill('[data-testid="message-input"]', 'This should fail');
      await page.click('[data-testid="send-button"]');

      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('service unavailable');

      // Should offer retry option
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should handle network timeouts', async ({ page }) => {
      // Intercept and delay AI request
      await page.route('**/api/ai/chat', async route => {
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
        route.continue();
      });

      await page.goto('/ai/chat');

      await page.fill('[data-testid="message-input"]', 'This will timeout');
      await page.click('[data-testid="send-button"]');

      // Should show timeout error
      await expect(page.locator('[data-testid="timeout-error"]')).toBeVisible({ timeout: 35000 });
    });

    test('should handle rate limiting', async ({ page }) => {
      // Simulate rate limit response
      await page.route('**/api/ai/chat', route => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Rate limit exceeded' }),
        });
      });

      await page.goto('/ai/chat');

      await page.fill('[data-testid="message-input"]', 'Rate limited message');
      await page.click('[data-testid="send-button"]');

      // Should show rate limit message
      await expect(page.locator('[data-testid="rate-limit-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="rate-limit-error"]')).toContainText('rate limit');
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/ai/chat');

      // Tab to message input
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="message-input"]')).toBeFocused();

      // Type message
      await page.keyboard.type('Keyboard navigation test');

      // Tab to send button
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="send-button"]')).toBeFocused();

      // Send with Enter
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/ai/chat');

      // Check ARIA labels
      await expect(page.locator('[data-testid="message-input"]')).toHaveAttribute('aria-label', 'Type your message');
      await expect(page.locator('[data-testid="send-button"]')).toHaveAttribute('aria-label', 'Send message');
      await expect(page.locator('[data-testid="chat-history"]')).toHaveAttribute('role', 'log');
    });

    test('should announce new messages to screen readers', async ({ page }) => {
      await page.goto('/ai/chat');

      await page.fill('[data-testid="message-input"]', 'Screen reader test');
      await page.click('[data-testid="send-button"]');

      // AI response should have proper ARIA attributes
      await expect(page.locator('[data-testid="ai-message"]').last()).toHaveAttribute('role', 'status');
      await expect(page.locator('[data-testid="ai-message"]').last()).toHaveAttribute('aria-live', 'polite');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/ai/chat');

      // Chat interface should be visible and usable
      await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
      await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="send-button"]')).toBeVisible();

      // Should be able to send messages
      await page.fill('[data-testid="message-input"]', 'Mobile test message');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });
    });

    test('should handle touch interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/ai/chat');

      // Test touch interactions
      await page.tap('[data-testid="message-input"]');
      await page.fill('[data-testid="message-input"]', 'Touch interaction test');
      await page.tap('[data-testid="send-button"]');

      await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });
    });
  });
});