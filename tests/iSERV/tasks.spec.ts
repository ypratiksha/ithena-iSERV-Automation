import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test('Verify task details after login (Dashboard → Tasks → First Task)', async ({ page }) => {
  console.log('Step 1: Navigating to Login Page...');
  await page.goto(TEST_CONFIG.LOGIN_URL, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });

  console.log('Step 2: Opening Login Form...');
  await page.getByText('Login Here').click();

  console.log('Step 3: Entering Credentials...');
  await page.getByRole('textbox', { name: /Email|Username/i }).fill(TEST_CONFIG.USERNAME);
  await page.getByRole('textbox', { name: /Password/i }).fill(TEST_CONFIG.PASSWORD);
  await page.getByRole('button', { name: /Login/i }).click();

  console.log('Step 4: Waiting for Dashboard to Load...');
  await page.waitForLoadState('networkidle');
  await page.waitForURL(/dashboard/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });

  console.log('Step 5: Clicking on "Tasks" in Sidebar...');
  await page.getByLabel('Tasks').getByText('Tasks').click();

  console.log('Step 6: Selecting "All" Filter...');
  const allFilter = page.locator('div').filter({ hasText: /^All2$/ }).first();
  await allFilter.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.LONG });
  await allFilter.click();

  console.log('Step 7: Opening "Test task"...');
  const task = page.getByText('task for acme', { exact: true });
  await task.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.LONG });
  await task.click();

  console.log('Step 8: Waiting for Task Details Page...');
  await expect(page.locator('body')).toContainText(
    /Task Details|Assigned To|Priority|Status|Description/i,
    { timeout: TEST_CONFIG.TIMEOUT.LONG }
  );

  console.log('Step 9: Capturing Screenshot...');
  await page.screenshot({ path: 'screenshots/task-details.png', fullPage: true });

  console.log('Step 10: Waiting 8 seconds for visual confirmation...');
  await page.waitForTimeout(8000);

  console.log('Step 11: Task details page loaded successfully.');
});
