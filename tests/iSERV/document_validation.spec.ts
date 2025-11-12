import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';
import documentData from '../data/document-data.json';

test('Knowledgebase Document Upload Duplicate Error', async ({ page }) => {
  await page.goto(TEST_CONFIG.LOGIN_URL, {
    waitUntil: 'domcontentloaded',
    timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
  });
  await page.getByText('Login Here').click();
  await page.getByRole('textbox', { name: 'Email / Username' }).fill(TEST_CONFIG.USERNAME);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CONFIG.PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByLabel('Knowledgebase').getByText('Knowledgebase').click();
  await page.getByLabel('Documents').getByText('Documents').click();
  await expect(page.getByRole('heading', { name: 'Documents', exact: true }))
    .toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });

  const docButton = page.getByRole('button', { name: 'Document' });
  await expect(docButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });
  await expect(docButton).toBeEnabled({ timeout: TEST_CONFIG.TIMEOUT.LONG });
  await docButton.click();

  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  await page.getByRole('combobox', { name: 'Select Category' }).click();
  await page.getByRole('option', { name: documentData.category }).click();
  await page.locator('input[name="title"]').fill(documentData.title);
  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  await page.locator('.jodit-wysiwyg').fill(documentData.description);

  await page.getByRole('combobox', { name: '-- No Attachment --' }).click();
  await page.getByRole('option', { name: documentData.attachmentType }).click();
  await page.getByRole('combobox', { name: documentData.attachmentType }).click();
  await page.getByRole('option', { name: documentData.alternateAttachmentType }).click();
  await page.locator('input[name="attachmentUrl"]').fill(documentData.attachmentUrl);

  // The next upload click triggers error or navigation:
  await page.getByRole('button', { name: 'Upload', exact: true }).click();

  // Only assert error while page is still open/active.
  if (!page.isClosed()) {
    await expect(
      page.getByText('A knowledge base article with title "User doc for 829878" already exists.')
    ).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });
  } else {
    throw new Error('Page was closed or refreshed before error could be validated!');
  }
});
