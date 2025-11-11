import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';
import ticketData from '../data/ticket-data.json';

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

  test('Create new ticket using JSON data', async ({ page }) => {
    const timestamp = Date.now();

    console.log('Step 3: Navigating to Tickets...');
    await page.getByLabel('Tickets').click();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.LONG });

    console.log('Step 4: Clicking New Ticket button...');
    const newTicketButton = page.getByRole('button', { name: 'New Ticket' });
    await expect(newTicketButton).toBeVisible();
    await newTicketButton.click();

    console.log('Step 5: Waiting for ticket form...');
    await expect(page.getByRole('combobox', { name: 'Select Customer' })).toBeVisible();

    // Select values from JSON data
    await page.getByRole('combobox', { name: 'Select Customer' }).click();
    await page.getByRole('option', { name: ticketData.ticket.customer }).click();

    await page.getByRole('combobox', { name: 'Select User' }).click();
    await page.getByRole('option', { name: ticketData.ticket.user }).click();

    await page.getByRole('combobox', { name: 'Select Equipment' }).click();
    await page.getByRole('option', { name: ticketData.ticket.equipment }).click();

    await page.getByRole('combobox', { name: 'Select Accountable' }).click();
    await page.getByRole('option', { name: ticketData.ticket.accountable }).click();

    await page.getByRole('combobox', { name: 'Select Assignee' }).click();
    await page.getByRole('option', { name: ticketData.ticket.assignee }).click();

    await page.getByRole('button', { name: 'Choose date, selected date is' }).click();
    await page.getByRole('gridcell', { name: '11' }).click();

    await page.getByRole('combobox', { name: 'Technical Support' }).click();
    await page.getByRole('option', { name: ticketData.ticket.category }).click();

    await page.getByRole('combobox', { name: 'Installation' }).click();
    await page.getByRole('option', { name: ticketData.ticket.type }).click();

    await page.getByRole('combobox', { name: 'Normal' }).click();
    await page.getByRole('option', { name: ticketData.ticket.priority }).click();

    // Fill title and description
    const title = `${ticketData.ticket.titlePrefix} ${timestamp}`;
    await page.getByRole('textbox').first().fill(title);

    const descriptionEditor = page.locator('.jodit-wysiwyg');
    await descriptionEditor.click();
    await descriptionEditor.fill(ticketData.ticket.description);

    // Screenshot before submit
    await page.screenshot({ path: `screenshots/ticket-form-${timestamp}.png`, fullPage: true });

    console.log('Step 6: Submitting ticket...');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify success
    const successMessage = page.locator('text=/success|created|saved/i');
    await expect(successMessage).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });

    await page.screenshot({ path: `screenshots/ticket-success-${timestamp}.png`, fullPage: true });
    console.log('Ticket created successfully.');
  });
});
