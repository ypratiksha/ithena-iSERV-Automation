import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Schedule Management', () => {
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

  test('View schedule details and associated ticket', async ({ page }) => {
    // Navigate to Schedules
    console.log('Step 3: Navigating to Schedules...');
    await page.getByLabel('Schedules').click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Wait for schedules list to load
    console.log('Step 4: Waiting for schedules list to load...');
    const scheduleRows = page.locator('[role="grid"] [role="rowgroup"] [role="row"]');
    await scheduleRows.first().waitFor({ state: 'visible', timeout: 15000 });

    // Click on specific schedule
    console.log('Step 5: Clicking on schedule "schedule test for automation"...');
    const scheduleElement = page.getByText('schedule test for automation').first();
    await expect(scheduleElement).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });
    await scheduleElement.click();

    // Wait for schedule details page
    console.log('Step 6: Waiting for schedule details page...');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify schedule details loaded
    console.log('Step 7: Verifying schedule details...');
    await expect(page.locator('body')).toContainText(/schedule|frequency|service|equipment/i, {
      timeout: TEST_CONFIG.TIMEOUT.LONG
    });

    // Click on View Ticket Details
    console.log('Step 8: Clicking on View Ticket Details...');
    const viewTicketButton = page.getByLabel('View Ticket Details');
    await expect(viewTicketButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await viewTicketButton.click();

    // Wait for ticket details page
    console.log('Step 9: Waiting for ticket details page...');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify ticket details loaded
    console.log('Step 10: Verifying ticket details...');
    await expect(page.locator('body')).toContainText(/ticket|details|customer|priority|status/i, {
      timeout: TEST_CONFIG.TIMEOUT.LONG
    });

    // Capture screenshot
    await page.screenshot({
      path: 'screenshots/schedule-ticket-details.png',
      fullPage: true
    });
    console.log('Screenshot captured successfully');

    console.log('Schedule and ticket details verification completed successfully');
  });
});
