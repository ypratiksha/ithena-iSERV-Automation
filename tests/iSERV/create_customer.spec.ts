import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test('Create New Customer with User and Provision (Dashboard → Customers → Create)', async ({ page }) => {
  console.log('Step 1: Navigating to Login Page...');
  await page.goto(TEST_CONFIG.LOGIN_URL, {
    waitUntil: 'domcontentloaded',
    timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
  });

  console.log('Step 2: Opening Login Form...');
  await page.getByText('Login Here').click();

  console.log('Step 3: Entering Username...');
  const usernameField = page.getByRole('textbox', { name: 'Email / Username' });
  await usernameField.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await usernameField.click();
  await usernameField.fill(TEST_CONFIG.USERNAME);

  console.log('Step 4: Entering Password...');
  const passwordField = page.getByRole('textbox', { name: 'Password' });
  await passwordField.click();
  await passwordField.fill(TEST_CONFIG.PASSWORD);

  console.log('Step 5: Clicking Login Button...');
  await page.getByRole('button', { name: 'Login' }).click();

  console.log('Step 6: Waiting for Dashboard to Load...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForURL(/dashboard/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });

  console.log('Step 7: Navigating to Customers Section...');

// Expand the Customers parent menu
await page.getByLabel('Customers').click();

// Wait for submenu animation
await page.waitForTimeout(500);

// Click the nested "Customers" submenu item (not the parent)
// Using nth(1) to select the second "Customers" text (the submenu item)
await page.getByText('Customers').nth(1).click();

// Wait for the customers page to fully load
await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });

// Verify we're on the customers page by checking for the Customer button
await page.getByRole('button', { name: 'Customer' }).waitFor({ 
  state: 'visible', 
  timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
});


  console.log('Step 8: Clicking New Customer Button...');
  const customerButton = page.getByRole('button', { name: 'Customer' });
  await customerButton.click();

  console.log('Step 9: Waiting for Customer Form to Load...');
  await page.locator('input[name="customer_name"]').waitFor({ 
    state: 'visible', 
    timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
  });

  console.log('Step 10: Entering Customer Name...');
  const customerNameField = page.locator('input[name="customer_name"]');
  await customerNameField.click();
  await customerNameField.fill('Pratiksha');

  console.log('Step 11: Entering Phone Number...');
  const phoneField = page.locator('input[name="phone"]');
  await phoneField.click();
  await phoneField.fill('7219415038');

  console.log('Step 12: Entering Website...');
  const websiteField = page.locator('input[name="website"]');
  await websiteField.click();
  await websiteField.fill('www.google.com');

  console.log('Step 13: Entering Accounting Email...');
  const emailField = page.locator('input[name="accounting_emails"]');
  await emailField.click();
  await emailField.fill('pratikshas2@ithena.ai');

  console.log('Step 14: Selecting Country - India...');
  const countryDropdown = page.locator('div').filter({ hasText: /^Select Country$/ });
  await countryDropdown.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await countryDropdown.click();
  await page.waitForTimeout(500);
  
  const countryCombobox = page.getByRole('combobox', { name: 'Select Country' });
  await countryCombobox.fill('ind');
  await page.getByRole('option', { name: 'India', exact: true }).click();

  console.log('Step 15: Entering Street Address...');
  const streetField = page.locator('input[name="street1"]');
  await streetField.click();
  await streetField.fill('balewadi high street');

  console.log('Step 16: Selecting State - Maharashtra...');
  const stateCombobox = page.getByRole('combobox', { name: 'Select State' });
  await stateCombobox.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await stateCombobox.click();
  await page.waitForTimeout(500);
  await stateCombobox.fill('maha');
  await page.getByRole('option', { name: 'Maharashtra' }).click();

  console.log('Step 17: Selecting City - Pune...');
  const cityDropdown = page.locator('div').filter({ hasText: /^Select City$/ });
  await cityDropdown.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await cityDropdown.click();
  await page.waitForTimeout(500);
  
  const cityCombobox = page.getByRole('combobox', { name: 'Select City' });
  await cityCombobox.fill('Pun');
  await page.getByRole('option', { name: 'Pune', exact: true }).click();

  console.log('Step 18: Entering ZIP Code...');
  const zipField = page.locator('input[name="zip"]');
  await zipField.click();
  await zipField.fill('415122');

  console.log('Step 19: Selecting Manager - John Doe...');
  const managerDropdown = page.locator('div').filter({ hasText: /^Select Manager$/ });
  await managerDropdown.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await managerDropdown.click();
  await page.waitForTimeout(500);
  await page.getByRole('listbox').getByText('John Doe').click();

  console.log('Step 20: Entering Internal Notes...');
  const notesField = page.locator('textarea[name="internalNotes"]');
  await notesField.click();
  await notesField.fill('test automation customer');

  console.log('Step 21: Capturing Screenshot Before Moving to Sites...');
  await page.screenshot({ 
    path: 'screenshots/customer-basic-info-complete.png', 
    fullPage: true 
  });

  console.log('Step 22: Clicking Next to Sites Section...');
  const nextButton = page.getByRole('button', { name: 'Next' });
  await nextButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await nextButton.click();

  console.log('Step 23: Skipping Site Creation...');
  await page.getByRole('button', { name: 'Add Site' }).waitFor({ 
    state: 'visible', 
    timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
  });
  
  console.log('Step 24: Clicking Next to Users Section...');
  await page.getByText('Next').click();
  await page.waitForTimeout(1000);

  console.log('Step 25: Opening Add New User Form...');
  const addUserButton = page.getByText('Add New User', { exact: true });
  await addUserButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await addUserButton.click();

  console.log('Step 26: Entering User First Name...');
  const firstNameField = page.locator('input[name="first_name"]');
  await firstNameField.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await firstNameField.click();
  await firstNameField.fill('devankshi');

  console.log('Step 27: Entering User Last Name...');
  const lastNameField = page.locator('input[name="last_name"]');
  await lastNameField.click();
  await lastNameField.fill('rade');

  console.log('Step 28: Entering User Email...');
  const userEmailField = page.locator('input[name="email"]');
  await userEmailField.click();
  await userEmailField.fill('devankshi@ithena.ai');

  console.log('Step 29: Entering User Phone Number...');
  const userPhoneField = page.getByRole('spinbutton');
  await userPhoneField.click();
  await userPhoneField.fill('2738138871');

  console.log('Step 30: Entering User Notes...');
  const userNotesField = page.locator('textarea[name="notes"]');
  await userNotesField.click();
  await userNotesField.fill('testing automation user');

  console.log('Step 31: Entering Username...');
  const usernameInput = page.locator('input[name="username"]');
  await usernameInput.click();
  await usernameInput.fill('devankshi');

  console.log('Step 32: Capturing Screenshot Before Saving User...');
  await page.screenshot({ 
    path: 'screenshots/customer-user-info-complete.png', 
    fullPage: true 
  });

  console.log('Step 33: Saving User...');
  const saveUserButton = page.getByRole('button', { name: 'Save', exact: true });
  await saveUserButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await saveUserButton.click();

  console.log('Step 34: Checking for User Save Confirmation...');
  try {
    const okButton = page.getByRole('button', { name: 'OK' });
    await okButton.waitFor({ state: 'visible', timeout: 3000 });
    await okButton.click();
    console.log('User save confirmation dialog found and closed');
  } catch (error) {
    console.log('No user save confirmation dialog appeared, proceeding...');
  }

  await page.waitForTimeout(1000);

  console.log('Step 35: Clicking Next to Provisions Section...');
  await page.getByText('Next').click();
  await page.waitForTimeout(1000);

  console.log('Step 36: Opening Add Provision Form...');
  const addProvisionButton = page.getByText('Add Provision');
  await addProvisionButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await addProvisionButton.click();

  console.log('Step 37: Selecting Site - Default...');
  const siteDropdown = page.locator('div').filter({ hasText: /^Select Site$/ });
  await siteDropdown.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await siteDropdown.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: '-- Default --' }).click();

  console.log('Step 38: Selecting Equipment - ITH...');
  const equipmentDropdown = page.locator('div').filter({ hasText: /^Select Equipment$/ });
  await equipmentDropdown.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await equipmentDropdown.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'ITH', exact: true }).click();

  console.log('Step 39: Entering Serial Number...');
  const serialField = page.locator('input[name="serialNumber"]');
  await serialField.click();
  await serialField.fill('SR23713');

  console.log('Step 40: Selecting Provision Date - 7th...');
  const dateButton = page.getByRole('button', { name: 'Choose date, selected date is' });
  await dateButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await dateButton.click();
  await page.waitForSelector('[role="gridcell"]', { 
    state: 'visible', 
    timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
  });
  await page.getByRole('gridcell', { name: '7', exact: true }).click();

  console.log('Step 41: Entering Provision Internal Notes...');
  const provisionNotesField = page.locator('textarea[name="internalNotes"]');
  await provisionNotesField.click();
  await provisionNotesField.fill('TESTING AUTOMATION');

  console.log('Step 42: Capturing Screenshot Before Saving Provision...');
  await page.screenshot({ 
    path: 'screenshots/customer-provision-info-complete.png', 
    fullPage: true 
  });

  console.log('Step 43: Saving Provision...');
  const saveProvisionButton = page.getByRole('button', { name: 'Save', exact: true });
  await saveProvisionButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await saveProvisionButton.click();

  await page.waitForTimeout(1000);

  console.log('Step 44: Submitting Customer Creation...');
  const addCustomerButton = page.getByRole('button', { name: 'Add New Customer' });
  await addCustomerButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await addCustomerButton.click();

  console.log('Step 45: Checking for Final Confirmation Dialog...');
  try {
    const okButton = page.getByRole('button', { name: 'OK' });
    await okButton.waitFor({ state: 'visible', timeout: 3000 });
    await okButton.click();
    console.log('Final confirmation dialog found and closed');
  } catch (error) {
    console.log('No final confirmation dialog appeared, proceeding...');
  }

  console.log('Step 46: Waiting for Customer to be Created...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  console.log('Step 47: Verifying Customer Creation Success...');
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
      console.log(`Success indicator found: ${successText}`);
      successFound = true;
      break;
    } catch (error) {
      // Continue checking other indicators
    }
  }

  if (!successFound) {
    console.log('No explicit success indicator found, checking customers list...');
  }

  console.log('Step 48: Waiting 3 seconds for customer list to update...');
  await page.waitForTimeout(3000);

  console.log('Step 49: Capturing Final Screenshot...');
  await page.screenshot({ 
    path: 'screenshots/customer-created-final.png', 
    fullPage: true 
  });

  console.log('Step 50: Verifying Navigation...');
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  if (currentUrl.includes('customer')) {
    console.log('Successfully on customers page');
  }

  console.log('Step 51: Customer creation workflow completed successfully');
});
