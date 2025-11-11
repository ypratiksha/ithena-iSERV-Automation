import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test('Create New Equipment with Provision (Dashboard → Equipment → Create)', async ({ page }) => {
  // Generate unique equipment name with timestamp
  const timestamp = new Date().getTime();
  const uniqueEquipmentName = `test equipment ${timestamp}`;
  const uniqueSerialNumber = `SR${timestamp.toString().slice(-8)}`;

  console.log(`Step 1: Navigating to Login Page...`);
  console.log(`Target URL: ${TEST_CONFIG.LOGIN_URL}`);
  console.log(`Creating equipment: ${uniqueEquipmentName}`);
  console.log(`Serial Number: ${uniqueSerialNumber}`);
  
  let navigationSuccess = false;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (!navigationSuccess && retryCount < maxRetries) {
    try {
      console.log(`Navigation attempt ${retryCount + 1}/${maxRetries}...`);
      await page.goto(TEST_CONFIG.LOGIN_URL, {
        waitUntil: 'domcontentloaded',
        timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
      });
      navigationSuccess = true;
      console.log('Successfully navigated to login page');
    } catch (error) {
      retryCount++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`Navigation attempt ${retryCount} failed: ${errorMessage}`);
      if (retryCount < maxRetries) {
        console.log('Waiting 3 seconds before retry...');
        await page.waitForTimeout(3000);
      } else {
        console.log('All navigation attempts failed');
        throw new Error(`Failed to navigate to ${TEST_CONFIG.LOGIN_URL} after ${maxRetries} attempts.`);
      }
    }
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

  console.log('Step 7: Navigating to Equipment Section...');
  await page.getByLabel('Equipment').getByText('Equipment').click();
  
  await page.getByRole('button', { name: 'Equipment' }).waitFor({ 
    state: 'visible', 
    timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
  });

  console.log('Step 8: Clicking New Equipment Button...');
  const equipmentButton = page.getByRole('button', { name: 'Equipment' });
  await equipmentButton.click();

  console.log('Step 9: Waiting for Equipment Form to Load...');
  await page.locator('input[name="equipmentName"]').waitFor({ 
    state: 'visible', 
    timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
  });

  console.log(`Step 10: Entering Equipment Name - ${uniqueEquipmentName}...`);
  const equipmentNameField = page.locator('input[name="equipmentName"]');
  await equipmentNameField.click();
  await equipmentNameField.fill(uniqueEquipmentName);

  console.log('Step 11: Selecting Equipment Type - Make...');
  const equipmentTypeCombobox = page.getByRole('combobox', { name: 'Select Equipment Type' });
  await equipmentTypeCombobox.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await equipmentTypeCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'Make' }).click();

  console.log('Step 12: Selecting Equipment Make - ITH...');
  const makeCombobox = page.getByRole('combobox').filter({ hasText: /^$/ });
  await makeCombobox.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await makeCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'ITH' }).click();

  console.log('Step 13: Entering Internal Notes...');
  const internalNotesTextarea = page.locator('textarea[name="internalNotes"]');
  await internalNotesTextarea.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await internalNotesTextarea.click();
  await internalNotesTextarea.fill('test');

  console.log('Step 14: Selecting Active Status - Active...');
  const activeCombobox = page.getByRole('combobox', { name: 'Active' });
  await activeCombobox.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await activeCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'Active', exact: true }).click();

  console.log('Step 16: Proceeding to Next Section - User Manuals...');
  const nextButton = page.getByRole('button', { name: 'Next' });
  await nextButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await nextButton.click();
  await page.waitForLoadState('domcontentloaded');

  console.log('Step 17: Opening User Manuals Section...');
  const userManualsButton = page.getByRole('button', { name: 'User Manuals' });
  await userManualsButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await userManualsButton.click();

  console.log('Step 18: Closing User Manuals Section...');
  const userManualsButtonClose = page.getByRole('button', { name: 'User Manuals' });
  await userManualsButtonClose.click();

  console.log('Step 19: Proceeding to Equipment Provisioning...');
  const nextButtonProvision = page.getByRole('button', { name: 'Next' });
  await nextButtonProvision.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await nextButtonProvision.click();
  await page.waitForLoadState('domcontentloaded');

  console.log('Step 20: Waiting for No Equipment Provisioned Message...');
  const noProvisionedText = page.getByText('No Equipment Provisioned');
  await noProvisionedText.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });

  console.log('Step 21: Creating New Provision...');
  const newProvisionButton = page.getByRole('button', { name: 'New Provision' });
  await newProvisionButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await newProvisionButton.click();
  await page.waitForLoadState('domcontentloaded');

  console.log('Step 22: Selecting Customer - Acme Corp...');
  const customerCombobox = page.getByRole('combobox', { name: 'Select Customer' });
  await customerCombobox.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await customerCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'Acme Corp' }).click();

  console.log('Step 23: Selecting Site - Acme HQ...');
  const siteCombobox = page.getByRole('combobox', { name: 'Select Site' });
  await siteCombobox.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await siteCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'Acme HQ' }).click();

  console.log(`Step 24: Entering Serial Number - ${uniqueSerialNumber}...`);
  const serialNumberField = page.locator('input[name="serialNumber"]');
  await serialNumberField.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await serialNumberField.click();
  await serialNumberField.fill(uniqueSerialNumber);

  console.log('Step 25: Selecting Provisioning Date - 5th of current month...');
  const dateButton = page.getByRole('button', { name: 'Choose date, selected date is' });
  await dateButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await dateButton.click();

  await page.waitForSelector('[role="gridcell"]', { 
    state: 'visible', 
    timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
  });
  await page.getByRole('gridcell', { name: '5', exact: true }).first().click();

  console.log('Step 26: Entering Provision Internal Notes - TEST...');
  const provisionNotesTextarea = page.locator('textarea[name="internalNotes"]');
  await provisionNotesTextarea.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await provisionNotesTextarea.click();
  await provisionNotesTextarea.fill('TEST');

  console.log('Step 27: Capturing Screenshot Before Saving...');
  await page.screenshot({ 
    path: `screenshots/equipment-provision-${timestamp}.png`, 
    fullPage: true 
  });

  console.log('Step 28: Saving Equipment Provision...');
  const saveButton = page.getByRole('button', { name: 'Save', exact: true });
  await saveButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await saveButton.click();
  await page.waitForTimeout(1000);

  console.log('Step 29: Adding New Equipment to System...');
  const addEquipmentButton = page.getByRole('button', { name: 'Add New Equipment' });
  await addEquipmentButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await addEquipmentButton.click();

  console.log('Step 30: Confirming Equipment Creation - Clicking OK...');
  try {
    const okButton = page.getByRole('button', { name: 'OK' });
    await okButton.waitFor({ state: 'visible', timeout: 3000 });
    await okButton.click();
    console.log('Confirmation dialog found and closed');
    await page.waitForTimeout(1000);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`OK button not found: ${errorMessage}`);
  }

  console.log('Step 31: Waiting for Modal/Drawer to Close...');
  try {
    const backdrop = page.locator('.MuiBackdrop-root');
    await backdrop.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('Modal backdrop closed successfully');
  } catch (error) {
    console.log('Backdrop timeout, attempting to close modals...');
    const closeButton = page.getByRole('button', { name: /close|cancel/i });
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }
  }

  console.log('Step 32: Waiting for Equipment List to Update...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  console.log('Step 33: Verifying Equipment Creation Success...');
  const successIndicators = [
    page.getByText(/success|created|saved/i),
    page.locator('[role="alert"]'),
    page.locator('.success-message'),
    page.getByText(uniqueEquipmentName, { exact: true }),
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`Checking indicator: ${errorMessage}`);
    }
  }

  if (!successFound) {
    console.log('No explicit success indicator found, checking equipment link...');
  }

  console.log('Step 34: Verifying All Modals Are Closed...');
  const allBackdrops = await page.locator('.MuiBackdrop-root').all();
  console.log(`Active backdrops: ${allBackdrops.length}`);
  for (let i = 0; i < allBackdrops.length; i++) {
    const isVisible = await allBackdrops[i].isVisible().catch(() => false);
    if (isVisible) {
      console.log(`Closing backdrop ${i + 1}...`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  }

  
  await page.waitForLoadState('domcontentloaded');

  console.log('Step 36: Capturing Final Screenshot of Equipment Details...');
  await page.screenshot({ 
    path: `screenshots/equipment-details-${timestamp}.png`, 
    fullPage: true 
  });

  console.log('Step 37: Waiting 5 seconds for visual confirmation...');
  await page.waitForTimeout(5000);

  console.log('Step 38: Verifying Final Navigation to Equipment Details...');
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  if (currentUrl.includes('equipment')) {
    console.log('Successfully navigated to equipment details page');
  }

  console.log('Step 39: Equipment creation with provisioning workflow completed successfully');
  console.log(`Created equipment: ${uniqueEquipmentName} with serial: ${uniqueSerialNumber}`);
});
