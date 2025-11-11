import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test('View analytics report with filters - single test', async ({ page }) => {
  const timestamp = Date.now();
  
  console.log(`\n=== Test Run ID: ${timestamp} ===`);
  
  // Login
  console.log('Step 1: Logging in...');
  await page.goto(TEST_CONFIG.LOGIN_URL, {
    waitUntil: 'domcontentloaded',
    timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
  });
  
  await page.getByText('Login Here').click();
  await page.getByRole('textbox', { name: 'Email / Username' }).fill(TEST_CONFIG.USERNAME);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CONFIG.PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  
  await page.waitForURL(/dashboard/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
  console.log('✓ Logged in successfully');

  // Navigate to Reports
  console.log('Step 2: Navigating to Analytics → Reports...');
  await page.getByLabel('Analytics').getByText('Analytics').click();
  await page.getByLabel('Reports', { exact: true }).getByText('Reports').click();
  await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });

  // Clear filters (only if button is visible)
  console.log('Step 3: Checking for filters to clear...');
  const clearButton = page.getByRole('button', { name: 'Clear' });
  
  // Check if Clear button exists with a short timeout
  const isClearButtonVisible = await clearButton.isVisible().catch(() => false);
  
  if (isClearButtonVisible) {
    await clearButton.click();
    console.log('✓ Filters cleared');
  } else {
    console.log('ℹ No filters to clear (already in default state)');
  }

  // Apply filters
  console.log('Step 4: Applying filters...');
  await page.getByRole('combobox', { name: 'Customers' }).click();
  await page.getByRole('option', { name: 'Acme Corp' }).click();

  await page.getByRole('combobox', { name: 'Departments' }).click();
  await page.getByRole('option', { name: 'Technical Support' }).click();

  await page.getByRole('combobox', { name: 'Service Engineers' }).click();
  await page.getByRole('option', { name: 'All' }).click();

  await page.getByRole('button', { name: 'M', exact: true }).click();

  // Wait for chart to render
  console.log('Step 5: Waiting for chart to render...');
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });
  console.log('✓ Chart rendered successfully');

  // Verify sections
  console.log('Step 6: Verifying ticket sections...');
  await expect(page.getByLabel('All non-archived tickets', { exact: true })).toBeVisible();
  await expect(page.getByText('Total Tickets')).toBeVisible();
  await expect(page.getByText('Open Tickets')).toBeVisible();
  await expect(page.getByText('Overdue Tickets')).toBeVisible();
  
  console.log('✓ All ticket sections verified');

  // Capture screenshot
  await page.screenshot({ 
    path: `screenshots/analytics-report-${timestamp}.png`, 
    fullPage: true 
  });

  console.log('✓ Test completed successfully');
});
