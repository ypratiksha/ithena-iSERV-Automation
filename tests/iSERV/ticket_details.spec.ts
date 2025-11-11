import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';
import ticketData from '../data/ticket-data.json';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Ticket Management - Verify Created Ticket', () => {

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

    // Wait until dashboard is visible
    await page.waitForURL(/dashboard/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
    console.log('Logged in successfully.');
  });

  test('Verify created ticket is visible in list', async ({ page }) => {
    console.log('Step 3: Navigating to Tickets...');
    await page.getByLabel('Tickets').click();

    // Wait until the search box is visible, indicating the Tickets page is ready
    const searchBox = page.getByPlaceholder('Search tickets');
    await expect(searchBox).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });

    console.log('Step 4: Searching for created ticket...');
    const searchTerm = ticketData.ticket.titlePrefix; // e.g., "Emergency Electrical Repair - Conveyor System"
    await searchBox.fill(searchTerm);

    // Wait for the ticket row to appear (select first matching)
    const ticketRow = page.locator(`a:has-text("${searchTerm}")`).first();
    await expect(ticketRow).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });

    console.log('Step 5: Opening the ticket details...');
    await ticketRow.click();

    // Wait until the ticket detail panel is fully visible
    const ticketDetailTitle = page.locator(`a:has-text("${searchTerm}")`).first();
    await expect(ticketDetailTitle).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });

    console.log('Step 6: Validating ticket details...');
    await expect(ticketDetailTitle).toContainText(searchTerm);

    // Screenshot proof
    await page.screenshot({ path: `screenshots/verify-ticket-${Date.now()}.png`, fullPage: true });

    console.log('Ticket verified successfully.');
  });
});
