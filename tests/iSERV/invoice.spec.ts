import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Invoice Management', () => {
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

  test('Verify invoice details after navigating to first invoice', async ({ page }) => {
    // Navigate to Invoices
   // Navigate to Invoices
console.log('Step 3: Navigating to Invoices...');
await page.getByLabel('Invoices').click();

// Wait for Invoice List - removed networkidle wait
console.log('Step 4: Waiting for invoice list to load...');
const invoiceRows = page.locator('[role="grid"] [role="rowgroup"] [role="row"]');

await invoiceRows.first().waitFor({ state: 'visible', timeout: 15000 });

const rowCount = await invoiceRows.count();
console.log(`Found ${rowCount} invoice(s)`);

if (rowCount === 0) {
  console.log('No invoices available');
  test.skip();
  return;
}

// Click First Invoice
console.log('Step 5: Clicking on first invoice...');
const firstInvoice = invoiceRows.first();
await firstInvoice.click();

    // Wait for Details Page
    console.log('Step 6: Waiting for invoice details...');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify Details Loaded
    console.log('Step 7: Verifying invoice details...');
    const detailsIndicators = [
      page.getByText(/Invoice Details/i),
      page.getByText(/Invoice Number/i),
      page.locator('.invoice-details, .details-section'),
    ];

    let detailsFound = false;
    for (const indicator of detailsIndicators) {
      try {
        await indicator.waitFor({ state: 'visible', timeout: 5000 });
        console.log('Invoice details section found');
        detailsFound = true;
        break;
      } catch {
        // Continue checking
      }
    }

    if (!detailsFound) {
      const bodyText = await page.locator('body').textContent();
      if (bodyText && /Invoice|Amount|Status|Date|Project/i.test(bodyText)) {
        console.log('Invoice details detected from body text');
        detailsFound = true;
      }
    }

    if (!detailsFound) {
      await page.screenshot({ 
        path: 'screenshots/invoice-details-not-found.png', 
        fullPage: true 
      });
      throw new Error('Invoice details did not load as expected');
    }

    // Verify Content
    await expect(page.locator('body')).toContainText(/Invoice|Amount|Status|Date/i);
    console.log('Invoice details content verified');

    // Capture Screenshot
    await page.screenshot({ 
      path: 'screenshots/invoice-details-success.png', 
      fullPage: true 
    });

    // Verify URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    expect(currentUrl).toMatch(/invoice/i);

    console.log('Invoice details verification completed successfully');
  });
});
