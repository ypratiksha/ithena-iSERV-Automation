import { test, expect, Page } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Login Scenarios', () => {
  test('Run all login scenarios sequentially with valid credentials last', async ({ page }) => {
    // Step 1: Open login page
    await page.goto(TEST_CONFIG.LOGIN_URL, {
      waitUntil: 'domcontentloaded',
      timeout: TEST_CONFIG.TIMEOUT.LONG,
    });

    // Step 2: Click "Login Here"
    const loginHere = page.getByText('Login Here');
    await expect(loginHere).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await loginHere.click();

    // Step 3: Define common locators
    const usernameField = page.getByRole('textbox', { name: 'Email / Username' });
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });

    await expect(usernameField).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await expect(passwordField).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });

    // Helper function for each login attempt
    const tryLogin = async (
      username: string,
      password: string,
      description: string,
      isLast = false
    ) => {
      console.log(`\nScenario: ${description}`);

      await usernameField.fill(username);
      await passwordField.fill(password);
      await loginButton.click();

      // Wait for response
      await page.waitForTimeout(2000);

      const currentURL = page.url();
      const bodyText = await page.locator('body').innerText();

      // Success condition
      if (/dashboard|home|portal/i.test(currentURL) || /Welcome|Dashboard/i.test(bodyText)) {
        console.log(`SUCCESS: Logged in with ${description}`);
        await page.screenshot({ 
          path: `screenshots/success-${description.replace(/[^a-zA-Z0-9]/g, '-')}.png`, 
          fullPage: true 
        });

        if (!isLast) {
          // Logout to reset
          const logoutBtn = page.getByText(/logout/i).first();
          const isLogoutVisible = await logoutBtn.isVisible().catch(() => false);
          
          if (isLogoutVisible) {
            await logoutBtn.click();
            await page.waitForTimeout(1000);
          }
          
          await page.goto(TEST_CONFIG.LOGIN_URL, { waitUntil: 'domcontentloaded' });
          await page.getByText('Login Here').click();
          await page.waitForTimeout(1000);
        } else {
          // Verify dashboard for valid login
          await expect(page).toHaveURL(/dashboard|home|portal/i, { timeout: TEST_CONFIG.TIMEOUT.LONG });
          await expect(page.locator('body')).toContainText(/Welcome|Dashboard|Tickets|Service/i);
          console.log('Dashboard verified successfully after valid login');
        }
      } else {
        // Handle failed login
        console.log(`FAILED: ${description}`);
        await page.screenshot({ 
          path: `screenshots/fail-${description.replace(/[^a-zA-Z0-9]/g, '-')}.png`, 
          fullPage: true 
        });

        // Reset form
        const isUsernameVisible = await usernameField.isVisible().catch(() => false);
        
        if (isUsernameVisible) {
          await usernameField.clear();
          await passwordField.clear();
        } else {
          await page.goto(TEST_CONFIG.LOGIN_URL, { waitUntil: 'domcontentloaded' });
          await page.getByText('Login Here').click();
          await page.waitForTimeout(1000);
        }
      }
    };

    // Step 4: Invalid and edge cases
    await tryLogin('johndoe', 'wrongpass', 'Invalid password');
    await tryLogin('wronguser', '123456', 'Invalid username');
    await tryLogin('', '', 'Both fields empty');
    await tryLogin('johndoe', '', 'Only username entered');
    await tryLogin('', '123456', 'Only password entered');
    await tryLogin('john@#$%', '123456', 'Username with special characters');
    await tryLogin('johndoe', '!@#$%^&*', 'Password with special characters');

    // Step 5: Valid login last
    await tryLogin(TEST_CONFIG.USERNAME, TEST_CONFIG.PASSWORD, 'Valid credentials', true);

    console.log('\nAll login scenarios executed with valid credentials last');
  });
});
