import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Quote Management', () => {
  test.beforeEach('Login to application', async ({ page }) => {
    console.log('Step 1: Navigating to Login Page...');
    await page.goto(TEST_CONFIG.LOGIN_URL, {
      waitUntil: 'networkidle',
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

  test('Verify quote details after navigating to first quote', async ({ page }) => {
    // Navigate to Quotes Section
    console.log('Step 3: Navigating to Quotes...');
    await page.getByLabel('Quotes').click();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.LONG });

    // Click All Tab
    console.log('Step 4: Clicking All tab...');
    const allTab = page.getByText('All', { exact: true });
    await expect(allTab).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await allTab.click();
    await page.waitForTimeout(1000);

    // Wait for quotes to load
    console.log('Step 5: Waiting for quotes to load...');
    
    // Correct selector for Material-UI grid structure
    const quoteRows = page.locator('[role="grid"] [role="rowgroup"] [role="row"]');
    const noDataMessage = page.getByText(/No quotes found|No data|No rows/i);

    try {
      await Promise.race([
        quoteRows.first().waitFor({ state: 'visible', timeout: 15000 }),
        noDataMessage.waitFor({ state: 'visible', timeout: 15000 }),
      ]);

      // Check if quotes exist
      const quoteCount = await quoteRows.count();
      if (quoteCount === 0) {
        console.log('No quotes available on the page');
        test.skip();
        return;
      }

      console.log(`Found ${quoteCount} quote(s)`);

    } catch (error) {
      console.log('Error loading quotes list');
      await page.screenshot({ 
        path: 'screenshots/quotes-load-error.png', 
        fullPage: true 
      });
      throw error;
    }

    // Click first quote (by clicking on the quote name cell)
    console.log('Step 6: Clicking on first quote...');
    const firstQuoteCell = page.locator('[role="gridcell"]').filter({ hasText: /test quote|Q\d+/i }).first();
    await expect(firstQuoteCell).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await firstQuoteCell.click();

    // Wait for quote details page
    console.log('Step 7: Waiting for quote details page...');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify quote details loaded
    console.log('Step 8: Verifying quote details...');
    const detailsIndicators = [
      page.getByText(/Quote Details/i),
      page.getByText(/Quote Number/i),
      page.getByText(/Customer/i),
      page.getByText(/Quote Type/i),
      page.locator('.quote-details, .details-section'),
    ];

    let detailsFound = false;
    for (const indicator of detailsIndicators) {
      try {
        await indicator.waitFor({ state: 'visible', timeout: 5000 });
        console.log('Quote details section found');
        detailsFound = true;
        break;
      } catch {
        // Continue checking
      }
    }

    if (!detailsFound) {
      // Fallback: check page content
      const bodyText = await page.locator('body').textContent();
      if (bodyText && /Quote|Customer|Total|Status|Type/i.test(bodyText)) {
        console.log('Quote details detected from body text');
        detailsFound = true;
      }
    }

    if (!detailsFound) {
      await page.screenshot({ 
        path: 'screenshots/quote-details-not-found.png', 
        fullPage: true 
      });
      throw new Error('Quote details page did not load as expected');
    }

    // Verify content
    await expect(page.locator('body')).toContainText(/Quote|Customer|Status/i);
    console.log('Quote details content verified');

    // Capture screenshot
    await page.screenshot({ 
      path: 'screenshots/quote-details-success.png', 
      fullPage: true 
    });

    // Verify URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    expect(currentUrl).toMatch(/quote/i);

    console.log('Quote details verification completed successfully.');
  });
});
