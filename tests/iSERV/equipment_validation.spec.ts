import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';
import equipmentData from '../data/equipment-data.json';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Equipment Management', () => {
  test.beforeEach('Login to application', async ({ page }) => {
    await page.goto(TEST_CONFIG.LOGIN_URL, {
      waitUntil: 'domcontentloaded',
      timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
    });
    await page.getByText('Login Here').click();
    await page.getByRole('textbox', { name: 'Email / Username' }).fill(TEST_CONFIG.USERNAME);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CONFIG.PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/dashboard/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
  });

  test('Create new equipment using JSON data', async ({ page }) => {
    const timestamp = Date.now();

    await page.getByLabel('Equipment').click();
    await page.getByRole('button', { name: 'Equipment' }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Fill equipment name from JSON
    await page.locator('input[name="equipmentName"]').fill(equipmentData.equipment.equipmentName);

    await page.getByRole('combobox', { name: 'Select Equipment Type' }).click();
    await page.getByRole('option', { name: equipmentData.equipment.equipmentType }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByRole('button', { name: 'Document', exact: true }).click();
    await page.getByRole('button', { name: 'Upload', exact: true }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByRole('button', { name: 'New Provision' }).click();
    await page.getByRole('combobox', { name: 'Select Customer' }).click();
    await page.getByRole('option', { name: equipmentData.equipment.customer }).click();
    await page.getByRole('combobox', { name: 'Select Site' }).click();
    await page.getByRole('option', { name: equipmentData.equipment.site }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await page.locator('input[name="serialNumber"]').fill(equipmentData.equipment.serialNumber);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await page.getByRole('button', { name: 'Add New Equipment' }).click();
   // await page.getByRole('button', { name: 'OK' }).click();

    // // Validate that equipment appears in the list or confirmation is present
     //await expect(page.getByText(equipmentData.equipment.equipmentName)).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });
  });
});
