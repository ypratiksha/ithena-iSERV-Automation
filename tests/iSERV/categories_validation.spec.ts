import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';
import categoryData from '../data/category-data.json';

test('Validate and create new Knowledgebase category', async ({ page }) => {
  await page.goto(TEST_CONFIG.LOGIN_URL, {
    waitUntil: 'domcontentloaded',
    timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
  });
  await page.getByText('Login Here').click();
  await page.getByRole('textbox', { name: 'Email / Username' }).fill(TEST_CONFIG.USERNAME);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CONFIG.PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByLabel('Knowledgebase').getByText('Knowledgebase').click();
  await expect(page.getByLabel('Categories').getByText('Categories')).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });
  await page.getByLabel('Categories').getByText('Categories').click();

  await page.getByRole('button', { name: 'Document Category' }).click();

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  // Wait for error alert, then try clicking "OK" using less strict selector
  await expect(page.getByText('Please fill all required fields.')).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });
  const okDialogButton = page.locator('div[role="dialog"] button').filter({ hasText: "OK" });
  // If the dialog is a custom modal, this will query all buttons inside the dialog with text OK
  if (await okDialogButton.isVisible({ timeout: TEST_CONFIG.TIMEOUT.SHORT })) {
    await okDialogButton.click();
  }
  // If not visible, try .click({ force: true }) if your UI allows it, or optionally query modal content directly

  // Fill required fields with JSON data
  await page.locator('input[name="title"]').fill(categoryData.category.title);
  await page.locator('.jodit-wysiwyg').fill(categoryData.category.description);

  await page.getByRole('button', { name: 'Save', exact: true }).click();
  // Handle final confirmation, repeat the dialog robust click logic if needed
  const finalOkButton = page.locator('div[role="dialog"] button').filter({ hasText: "OK" });
  if (await finalOkButton.isVisible({ timeout: TEST_CONFIG.TIMEOUT.SHORT })) {
    await finalOkButton.click();
  }
});
