import { test, expect } from '@playwright/test';

test('Schedule past time validation', async ({ page }) => {
  await page.goto('https://iservna.ithena.io:3005/login');
  await page.getByText('Login Here').click();
  await page.getByRole('textbox', { name: 'Email / Username' }).fill('johndoe');
  await page.getByRole('textbox', { name: 'Password' }).fill('123456');
  await page.getByRole('button', { name: 'Login' }).click();
  // Wait for dashboard to load and click on Schedules in sidebar nav
  await page.getByLabel('Schedules').getByText('Schedules').click();
  // Open new schedule creation form
  await page.getByRole('button', { name: 'Schedule' }).click();
  // Try to submit with no or default values (which should trigger a past date/time validation)
  await page.getByRole('button', { name: 'Submit' }).click();

  // Now validate the expected error appears (update the text to your app's actual error)
  const errorAlert = page.locator('text=/date.*past|not valid|cannot be earlier|must be after|required/i');
  await expect(errorAlert).toBeVisible({ timeout: 10000 });
});
