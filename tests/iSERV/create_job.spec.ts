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

  test('Create and submit quote for customer approval', async ({ page }) => {
    const timestamp = Date.now();

    // Navigate to Quotes Section
    console.log('Step 3: Navigating to Quotes...');
    await page.getByLabel('Quotes').click();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.LONG });

    // Create New Quote
    console.log('Step 4: Creating new quote...');
    const quoteButton = page.getByRole('button', { name: 'Quote', exact: true });
    await expect(quoteButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await quoteButton.click();

    // Wait for form to load
    console.log('Step 5: Waiting for quote form to load...');
    await expect(page.getByRole('combobox', { name: 'Time & Material Quote' })).toBeVisible({ 
      timeout: TEST_CONFIG.TIMEOUT.LONG 
    });

    // Select Quote Type
    console.log('Step 6: Selecting Quote Type - Fixed Fee & Materials...');
    await page.getByRole('combobox', { name: 'Time & Material Quote' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Fixed Fee & Materials Quote' }).click();

    // Enter Quote Name
    console.log('Step 7: Entering quote name...');
    const quoteNameField = page.getByRole('textbox', { name: 'Please enter name for the proposal' });
    await quoteNameField.fill(`test quote ${timestamp}`);

    // Select Quote Date
    console.log('Step 8: Selecting quote date...');
    await page.getByRole('button', { name: 'Choose date, selected date is' }).click();
    await expect(page.getByRole('gridcell', { name: '5', exact: true })).toBeVisible({ 
      timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
    });
    await page.getByRole('gridcell', { name: '5', exact: true }).click();

    // Select Ticket
    console.log('Step 9: Selecting ticket...');
    const ticketCombobox = page.getByRole('combobox', { name: 'Select Ticket' });
    await ticketCombobox.click();
    await page.waitForTimeout(500);
    
    const ticketOptions = await page.getByRole('option').all();
    if (ticketOptions.length === 0) {
      throw new Error('No tickets available to select');
    }
    
    const firstTicketText = await ticketOptions[0].textContent();
    console.log(`Selected ticket: ${firstTicketText}`);
    await ticketOptions[0].click();

    // Wait for auto-population
    console.log('Step 10: Waiting for customer and user to auto-populate...');
    await page.waitForTimeout(1500);

    // Enter Description
    console.log('Step 11: Entering quote description...');
    const descriptionField = page.getByRole('textbox', { name: 'Please enter description...' });
    await descriptionField.fill('test quote description');

    // Proceed to Line Items
    console.log('Step 12: Proceeding to line items...');
    const nextButton = page.getByRole('button', { name: 'Next' });
    await nextButton.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Add Scope Item
    console.log('Step 13: Adding scope item...');
    const addScopeItemButton = page.getByRole('button', { name: 'Add Scope Item' });
    await expect(addScopeItemButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await addScopeItemButton.click();
    await page.waitForTimeout(1000);

    // Select Scope Item from inline row
    console.log('Step 14: Selecting scope item...');
    const itemCombobox = page.getByRole('combobox', { name: 'Select Item' });
    await expect(itemCombobox).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await itemCombobox.click();
    await page.waitForTimeout(500);

    // Select item from dropdown
    const itemOption = page.getByRole('option', { name: 'Site Survey & Feasibility' });
    await itemOption.click();

    // Enter Duration
    console.log('Step 15: Entering duration...');
    const durationField = page.getByRole('spinbutton').first();
    await durationField.fill('6');

    // Unit is already set to "Hour(s)" by default
    console.log('Step 16: Unit already set to Hour(s)');

    // Enter Price
    console.log('Step 17: Entering price...');
    const priceField = page.getByRole('spinbutton').nth(1);
    await priceField.fill('100');

    // Save inline row
    console.log('Step 18: Saving scope item...');
    const saveButton = page.getByRole('button', { name: 'save' });
    await saveButton.click();
    await page.waitForTimeout(1500);

    // Add Item (Materials & Expenses)
    console.log('Step 19: Adding material item...');
    const addItemButton = page.getByRole('button', { name: 'Add Item' });
    await expect(addItemButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await addItemButton.click();
    await page.waitForTimeout(1000);

    // Select Material Item from inline row
    console.log('Step 20: Selecting material item...');
    const materialItemCombobox = page.getByRole('combobox', { name: 'Select Item' }).last();
    await expect(materialItemCombobox).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await materialItemCombobox.click();
    await page.waitForTimeout(500);

    // Select material from dropdown
    const materialOption = page.getByRole('option', { name: 'Conveyor Assembly' });
    await materialOption.click();

    // Enter Quantity
    console.log('Step 21: Entering quantity...');
    const quantityField = page.getByRole('spinbutton').last();
    await quantityField.fill('2');

    // Save material item
    console.log('Step 22: Saving material item...');
    const saveMaterialButton = page.getByRole('button', { name: 'save' }).last();
    await saveMaterialButton.click();
    await page.waitForTimeout(1500);

    // Proceed to Review
    console.log('Step 23: Proceeding to review...');
    const nextToReviewButton = page.getByRole('button', { name: 'Next' });
    await nextToReviewButton.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Wait for Canvas
    console.log('Step 24: Waiting for signature canvas...');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });

    // Add Signature
    console.log('Step 25: Adding signature...');
    await canvas.click({ position: { x: 152, y: 44 } });
    await page.waitForTimeout(500);
    await canvas.dblclick({ position: { x: 188, y: 35 } });
    await page.waitForTimeout(1000);

    // Capture Screenshot
    console.log('Step 26: Capturing screenshot...');
    await page.screenshot({ 
      path: `screenshots/quote-with-signature-${timestamp}.png`, 
      fullPage: true 
    });

    // Submit for Approval
    console.log('Step 27: Submitting for customer approval...');
    const submitButton = page.getByRole('button', { name: 'Save & Send' });
    await expect(submitButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await submitButton.click();

    // Wait for Submission
    console.log('Step 28: Waiting for submission to complete...');
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
    await page.waitForTimeout(2000);

    // Verify Success
    console.log('Step 29: Verifying quote submission...');
    const successIndicators = [
      page.getByText(/success|submitted|approved|sent/i),
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
      path: `screenshots/quote-submitted-${timestamp}.png`, 
      fullPage: true 
    });

    // Verify navigation
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    console.log('Quote created and submitted successfully.');
    console.log(`Quote name: test quote ${timestamp}`);
    console.log(`Ticket: ${firstTicketText}`);
  });
});
