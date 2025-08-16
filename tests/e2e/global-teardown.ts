/**
 * Global teardown for Playwright E2E tests
 * Runs once after all tests to clean up the test environment
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up E2E test environment...');

  // Launch browser for cleanup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';

    // Clean up test data
    await cleanupTestData(page, baseURL);

    // Remove test files if any were created
    await cleanupTestFiles(page, baseURL);

    console.log('✅ E2E test environment cleanup complete');

  } catch (error) {
    console.error('❌ Failed to cleanup E2E test environment:', error);
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await context.close();
    await browser.close();
  }
}

async function cleanupTestData(page: any, baseURL: string) {
  console.log('Cleaning up test data...');
  
  try {
    const response = await page.evaluate(async (url: string) => {
      const res = await fetch(`${url.replace('3000', '3001')}/api/test/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.ok;
    }, baseURL);

    if (response) {
      console.log('✅ Test data cleaned up');
    } else {
      console.warn('⚠️ Could not clean up test data');
    }
  } catch (error) {
    console.warn('⚠️ Test data cleanup failed:', error);
  }
}

async function cleanupTestFiles(page: any, baseURL: string) {
  console.log('Cleaning up test files...');
  
  try {
    // Remove any uploaded test files
    const response = await page.evaluate(async (url: string) => {
      const res = await fetch(`${url.replace('3000', '3001')}/api/test/cleanup-files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.ok;
    }, baseURL);

    if (response) {
      console.log('✅ Test files cleaned up');
    } else {
      console.warn('⚠️ Could not clean up test files');
    }
  } catch (error) {
    console.warn('⚠️ Test file cleanup failed:', error);
  }
}

export default globalTeardown;