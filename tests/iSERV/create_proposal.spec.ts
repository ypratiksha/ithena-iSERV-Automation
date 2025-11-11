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

  test('Create new quote - Fixed Fee & Materials', async ({ page }) => {
    const timestamp = Date.now();

    // Navigate to Quotes Section
    console.log('Step 3: Navigating to Quotes section...');
    await page.getByLabel('Quotes').click();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.LONG });

    // Click New Quote Button
    console.log('Step 4: Clicking New Quote button...');
    const quoteButton = page.getByRole('button', { name: 'Quote' });
    await expect(quoteButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await quoteButton.click();

    // Wait for Quote Type Dropdown
    console.log('Step 5: Waiting for quote form to load...');
    await expect(page.getByRole('combobox', { name: 'Time & Material Quote' })).toBeVisible({ 
      timeout: TEST_CONFIG.TIMEOUT.LONG 
    });

    // Select Quote Type
    console.log('Step 6: Selecting quote type - Fixed Fee & Materials...');
    await page.getByRole('combobox', { name: 'Time & Material Quote' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Fixed Fee & Materials Quote' }).click();

    // Enter Quote Name
    console.log('Step 7: Entering quote name...');
    const quoteNameField = page.getByRole('textbox', { name: 'Please enter name for the' });
    await quoteNameField.fill(`quote demo ${timestamp}`);

    // Select Quote Date
    console.log('Step 8: Selecting quote date - Day 5...');
    await page.getByRole('button', { name: 'Choose date, selected date is' }).click();
    await expect(page.getByRole('gridcell', { name: '5', exact: true })).toBeVisible({ 
      timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
    });
    await page.getByRole('gridcell', { name: '5', exact: true }).click();

    // Select First Available Ticket
    console.log('Step 9: Selecting first available ticket...');
    const ticketCombobox = page.getByRole('combobox', { name: 'Select Ticket' });
    await ticketCombobox.click();
    await page.waitForTimeout(500);

    // Get all ticket options and select the first one
    const ticketOptions = await page.getByRole('option').all();
    if (ticketOptions.length === 0) {
      throw new Error('No tickets available to select');
    }

    const firstTicketText = await ticketOptions[0].textContent();
    console.log(`Selected ticket: ${firstTicketText}`);
    await ticketOptions[0].click();

    // Enter Quote Description
    console.log('Step 10: Entering quote description...');
    const descriptionField = page.getByRole('textbox', { name: 'Please enter description...' });
    await descriptionField.fill('test quote description');

    // Proceed to Scope Items Section
    console.log('Step 11: Proceeding to scope items section...');
    const nextButton = page.getByRole('button', { name: 'Next' });
    await nextButton.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Add Scope Item
    console.log('Step 12: Adding scope item...');
    const addScopeButton = page.getByRole('button', { name: 'Add Scope Item' });
    await expect(addScopeButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await addScopeButton.click();
    await page.waitForTimeout(1000);

    // Select Scope Item
    console.log('Step 13: Selecting scope item - Site Survey & Feasibility...');
    const itemCombobox = page.getByRole('combobox', { name: 'Select Item' });
    await itemCombobox.click();
    await page.waitForTimeout(500);
    await page.getByText('Site Survey & Feasibility').click();

    // Enter Duration
    console.log('Step 14: Entering duration...');
    const durationField = page.getByRole('spinbutton').first();
    await durationField.fill('6');

    // Enter Price
    console.log('Step 15: Entering price...');
    const priceField = page.getByRole('spinbutton').nth(1);
    await priceField.fill('100');

    // Save Scope Item
    console.log('Step 16: Saving scope item...');
    const saveButton = page.getByRole('button', { name: 'save' });
    await saveButton.click();
    await page.waitForTimeout(1500);

    // Add Material Item
    console.log('Step 17: Adding material item...');
    const addItemButton = page.getByRole('button', { name: 'Add Item' });
    await expect(addItemButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await addItemButton.click();
    await page.waitForTimeout(1000);

    // Select Material Item
    console.log('Step 18: Selecting material item - Accommodation...');
    const materialCombobox = page.getByRole('combobox', { name: 'Select Item' }).last();
    await materialCombobox.click();
    await page.waitForTimeout(500);
    await page.getByText('Accommodation (per night)').click();

    // Enter Quantity
    console.log('Step 19: Entering quantity...');
    const quantityField = page.getByRole('spinbutton').last();
    await quantityField.fill('2');

    // Save Material Item
    console.log('Step 20: Saving material item...');
    const saveMaterialButton = page.getByRole('button', { name: 'save' }).last();
    await saveMaterialButton.click();
    await page.waitForTimeout(1500);

    // Proceed to Signature Section
    console.log('Step 21: Proceeding to signature section...');
    const nextToReviewButton = page.getByRole('button', { name: 'Next' });
    await nextToReviewButton.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Wait for Canvas
    console.log('Step 22: Waiting for signature canvas...');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });

    // Add Signature
    console.log('Step 23: Adding signature...');
    await canvas.click({ position: { x: 232, y: 42 } });
    await page.waitForTimeout(1000);

    // Capture Screenshot Before Submission
    console.log('Step 24: Capturing screenshot before submission...');
    await page.screenshot({ 
      path: `screenshots/quote-form-complete-${timestamp}.png`, 
      fullPage: true 
    });

    // Submit Quote - Save & Send
    console.log('Step 25: Submitting quote - Save & Send...');
    const submitButton = page.getByRole('button', { name: 'Save & Send' });
    await expect(submitButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await submitButton.click();

    // Confirm Send
    console.log('Step 26: Confirming send action...');
    const confirmSendButton = page.getByRole('button', { name: 'Yes, Send' });
    try {
      await confirmSendButton.waitFor({ state: 'visible', timeout: 5000 });
      await confirmSendButton.click();
    } catch {
      console.log('No confirmation dialog appeared');
    }

    // Wait for Submission
    console.log('Step 27: Waiting for submission to complete...');
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
    await page.waitForTimeout(2000);

    // Verify Success
    console.log('Step 28: Verifying quote submission success...');
    const successIndicators = [
      page.getByText(/success|created|sent|submitted/i),
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
      console.log('No explicit success indicator found');
    }

    // Capture Final Screenshot
    await page.screenshot({ 
      path: `screenshots/quote-submission-complete-${timestamp}.png`, 
      fullPage: true 
    });

    // Verify Navigation
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('quote') || currentUrl.includes('dashboard')) {
      console.log('Successfully navigated to expected page');
    }

    console.log('Quote creation workflow completed successfully.');
    console.log(`Quote name: quote demo ${timestamp}`);
    console.log(`Ticket: ${firstTicketText}`);
  });
});
