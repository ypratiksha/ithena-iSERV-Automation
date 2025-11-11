// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';

// Configure dotenv to suppress advertisements/messages
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env'),
  quiet: true  // This suppresses the dotenv runtime messages
});

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Multiple reporters for comprehensive reporting */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
     ['allure-playwright'],
    ['line'] // Console output
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like await page.goto('') */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* Screenshots configuration */
    screenshot: 'only-on-failure', // Options: 'off', 'on', 'only-on-failure'
    
    /* Video recording configuration */
    video: 'retain-on-failure', // Options: 'off', 'on', 'retain-on-failure', 'on-first-retry'
    
    /* Trace collection - interactive debugging */
    trace: 'on-first-retry', // Options: 'off', 'on', 'retain-on-failure', 'on-first-retry'
    
    /* Additional useful settings */
    headless: false, // Set to false to see browser during test development
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    
    /* Action and navigation timeouts */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  
  /* Global test timeout */
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  
  /* Output directory for test artifacts */
  outputDir: 'test-results/',
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Override settings for chromium if needed
        video: 'on', // Always record video for chromium
        screenshot: 'on', // Always take screenshots for chromium
      },
    },
    
    // Uncomment other browsers as needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  
  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
});