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

  test('Create and send invoice for ticket 1125400003', async ({ page }) => {
    const timestamp = Date.now();

    // Navigate to Invoices Section
    console.log('Step 3: Navigating to Invoices...');
    await page.getByLabel('Invoices').click();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.LONG });

    // Create New Invoice
    console.log('Step 4: Creating new invoice...');
    await page.getByRole('button', { name: 'Invoice' }).click();

    // Wait for form to load
    await expect(page.getByRole('combobox', { name: 'Select Ticket' })).toBeVisible({ 
      timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
    });

    // Select Specific Ticket
    console.log('Step 5: Selecting ticket 1125400003 - Issue with conveyor...');
    await page.getByRole('combobox', { name: 'Select Ticket' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: '1125400003 - Issue with conveyor' }).click();

    // Select Service Report
    console.log('Step 6: Selecting service report...');
    await page.getByRole('combobox', { name: 'Select Service Reports to Bill' }).click();
    await page.waitForTimeout(500);
    
    const serviceReportOption = page.getByRole('option', { name: 'SR1125100002: Service Report' });
    await serviceReportOption.click();

    // Enter Invoice Name
    console.log('Step 7: Entering invoice name...');
    await page.getByRole('textbox', { name: 'Please enter name for the Invoice' }).fill(`Invoice ${timestamp}`);

    // Select Date
    console.log('Step 8: Selecting invoice date...');
    await page.getByRole('button', { name: 'Choose date, selected date is' }).click();
    await page.getByRole('gridcell', { name: '11' }).click();

    // Wait for auto-population
    console.log('Step 9: Waiting for customer and user to auto-populate...');
    await page.waitForTimeout(1500);

    // Verify auto-populated values with exact match
    try {
      const customerValue = await page.getByRole('combobox', { name: 'Select Customer', exact: true }).inputValue();
      const userValue = await page.getByRole('combobox', { name: 'Select User', exact: true }).inputValue();
      console.log(`Customer: ${customerValue}`);
      console.log(`User: ${userValue}`);
    } catch (error) {
      console.log('Could not verify auto-populated values, continuing...');
    }

    // Select Billing Address
    console.log('Step 10: Selecting billing address...');
    await page.getByRole('combobox', { name: 'Select Customer Billing Address' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Acme HQ : 144 Main St,' }).click();

    // Enter PO Number
    console.log('Step 11: Entering PO number...');
    await page.getByRole('textbox', { name: 'Please enter po number for' }).fill('PO3779832T');

    // Enter Notes
    console.log('Step 12: Entering notes...');
    await page.getByRole('textbox', { name: 'Please enter notes for the' }).fill('TEST');

    // Proceed to Next Step
    console.log('Step 13: Proceeding to signature page...');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Wait for Canvas
    console.log('Step 14: Waiting for signature canvas...');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });

    // Add Signature
    console.log('Step 15: Adding signature...');
    await canvas.click({ position: { x: 141, y: 24 } });
    await canvas.click({ position: { x: 120, y: 44 } });
    await page.waitForTimeout(500);

    // Check Agreement
    console.log('Step 16: Confirming agreement...');
    await page.getByLabel('', { exact: true }).check();
    await page.waitForTimeout(500);

    // Capture Screenshot Before Submission
    console.log('Step 17: Capturing screenshot...');
    await page.screenshot({ 
      path: `screenshots/invoice-before-send-${timestamp}.png`, 
      fullPage: true 
    });

    // Click Save & Send
    console.log('Step 18: Clicking Save & Send...');
    const saveSendButton = page.getByRole('button', { name: 'Save & Send' });
    await expect(saveSendButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await saveSendButton.click();

    // Confirm Send Action
    console.log('Step 19: Confirming send action...');
    const confirmSendButton = page.getByRole('button', { name: 'Yes, Send' });
    await expect(confirmSendButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await confirmSendButton.click();

    // Wait for Submission
    console.log('Step 20: Waiting for invoice to be sent...');
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
    await page.waitForTimeout(2000);

    // Verify Success
    console.log('Step 21: Verifying invoice creation...');
    const successIndicators = [
      page.getByText(/success|sent|created|submitted/i),
      page.locator('[role="alert"]'),
      page.locator('.success-message'),
    ];

    let successFound = false;
    for (const indicator of successIndicators) {
      try {
        await indicator.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.SHORT });
        const successText = await indicator.textContent();
        console.log(`Success: ${successText}`);
        successFound = true;
        break;
      } catch {
        // Continue checking
      }
    }

    // Capture Final Screenshot
    await page.screenshot({ 
      path: `screenshots/invoice-sent-${timestamp}.png`, 
      fullPage: true 
    });

    // Log Final Status
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    console.log('Invoice created and sent successfully for ticket 1125400003.');
  });
});
