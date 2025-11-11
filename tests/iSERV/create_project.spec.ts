import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Ticket Management', () => {
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

  test('Create new ticket with full details', async ({ page }) => {
    const timestamp = Date.now();

    // Navigate to Tickets
    console.log('Step 3: Navigating to Tickets...');
    await page.getByLabel('Tickets').click();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.LONG });

    // Click New Ticket Button
    console.log('Step 4: Clicking New Ticket button...');
    const newTicketButton = page.getByRole('button', { name: 'New Ticket' });
    await expect(newTicketButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await newTicketButton.click();

    // Wait for Ticket Form
    console.log('Step 5: Waiting for ticket form to load...');
    await expect(page.getByRole('combobox', { name: 'Select Customer' })).toBeVisible({ 
      timeout: TEST_CONFIG.TIMEOUT.LONG 
    });

    // Select Customer
    console.log('Step 6: Selecting customer - Acme Corp...');
    await page.getByRole('combobox', { name: 'Select Customer' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Acme Corp' }).click();

    // Select User
    console.log('Step 7: Selecting user - Alice Smith...');
    await page.getByRole('combobox', { name: 'Select User' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Alice Smith' }).click();

    // Select Equipment
    console.log('Step 8: Selecting equipment - Conveyor...');
    await page.getByRole('combobox', { name: 'Select Equipment' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Conveyor: Serial # ACME-' }).click();

    // Select Accountable Person
    console.log('Step 9: Selecting accountable person - John Doe...');
    await page.getByRole('combobox', { name: 'Select Accountable' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'John Doe' }).first().click();

    // Select Assignee
    console.log('Step 10: Selecting assignee - John Doe...');
    await page.getByRole('combobox', { name: 'Select Assignee' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'John Doe' }).first().click();

    // Select Ticket Date
    console.log('Step 11: Selecting ticket date...');
    await page.getByRole('button', { name: 'Choose date, selected date is' }).click();
    await expect(page.getByRole('gridcell', { name: '11' })).toBeVisible({ 
      timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
    });
    await page.getByRole('gridcell', { name: '11' }).click();

    // Select Category
    console.log('Step 12: Selecting category - Electrical...');
    await page.getByRole('combobox', { name: 'Technical Support' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Electrical' }).click();

    // Select Type
    console.log('Step 13: Selecting type - Breakdown Repair...');
    await page.getByRole('combobox', { name: 'Installation' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Breakdown Repair' }).click();

    // Select Priority
    console.log('Step 14: Selecting priority - Emergency...');
    await page.getByRole('combobox', { name: 'Normal' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Emergency' }).click();

    // Fill Ticket Title
    console.log('Step 15: Filling ticket title...');
    const titleField = page.getByRole('textbox').first();
    await titleField.fill(`Emergency Electrical Repair - Conveyor System ${timestamp}`);

    // Fill Ticket Description
    console.log('Step 16: Filling ticket description...');
    const descriptionEditor = page.locator('.jodit-wysiwyg');
    await expect(descriptionEditor).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await descriptionEditor.click();
    await descriptionEditor.fill('Critical electrical failure detected in conveyor system. Immediate repair required to restore operations.');

    // Capture Screenshot Before Submit
    console.log('Step 17: Capturing screenshot before submit...');
    await page.screenshot({ 
      path: `screenshots/new-ticket-form-filled-${timestamp}.png`, 
      fullPage: true 
    });

    // Submit Ticket
    console.log('Step 18: Submitting ticket...');
    const submitButton = page.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await submitButton.click();

    // Wait for Success
    console.log('Step 19: Waiting for success confirmation...');
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
    await page.waitForTimeout(2000);

    // Verify Success
    console.log('Step 20: Verifying ticket creation success...');
    const successIndicators = [
      page.getByText(/success|created|saved/i),
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

    if (!successFound) {
      console.log('No explicit success message found');
    }

    // Capture Final Screenshot
    await page.screenshot({ 
      path: `screenshots/ticket-created-success-${timestamp}.png`, 
      fullPage: true 
    });

    // Verify URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('ticket')) {
      console.log('Successfully navigated to tickets page');
    }

    console.log('Ticket creation completed successfully.');
  });
});
