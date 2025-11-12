import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';
import provisionData from '../data/provision-data.json';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Provision Management', () => {
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

  test('Create new provision using JSON data', async ({ page }) => {
    await page.getByLabel('Provisions').getByText('Provisions').click();
    await page.getByRole('button', { name: 'Provision' }).click();

    await page.getByRole('combobox', { name: 'Select Customer' }).click();
    await page.getByRole('option', { name: provisionData.provision.customer }).click();

    await page.getByRole('combobox', { name: 'Select Equipment' }).click();
    await page.getByRole('option', { name: provisionData.provision.equipment }).first().click();

    await page.locator('input[name="serialNumber"]').fill(provisionData.provision.serialNumber);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await page.getByRole('combobox', { name: 'Select Site' }).click();
    await page.getByRole('option', { name: provisionData.provision.site }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Assert for any system confirmation or error popup, then click OK if found
    // const popupMessage = page.locator('text=/success|created|already exists|duplicate/i');
    // await expect(popupMessage).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });
    // await page.getByRole('button', { name: 'OK' }).click();
  });
});
