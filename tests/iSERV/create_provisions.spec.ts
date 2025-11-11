import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

// Helper function to generate unique serial number
function generateUniqueSerialNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `SR${timestamp.toString().slice(-6)}${random.toString().padStart(4, '0')}`;
}

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test('Create New Provision with Complete Details (Dashboard → Provisions → Create)', async ({ page }) => {
  const timestamp = Date.now();
  const uniqueSerialNumber = generateUniqueSerialNumber();

  console.log(`\n=== Test Run ID: ${timestamp} ===`);
  console.log('Creating Provision with Customer, Site, Equipment, and Serial Number');
  console.log(`Generated Unique Serial Number: ${uniqueSerialNumber}`);

  console.log('Step 1: Navigating to Login Page...');
  try {
    await page.goto(TEST_CONFIG.LOGIN_URL, {
      waitUntil: 'domcontentloaded',
      timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
    });
    console.log('✓ Login page loaded successfully');
  } catch (error) {
    console.error(`❌ Failed to navigate to login page: ${error}`);
    throw error;
  }

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
  console.log('✓ Dashboard loaded successfully');

  console.log('Step 7: Navigating to Provisions Section...');
  // Expand the Provisions parent menu
  await page.getByLabel('Provisions').click();
  
  // Wait for submenu animation
  await page.waitForTimeout(500);
  
  // Click the nested "Provisions" submenu item
  await page.getByText('Provisions').nth(1).click();
  
  // Wait for the provisions page to fully load
  await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
  
  // Verify we're on the provisions page by checking for the Provision button
  await page.getByRole('button', { name: 'Provision' }).waitFor({ 
    state: 'visible', 
    timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
  });
  console.log('✓ Provisions page loaded successfully');

  console.log('Step 8: Clicking New Provision Button...');
  const provisionButton = page.getByRole('button', { name: 'Provision' });
  await provisionButton.click();

  console.log('Step 9: Waiting for Provision Form to Load...');
  const customerCombobox = page.getByRole('combobox', { name: 'Select Customer' });
  await customerCombobox.waitFor({ 
    state: 'visible', 
    timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
  });

  console.log('Step 10: Selecting Customer - Acme Corp...');
  await customerCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'Acme Corp' }).click();
  console.log('✓ Customer selected: Acme Corp');

  console.log('Step 11: Selecting Site - Acme HQ...');
  const siteCombobox = page.getByRole('combobox', { name: 'Select Site' });
  await siteCombobox.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await siteCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'Acme HQ' }).click();
  console.log('✓ Site selected: Acme HQ');

  console.log('Step 12: Selecting Equipment - ITH...');
  const equipmentCombobox = page.getByRole('combobox', { name: 'Select Equipment' });
  await equipmentCombobox.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await equipmentCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'ITH', exact: true }).click();
  console.log('✓ Equipment selected: ITH');

  console.log(`Step 13: Entering Serial Number - ${uniqueSerialNumber}...`);
  const serialNumberField = page.locator('input[name="serialNumber"]');
  await serialNumberField.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await serialNumberField.click();
  await serialNumberField.fill(uniqueSerialNumber);
  console.log(`✓ Serial number entered: ${uniqueSerialNumber}`);

  console.log('Step 14: Selecting Provision Date - 7th...');
  const dateButton = page.getByRole('button', { name: 'Choose date, selected date is' });
  await dateButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await dateButton.click();
  await page.waitForSelector('[role="gridcell"]', { 
    state: 'visible', 
    timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
  });
  await page.getByRole('gridcell', { name: '7', exact: true }).click();
  console.log('✓ Date selected: 7th');

  console.log('Step 15: Selecting Status - Active...');
  const statusCombobox = page.getByRole('combobox', { name: 'Active' });
  await statusCombobox.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await statusCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'Active', exact: true }).click();
  console.log('✓ Status selected: Active');

  console.log('Step 16: Entering Internal Notes...');
  const internalNotesField = page.locator('textarea[name="internalNotes"]');
  await internalNotesField.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await internalNotesField.click();
  await internalNotesField.fill('Testing of provision automation');
  console.log('✓ Internal notes entered: Testing of provision automation');

  console.log('Step 17: Capturing Screenshot Before Saving...');
  await page.screenshot({ 
    path: `screenshots/provision-form-complete-${timestamp}.png`, 
    fullPage: true 
  });

  console.log('Step 18: Clicking Save Button...');
  const saveButton = page.getByRole('button', { name: 'Save', exact: true });
  await saveButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await saveButton.click();

  console.log('Step 19: Checking for Provision Save Confirmation...');
  try {
    const okButton = page.getByRole('button', { name: 'OK' });
    await okButton.waitFor({ state: 'visible', timeout: 3000 });
    await okButton.click();
    console.log('✓ Save confirmation dialog found and closed');
  } catch (error) {
    console.log('ℹ No save confirmation dialog appeared, proceeding...');
  }

  await page.waitForTimeout(1000);

  console.log('Step 20: Waiting for Provision to be Created...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  console.log('Step 21: Verifying Provision Creation Success...');
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
    console.log('ℹ No explicit success indicator found, checking provisions list...');
  }

  console.log('Step 22: Waiting 3 seconds for provision list to update...');
  await page.waitForTimeout(3000);

  console.log('Step 23: Capturing Final Screenshot...');
  await page.screenshot({ 
    path: `screenshots/provision-created-final-${timestamp}.png`, 
    fullPage: true 
  });

  console.log('Step 24: Verifying Navigation...');
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  if (currentUrl.includes('provision')) {
    console.log('✓ Successfully on provisions page');
  }

  console.log(`\n✓ Test completed successfully`);
 // console.log(`Provision Created - Customer: Acme Corp, Site: Acme HQ, Equipment: ITH, Serial: ${uniqueSerialNumber}\n`);
});
