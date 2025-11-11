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

  test('Navigate through Emergency Electrical Repair ticket sections', async ({ page }) => {
    // Navigate to Tickets
    console.log('Step 3: Navigating to Tickets...');
    await page.getByLabel('Tickets').click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Click on Emergency Electrical Repair ticket
    console.log('Step 4: Clicking on Emergency Electrical Repair ticket...');
    const ticketElement = page.getByText('Emergency Electrical Repair').first();
    await expect(ticketElement).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });
    await ticketElement.click();

    // Wait for ticket details to load
    console.log('Step 5: Waiting for ticket details...');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify ticket details loaded
    console.log('Step 6: Verifying ticket details loaded...');
    await expect(page.locator('body')).toContainText(/Emergency Electrical Repair|Ticket/i, {
      timeout: TEST_CONFIG.TIMEOUT.LONG
    });

    // Navigate to Quotes section
    console.log('Step 7: Navigating to Quotes section...');
    const quotesTab = page.getByText('Quotes').filter({ hasText: /^Quotes/ });
    await expect(quotesTab).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await quotesTab.click();
    await page.waitForTimeout(1000);


    // Navigate to Threads section
    console.log('Step 9: Navigating to Threads section...');
    const threadsTab = page.getByLabel('Threads').getByText('Threads');
    await expect(threadsTab).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await threadsTab.click();
    await page.waitForTimeout(1000);

    // Verify final state
    console.log('Step 10: Verifying all sections navigated...');
    await expect(page.locator('body')).toContainText(/Threads|Messages/i, {
      timeout: TEST_CONFIG.TIMEOUT.MEDIUM
    });

    // Capture screenshot
    await page.screenshot({
      path: 'screenshots/ticket-sections-navigation.png',
      fullPage: true
    });
    console.log('Screenshot captured successfully');

    console.log('Ticket section navigation completed successfully');
  });
});
