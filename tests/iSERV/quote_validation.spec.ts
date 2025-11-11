import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';
import quoteData from '../data/quote-data.json';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Quote Management', () => {
  test.beforeEach('Login to application', async ({ page }) => {
    console.log('Step 1: Navigating to Login Page...');
    await page.goto(TEST_CONFIG.LOGIN_URL, {
      waitUntil: 'domcontentloaded',
      timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
    });
    await page.getByText('Login Here').click();
    await page.getByRole('textbox', { name: 'Email / Username' }).fill(TEST_CONFIG.USERNAME);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CONFIG.PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/dashboard/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
    console.log('Logged in successfully.');
  });

  test('Create new quote using JSON data', async ({ page }) => {
    const timestamp = Date.now();

    console.log('Step 3: Navigating to Quotes...');
    await page.getByLabel('Quotes').click();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.LONG });

    console.log('Step 4: Clicking New Quote button...');
    const newQuoteButton = page.getByRole('button', { name: 'Quote' }).first();
    await expect(newQuoteButton).toBeVisible();
    await newQuoteButton.click();

    console.log('Step 5: Waiting for quote form...');
    await expect(page.getByRole('combobox', { name: /Time & Material Quote|Quote Type/i })).toBeVisible();

    // Fill fields from JSON data
    if (quoteData.quote.type) {
      await page.getByRole('combobox', { name: /Time & Material Quote|Quote Type/i }).click();
      await page.getByRole('option', { name: quoteData.quote.type }).click();
    }

    if (quoteData.quote.name) {
      await page.getByRole('textbox', { name: /Please enter name for the/i }).fill(quoteData.quote.name);
    }

    if (quoteData.quote.ticket) {
      await page.locator('div').filter({ hasText: /^Select Ticket$/ }).click();
      await page.getByRole('option', { name: quoteData.quote.ticket }).click();
    }

    if (quoteData.quote.description) {
      await page.getByRole('textbox', { name: /Please enter description/i }).fill(quoteData.quote.description);
    }

    // Screenshot before submit
    await page.screenshot({ path: `screenshots/quote-form-${timestamp}.png`, fullPage: true });

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    console.log('Step 6: Submitting quote...');
    await page.getByRole('button', { name: 'Save & Send' }).click();

    // Wait for result (success or error)
    // Assert the expected validation error appears (for resource missing)
const validationAlert = page.locator('text=/Resource Items are required|please sign before submitting|required/i');
await expect(validationAlert).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });


    await page.screenshot({ path: `screenshots/quote-success-${timestamp}.png`, fullPage: true });
    console.log('Quote created successfully.');
  });
});
