/**
 * Global setup for Playwright E2E tests
 * Runs once before all tests to prepare the test environment
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up E2E test environment...');

  // Launch browser for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the application to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
    
    console.log(`Waiting for application at ${baseURL}...`);
    
    // Wait for the app to be available with retries
    let retries = 30;
    while (retries > 0) {
      try {
        await page.goto(baseURL, { timeout: 5000 });
        
        // Check if the app is loaded by looking for a common element
        await page.waitForSelector('body', { timeout: 5000 });
        
        console.log('✅ Application is ready');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(`Application not ready after 30 attempts: ${error}`);
        }
        console.log(`Retrying... (${30 - retries}/30)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Setup test data
    await setupTestData(page, baseURL);

    // Create test users if needed
    await createTestUsers(page, baseURL);

    console.log('✅ E2E test environment setup complete');

  } catch (error) {
    console.error('❌ Failed to setup E2E test environment:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function setupTestData(page: any, baseURL: string) {
  console.log('Setting up test data...');
  
  try {
    // Reset test database
    const response = await page.evaluate(async (url: string) => {
      const res = await fetch(`${url.replace('3000', '3001')}/api/test/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.ok;
    }, baseURL);

    if (response) {
      console.log('✅ Test database reset');
    } else {
      console.warn('⚠️ Could not reset test database');
    }
  } catch (error) {
    console.warn('⚠️ Test data setup failed:', error);
  }
}

async function createTestUsers(page: any, baseURL: string) {
  console.log('Creating test users...');

  const testUsers = [
    {
      email: 'student@e2e.test',
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'Student',
      role: 'student',
    },
    {
      email: 'teacher@e2e.test',
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'Teacher',
      role: 'teacher',
    },
    {
      email: 'admin@e2e.test',
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'Admin',
      role: 'admin',
    },
  ];

  for (const user of testUsers) {
    try {
      const created = await page.evaluate(async (userData: any, url: string) => {
        const res = await fetch(`${url.replace('3000', '3001')}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        return res.ok;
      }, user, baseURL);

      if (created) {
        console.log(`✅ Created test user: ${user.email}`);
      } else {
        console.log(`ℹ️ Test user already exists: ${user.email}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to create test user ${user.email}:`, error);
    }
  }
}

export default globalSetup;