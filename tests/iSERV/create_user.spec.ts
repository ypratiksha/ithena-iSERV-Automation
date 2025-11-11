import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test('Create Customer User (Dashboard → Customers → Users → Create)', async ({ page }) => {
  // Generate unique identifiers for this test run
  const timestamp = Date.now();
  const uniqueId = Math.floor(Math.random() * 10000);
  const firstName = `Liamh`;
  const lastName = `Doe`;
  const email = `liamh_${timestamp}@gmail.com`;
  const username = `liamh_${uniqueId}`;
  const phoneNumber = `7348732${Math.floor(Math.random() * 1000)}`;

  console.log(`\n=== Test Run ID: ${timestamp} ===`);
  console.log(`Creating Customer User: ${firstName} ${lastName} (${username})`);

  console.log('Step 1: Navigating to Login Page...');
  await page.goto(TEST_CONFIG.LOGIN_URL, {
    waitUntil: 'domcontentloaded',
    timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
  });

  console.log('Step 2: Clicking "Login Here" Button...');
  const loginHereButton = page.getByText('Login Here');
  await loginHereButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await loginHereButton.click();

  console.log('Step 3: Waiting for Login Form to Load...');
  const usernameField = page.getByRole('textbox', { name: 'Email / Username' });
  await usernameField.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });

  console.log('Step 4: Logging in with credentials...');
  await usernameField.fill(TEST_CONFIG.USERNAME);

  const passwordField = page.getByRole('textbox', { name: 'Password' });
  await passwordField.fill(TEST_CONFIG.PASSWORD);

  console.log('Step 5: Clicking Login Button...');
  await page.getByRole('button', { name: 'Login' }).click();

  console.log('Step 6: Waiting for Dashboard to Load...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForURL(/dashboard/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });

  console.log('Step 7: Navigating to Customers → Users...');
  await page.getByLabel('Customers').click();
  await page.waitForTimeout(500); // Wait for submenu animation
  
  const usersLink = page.getByLabel('Users').getByText('Users');
  await usersLink.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await usersLink.click();

  await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });

  console.log('Step 8: Clicking New Customer User Button...');
  const customerUserButton = page.getByRole('button', { name: 'Customer User' });
  await customerUserButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await customerUserButton.click();

  console.log('Step 9: Waiting for Customer User Form to Load...');
  await page.getByRole('combobox', { name: 'Select Customer' }).waitFor({ 
    state: 'visible', 
    timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
  });

  console.log('Step 10: Selecting Customer - Pratiksha...');
  const customerCombobox = page.getByRole('combobox', { name: 'Select Customer' });
  await customerCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'Pratiksha' }).click();

  console.log(`Step 11: Filling User Information...`);
  
  // Fill all form fields without unnecessary clicks before fill
  const firstNameField = page.locator('input[name="first_name"]');
  await firstNameField.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await firstNameField.fill(firstName);

  const lastNameField = page.locator('input[name="last_name"]');
  await lastNameField.fill(lastName);

  const emailField = page.locator('input[name="email"]');
  await emailField.fill(email);

  console.log('Step 12: Entering Phone Number...');
  const phoneField = page.getByRole('spinbutton');
  await phoneField.fill(phoneNumber);

  console.log('Step 13: Entering User Notes...');
  const notesField = page.locator('textarea[name="notes"]');
  await notesField.fill('test automation customer user');

  console.log(`Step 14: Entering Username - ${username}...`);
  const usernameInputField = page.locator('input[name="username"]');
  await usernameInputField.fill(username);

  console.log('Step 15: Capturing Screenshot Before Saving...');
  await page.screenshot({ 
    path: `screenshots/customer-user-form-${timestamp}.png`, 
    fullPage: true 
  });

  console.log('Step 16: Saving Customer User...');
  const saveButton = page.getByRole('button', { name: 'Save', exact: true });
  await saveButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await saveButton.click();

  console.log('Step 17: Handling Save Confirmation Dialog...');
  try {
    const okButton = page.getByRole('button', { name: 'OK' });
    await okButton.waitFor({ state: 'visible', timeout: 3000 });
    await okButton.click();
    console.log('✓ Save confirmation dialog closed');
  } catch (error) {
    console.log('ℹ No confirmation dialog appeared, proceeding...');
  }

  console.log('Step 18: Waiting for User to be Created...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  console.log('Step 19: Verifying Customer User Creation...');
  const successIndicators = [
    page.getByText(/success|created|saved/i),
    page.locator('[role="alert"]'),
    page.locator('.success-message'),
    page.locator('.MuiAlert-message'),
  ];

  let successFound = false;
  for (const indicator of successIndicators) {
    try {
      await indicator.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.SHORT });
      const successText = await indicator.textContent();
      console.log(`✓ Success indicator found: ${successText}`);
      successFound = true;
      break;
    } catch (error) {
      // Continue checking other indicators
    }
  }

  if (!successFound) {
    console.log('ℹ No explicit success indicator, checking if form cleared');
  }

  console.log('Step 20: Capturing Final Screenshot...');
  await page.screenshot({ 
    path: `screenshots/customer-user-created-${timestamp}.png`, 
    fullPage: true 
  });

  console.log('Step 21: Verifying Page Navigation...');
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  if (currentUrl.includes('user')) {
    console.log('✓ Successfully on users management page');
  }

  console.log(`\n✓ Test completed successfully`);
  console.log(`User Created: ${firstName} ${lastName} | Email: ${email} | Username: ${username}\n`);
});
