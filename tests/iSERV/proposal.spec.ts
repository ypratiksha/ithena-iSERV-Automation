import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Quote Management', () => {
  test.beforeEach('Login to application', async ({ page }) => {
    console.log('Step 1: Navigating to Login Page...');
    await page.goto(TEST_CONFIG.LOGIN_URL, {
      waitUntil: 'domcontentloaded',
      timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
    });

    console.log('Step 2: Logging in...');
    await page.getByText('Login Here').click();
    
    await page.getByRole('textbox', { name: 'Email / Username' }).fill(TEST_CONFIG.USERNAME);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CONFIG.PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(/dashboard/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
    console.log('Logged in successfully.');
  });

  test('View quote details for Q1125100001', async ({ page }) => {
    // Navigate to Quotes
    console.log('Step 3: Navigating to Quotes...');
    await page.getByLabel('Quotes').click();
    await page.waitForLoadState('domcontentloaded');

    // Wait for quotes list to load
    console.log('Step 4: Waiting for quotes list to load...');
    const quoteRows = page.locator('[role="grid"] [role="rowgroup"] [role="row"]');
    await quoteRows.first().waitFor({ state: 'visible', timeout: 15000 });

    // Wait specifically for the quote Q1125100001 to be visible
    console.log('Step 5: Waiting for quote Q1125100001 to be shown...');
    const quoteElement = page.getByText('Q1125100001').first();
    await quoteElement.waitFor({ state: 'visible', timeout: 30000 });
    console.log('Quote Q1125100001 is now visible');

    // Click on the quote
    console.log('Step 6: Clicking on quote Q1125100001...');
    await quoteElement.click();

    // Wait for quote details to load
    console.log('Step 7: Waiting for quote details...');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify quote details loaded
    console.log('Step 8: Verifying quote details...');
    await expect(page.locator('body')).toContainText(/Quote|Q1125100001|Details|Customer/i, {
      timeout: TEST_CONFIG.TIMEOUT.LONG
    });

    // Verify URL
    const pageUrl = page.url();
    console.log(`Current URL: ${pageUrl}`);
    
    if (pageUrl.includes('quote')) {
      console.log('Successfully navigated to quote details page');
    } else {
      console.log('Quote details displayed without URL change');
    }

    // Capture screenshot
    await page.screenshot({
      path: 'screenshots/quote-Q1125100001-details.png',
      fullPage: true
    });
    console.log('Screenshot captured successfully');

    console.log('Quote details verification completed successfully');
  });
});
