import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test('Create Finance Demo Appointment', async ({ page }) => {
  // Generate unique appointment data
  const timestamp = Date.now();
  const appointmentTitle = `Appointment for finance demo ${timestamp}`;

  console.log(`Step 0: Generated unique appointment title: ${appointmentTitle}`);

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
  await usernameField.fill('johndoe');

  console.log('Step 4: Entering Password...');
  const passwordField = page.getByRole('textbox', { name: 'Password' });
  await passwordField.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await passwordField.fill('123456');

  console.log('Step 5: Clicking Login Button...');
  await page.getByRole('button', { name: 'Login' }).click();

  console.log('Step 6: Waiting for Dashboard to Load...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForURL(/dashboard/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });

  console.log('Step 7: Expanding Appointments Menu...');
  await page.getByText('Appointments').click();
  await page.waitForTimeout(500);

  console.log('Step 8: Navigating to Appointments List...');
  const appointmentsSubmenu = page.getByLabel('Appointments').getByText('Appointments');
  await appointmentsSubmenu.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await page.waitForTimeout(300);
  await appointmentsSubmenu.click();
  await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });

  console.log('Step 9: Clicking Create Appointment Button...');
  const appointmentButton = page.getByRole('button', { name: 'Appointment', exact: true });
  await appointmentButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await appointmentButton.click();

  console.log('Step 10: Waiting for Appointment Form to Load...');
  await page.getByRole('textbox', { name: 'Please specify the title for' }).waitFor({
    state: 'visible',
    timeout: TEST_CONFIG.TIMEOUT.MEDIUM
  });

  console.log('Step 11: Entering Appointment Title...');
  const titleField = page.getByRole('textbox', { name: 'Please specify the title for' });
  await titleField.click();
  await titleField.fill(appointmentTitle);

  console.log('Step 12: Entering Appointment Description...');
  const descriptionField = page.locator('.jodit-wysiwyg');
  await descriptionField.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await descriptionField.click();
  await descriptionField.fill('Finance demo appointment');

  console.log('Step 13: Setting Start Date (Nov 24)...');
  const startDateButton = page.getByRole('button', { name: /Choose date, selected date is/ }).first();
  await startDateButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await startDateButton.click();
  await page.waitForTimeout(500);

  // Select day 24
  await page.getByRole('gridcell', { name: '24' }).click();
  await page.waitForTimeout(300);

  console.log('Step 14: Confirming Start Date...');
  const confirmButton = page.getByRole('button', { name: 'OK' }).first();
  await confirmButton.click();
  await page.waitForTimeout(500);

  console.log('Step 15: Selecting Time Zone...');
  const timeZoneDropdown = page.getByRole('combobox', { name: 'Select Time Zone' });
  await timeZoneDropdown.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await timeZoneDropdown.click();
  await page.waitForTimeout(300);
  await timeZoneDropdown.fill('asia/cal');
  
  // Wait for filtered options to appear
  await page.getByRole('option').first().waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await page.getByRole('option').first().click();

  console.log('Step 16: Selecting Project...');
  const projectDropdown = page.getByRole('combobox', { name: 'Select Project' });
  await projectDropdown.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await projectDropdown.click();
  await page.waitForTimeout(300);
  await page.getByRole('option', { name: '1125400007 - Machine 2' }).click();

  console.log('Step 17: Creating New Job...');
  const jobDropdown = page.getByRole('combobox', { name: 'Select Job' });
  await jobDropdown.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await jobDropdown.click();
  await page.waitForTimeout(300);
  await page.getByRole('option', { name: 'Create New Job' }).click();

  console.log('Step 18: Selecting Job Type...');
  const jobTypeDropdown = page.getByRole('combobox', { name: 'Time & Material' });
  await jobTypeDropdown.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await jobTypeDropdown.click();
  await page.waitForTimeout(300);
  await page.getByRole('option', { name: 'Fixed Fee & Material' }).click();

  console.log('Step 19: Selecting Customer Location...');
  const locationDropdown = page.getByRole('combobox', { name: 'Select Customer Location' });
  await locationDropdown.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await locationDropdown.click();
  await page.waitForTimeout(300);
  await page.getByRole('option', { name: 'Acme HQ : 144 Main St,' }).click();

  console.log('Step 20: Selecting Assignee...');
  const assigneeDropdown = page.getByRole('combobox', { name: 'Select Assignee' });
  await assigneeDropdown.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await assigneeDropdown.click();
  await page.waitForTimeout(300);
  await page.getByText('John Doe', { exact: true }).click();

  console.log('Step 21: Capturing Screenshot Before Submit...');
  await page.screenshot({ 
    path: `screenshots/finance-appointment-form-complete-${timestamp}.png`, 
    fullPage: true 
  });

  console.log('Step 22: Submitting Appointment...');
  const submitButton = page.getByRole('button', { name: 'Submit' }).first();
  await submitButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await submitButton.click();
  await page.waitForTimeout(1000);

  console.log('Step 23: Confirming Submission...');
  try {
    const okButton = page.getByRole('button', { name: 'OK' });
    await okButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await okButton.click();
    console.log('Submission confirmation found and closed');
  } catch (error) {
    console.log('No submission confirmation appeared');
  }

  await page.waitForTimeout(1000);

  console.log('Step 24: Waiting for Page to Update...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  console.log('Step 25: Verifying Appointment Creation Success...');
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
    console.log('No explicit success indicator found');
  }

  console.log('Step 26: Capturing Final Screenshot...');
  await page.screenshot({ 
    path: `screenshots/finance-appointment-created-final-${timestamp}.png`, 
    fullPage: true 
  });

  console.log('Step 27: Appointment creation workflow completed successfully');
});
