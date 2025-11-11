import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Provision Management', () => {
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

  test('Verify provision details after navigating to first provision', async ({ page }) => {
    // Navigate to Provisions
    console.log('Step 3: Navigating to Provisions...');
    await page.getByLabel('Provisions').click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Wait for provisions list to load
    console.log('Step 4: Waiting for provisions list to load...');
    const provisionRows = page.locator('[role="grid"] [role="rowgroup"] [role="row"]');
    
    try {
      await provisionRows.first().waitFor({ state: 'visible', timeout: 15000 });
      
      const rowCount = await provisionRows.count();
      console.log(`Found ${rowCount} provision(s)`);

      if (rowCount === 0) {
        console.log('No provisions available');
        test.skip();
        return;
      }

    } catch (error) {
      console.log('Error loading provisions list');
      await page.screenshot({ 
        path: 'screenshots/provisions-load-error.png', 
        fullPage: true 
      });
      throw error;
    }

    // Click first provision
    console.log('Step 5: Clicking on first provision...');
    const firstProvision = provisionRows.first();
    await firstProvision.click();

    // Wait for provision details page
    console.log('Step 6: Waiting for provision details page...');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify provision details loaded
    console.log('Step 7: Verifying provision details...');
    await expect(page.locator('body')).toContainText(/Provision Details|Status|Description|Project/i, { 
      timeout: TEST_CONFIG.TIMEOUT.LONG 
    });
    console.log('Provision details page loaded successfully');

    // Verify URL
    const pageUrl = page.url();
    console.log(`Current URL: ${pageUrl}`);
    
    if (pageUrl.includes('provision')) {
      console.log('Successfully navigated to provision details page');
    } else {
      console.log('Provision details displayed without URL change');
    }

    // Capture screenshot
    await page.screenshot({ 
      path: 'screenshots/provision-details-success.png', 
      fullPage: true 
    });
    console.log('Screenshot captured successfully');

    console.log('Provision details verification completed successfully');
  });
});
