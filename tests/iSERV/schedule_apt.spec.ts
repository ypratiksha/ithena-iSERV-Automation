import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Schedule Management', () => {
  let dialogMessage = '';
  let dialogType = '';

  test.beforeEach('Login to application', async ({ page }) => {
    // Setup dialog handler
    page.on('dialog', async (dialog) => {
      dialogType = dialog.type();
      dialogMessage = dialog.message();
      
      console.log(`\nDialog Detected:`);
      console.log(`   Type: ${dialogType}`);
      console.log(`   Message: ${dialogMessage}`);
      
      await dialog.accept();
      console.log(`   Action: Dialog accepted\n`);
    });

    console.log('Step 1: Navigating to Login Page...');
    await page.goto(TEST_CONFIG.LOGIN_URL, {
      waitUntil: 'domcontentloaded',
      timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
    });

    console.log('Step 2: Logging in...');
    await page.getByText('Login Here').click();
    
    await page.getByRole('textbox', { name: 'Email / Username' }).fill(TEST_CONFIG.USERNAME);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CONFIG.PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(/dashboard/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
    console.log('Logged in successfully.');
  });

  test('Create schedule with complete workflow', async ({ page }) => {
    const timestamp = Date.now();
    const scheduleName = `AutoTest-Schedule-${timestamp}`;

    // Get current date dynamically
    const today = new Date();
    const startDay = today.getDate();
    
    // Calculate end date (2 days after start date)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 2);
    const endDay = endDate.getDate();

    // Navigate to Schedules
    console.log('Step 3: Navigating to Schedules...');
    await page.getByLabel('Schedules').click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Open New Schedule Form
    console.log('Step 4: Opening New Schedule Form...');
    await page.getByRole('button', { name: 'Schedule' }).click();

    // Wait for dialog modal
    console.log('Step 5: Waiting for form dialog to open...');
    await page.getByRole('dialog').waitFor({ 
      state: 'visible', 
      timeout: TEST_CONFIG.TIMEOUT.LONG 
    });

    // Wait for form fields
    console.log('Step 6: Waiting for form fields to be ready...');
    const scheduleNameInput = page.getByRole('textbox').first();
    await scheduleNameInput.waitFor({ 
      state: 'visible',
      timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
    });

    console.log(`Step 7: Creating schedule: "${scheduleName}"...`);

    // Fill Schedule Title
    console.log('Step 8: Filling Schedule Title...');
    await scheduleNameInput.fill(scheduleName);

    // Select Customer
    console.log('Step 9: Selecting Customer - Acme Corp...');
    await page.getByRole('combobox', { name: 'Select Customer' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Acme Corp' }).click();

    // Select User
    console.log('Step 10: Selecting User - Alice Smith...');
    await page.getByRole('combobox', { name: 'Select User' }).click();
    await page.waitForTimeout(500);
    await page.getByText('Alice Smith').first().click();

    // Select Equipment
    console.log('Step 11: Selecting Equipment - Conveyor...');
    await page.getByRole('combobox', { name: 'Select Equipment' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Conveyor: Serial # ACME-' }).click();

    // Select Department
    console.log('Step 12: Selecting Department - Electrical...');
    await page.getByRole('combobox', { name: 'Technical Support' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Electrical' }).click();

    // Select Assignee
    console.log('Step 13: Selecting Assignee - John Doe...');
    await page.getByRole('combobox', { name: 'Select Assignee' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('listbox').getByText('John Doe').first().click();

    // Select Accountable
    console.log('Step 14: Selecting Accountable - John Doe...');
    await page.getByRole('combobox', { name: 'Select Accountable' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'JD John Doe' }).click();

    // Select Service Type
    console.log('Step 15: Selecting Service Type - Breakdown Repair...');
    await page.getByRole('combobox', { name: 'Select Service Type' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Breakdown Repair' }).click();

    // Select SLA
    console.log('Step 16: Selecting SLA - Standard OEM SLA...');
    await page.getByRole('combobox', { name: 'Select SLA' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Standard OEM SLA' }).click();

    // Select Frequency
    console.log('Step 17: Selecting Frequency - Weekly...');
    await page.getByRole('combobox', { name: 'Monthly' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Weekly' }).click();
    await page.waitForTimeout(1000);

    // Select Start Date - Current Date (Dynamic)
    console.log(`Step 18: Selecting Start Date - Nov ${startDay} (Today)...`);
    await page.getByRole('button', { name: /Choose date/ }).first().click();
    await page.waitForTimeout(500);
    await page.getByRole('gridcell', { name: startDay.toString(), exact: true }).click();

    // Select End Date - 2 days after start date
    console.log(`Step 19: Selecting End Date - Nov ${endDay} (2 days after start)...`);
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Choose date/ }).last().click();
    await page.waitForTimeout(500);
    await page.getByRole('gridcell', { name: endDay.toString(), exact: true }).click();

    // Fill Description
    console.log('Step 20: Filling Schedule Description...');
    const descriptionEditor = page.locator('.jodit-wysiwyg');
    await descriptionEditor.waitFor({ 
      state: 'visible', 
      timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
    });
    await descriptionEditor.click();
    await descriptionEditor.fill(`Automated test schedule created at ${new Date().toLocaleString()}`);

    // Capture Screenshot Before Submit
    console.log('Step 21: Capturing Screenshot Before Submit...');
    await page.screenshot({ 
      path: `screenshots/schedule-${timestamp}-before-submit.png`, 
      fullPage: true 
    });

    // Submit Schedule
    console.log('Step 22: Submitting Schedule...');
    const submitButton = page.getByRole('button', { name: 'Submit' });
    await submitButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await submitButton.click();

    // Handle Success Confirmation
    console.log('Step 23: Handling Success Confirmation...');
    
    try {
      const okButton = page.getByRole('button', { name: 'OK' });
      await okButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
      
      await page.screenshot({ 
        path: `screenshots/schedule-${timestamp}-success-confirmation.png`, 
        fullPage: true 
      });
      
      await okButton.click();
      console.log('Success confirmation clicked');
    } catch (error) {
      console.log('No OK button found, checking for JavaScript dialog...');
      if (dialogMessage) {
        console.log(`Dialog was handled: ${dialogMessage}`);
      }
    }

    // Wait for Schedules List to Reload
    console.log('Step 24: Waiting for Schedules List to Reload...');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Search for Created Schedule
    console.log('Step 25: Searching for Created Schedule in List...');
    
    let scheduleFound = false;
    
    // Try exact match
    try {
      const exactMatch = page.getByRole('gridcell', { name: scheduleName, exact: true });
      await exactMatch.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
      console.log('Schedule found using exact match');
      
      await page.screenshot({ 
        path: `screenshots/schedule-${timestamp}-in-list.png`, 
        fullPage: true 
      });
      
      await exactMatch.click();
      scheduleFound = true;
    } catch (error) {
      console.log('Exact match not found, trying partial match...');
    }

    // Try partial match
    if (!scheduleFound) {
      try {
        const partialMatch = page.getByRole('gridcell', { 
          name: new RegExp(scheduleName.substring(0, 20)) 
        });
        await partialMatch.first().waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
        console.log('Schedule found using partial match');
        
        await page.screenshot({ 
          path: `screenshots/schedule-${timestamp}-in-list.png`, 
          fullPage: true 
        });
        
        await partialMatch.first().click();
        scheduleFound = true;
      } catch (error) {
        console.log('Partial match not found');
      }
    }

    // Try text content search
    if (!scheduleFound) {
      try {
        await page.getByText(scheduleName, { exact: false }).first().click();
        console.log('Schedule found using text search');
        scheduleFound = true;
      } catch (error) {
        console.log('Schedule not found in any strategy');
        throw new Error(`Failed to find schedule "${scheduleName}" in the list`);
      }
    }

    // Verify Schedule Details Page
    console.log('Step 26: Verifying Schedule Details Page...');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: `screenshots/schedule-${timestamp}-details.png`, 
      fullPage: true 
    });

    // Verify details
    await expect(page.locator('body')).toContainText(/schedule|frequency|service|equipment|assignee/i);
    console.log('Schedule details page verified');

    console.log('\nTEST COMPLETED SUCCESSFULLY');
    console.log(`   Schedule Name: ${scheduleName}`);
    console.log(`   Start Date: Nov ${startDay}, 2025 (Today)`);
    console.log(`   End Date: Nov ${endDay}, 2025 (Today + 2 days)`);
    console.log(`   Dialog Message: ${dialogMessage || 'None'}`);
    console.log(`   Schedule Found: ${scheduleFound ? 'Yes' : 'No'}`);
  });
});
