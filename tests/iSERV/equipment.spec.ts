import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Equipment Management', () => {
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

  test('View first equipment details', async ({ page }) => {
    // Navigate to Equipment
    console.log('Step 3: Navigating to Equipment...');
    await page.getByLabel('Equipment').click();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.LONG });

    // Wait for Equipment List
    console.log('Step 4: Waiting for equipment list to load...');
    await expect(page.getByText('List of all the Equipment')).toBeVisible({ 
      timeout: TEST_CONFIG.TIMEOUT.LONG 
    });

    // Wait for Equipment Rows
    console.log('Step 5: Waiting for equipment rows...');
    const equipmentRows = page.locator('[role="grid"] [role="rowgroup"] [role="row"]');
    
    await equipmentRows.first().waitFor({ state: 'visible', timeout: 15000 });
    
    const rowCount = await equipmentRows.count();
    console.log(`Found ${rowCount} equipment item(s)`);

    if (rowCount === 0) {
      console.log('No equipment available');
      test.skip();
      return;
    }

    // Click First Equipment
    console.log('Step 6: Clicking on first equipment...');
    const firstEquipment = equipmentRows.first();
    await firstEquipment.click();

    // Wait for Details
    console.log('Step 7: Waiting for equipment details...');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify Details Loaded
    console.log('Step 8: Verifying equipment details...');
    await expect(page.locator('body')).toContainText(/Equipment|Model|Make|Serial/i);

    // Capture Screenshot
    await page.screenshot({ 
      path: 'screenshots/equipment-details.png', 
      fullPage: true 
    });

    console.log('Equipment details loaded successfully');
  });
});
