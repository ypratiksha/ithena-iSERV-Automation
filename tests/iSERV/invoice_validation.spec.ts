import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';
import invoiceData from '../data/invoice-data.json';

test('Invoice Signature Validation and Submission', async ({ page }) => {
  await page.goto(TEST_CONFIG.LOGIN_URL, {
    waitUntil: 'domcontentloaded',
    timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
  });
  await page.getByText('Login Here').click();
  await page.getByRole('textbox', { name: 'Email / Username' }).fill(TEST_CONFIG.USERNAME);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CONFIG.PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByLabel('Invoices').click();
  await page.getByRole('button', { name: 'Invoice' }).click();

  await page.getByRole('combobox', { name: 'Select Ticket' }).click();
  await page.getByRole('option', { name: invoiceData.ticket }).click();

  await page.getByRole('combobox', { name: 'Select Service Reports to Bill' }).click();
  await page.getByRole('option', { name: invoiceData.serviceReport }).click();

  await page.getByRole('textbox', { name: 'Please enter po number for' }).fill(invoiceData.poNumber);
  await page.getByRole('button', { name: 'Next' }).click();

  // Try to Save & Send without signing
  await page.getByRole('button', { name: 'Save & Send' }).click();

  // Validate error message appears
  await expect(
    page.getByText(/please sign before submit|signature required|sign to proceed/i)
  ).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });

  // Dismiss the error dialog if present (SweetAlert2 or similar)
  const errorDismiss = page.locator('div[role="dialog"] button, div.swal2-popup button, div[aria-modal="true"] button').filter({ hasText: /OK|Close|×|Dismiss/i }).first();
  if (await errorDismiss.isVisible({ timeout: 3000 })) {
    await errorDismiss.click();
  }

  // Now interact with the signature canvas
  await page.locator('canvas').click({ position: { x: 103, y: 65 } });

  // Proceed with Save & Send after signing
  await page.getByRole('button', { name: 'Save & Send' }).click();
  await page.getByRole('button', { name: 'Yes, Send' }).click();
});
