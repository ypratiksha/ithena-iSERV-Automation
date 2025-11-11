import { test } from '@playwright/test';

test('Debug login form visibility', async ({ page }) => {
  await page.goto('http://44.213.176.147:3005/login', { waitUntil: 'networkidle' });

  // Click "Login Here"
  await page.getByText(/Login Here|Service Engineer|Manager/i).click();

  // Wait a moment for UI update
  await page.waitForTimeout(2000);

  // Screenshot to see what the page looks like
  await page.screenshot({ path: 'debug-after-login-here.png', fullPage: true });

  // Log all visible input fields
  const inputs = await page.locator('input').evaluateAll((els) =>
    els.map((el) => ({
      placeholder: el.getAttribute('placeholder'),
      formcontrolname: el.getAttribute('formcontrolname'),
      name: el.getAttribute('name'),
      id: el.id,
    }))
  );

  console.log('Detected inputs:', inputs);

  await page.pause(); // opens Playwright Inspector so you can see the live browser
});
