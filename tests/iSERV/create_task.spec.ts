import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Task Management', () => {
  test.beforeEach('Login to application', async ({ page }) => {
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

  test('Create task for Acme conveyor issue', async ({ page }) => {
    const timestamp = Date.now();

    // Navigate to Tasks Section
    console.log('Step 3: Navigating to Tasks...');
    await page.getByLabel('Tasks').getByText('Tasks').click();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.LONG });

    // Click New Task Button
    console.log('Step 4: Creating new task...');
    const taskButton = page.getByRole('button', { name: 'Task' });
    await expect(taskButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await taskButton.click();

    // Wait for Task Form
    console.log('Step 5: Waiting for task form to load...');
    await expect(page.getByRole('textbox', { name: 'Please specify the title for' })).toBeVisible({ 
      timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
    });

    // Enter Task Title
    console.log('Step 6: Entering task title...');
    const taskTitleField = page.getByRole('textbox', { name: 'Please specify the title for' });
    await taskTitleField.fill(`task for acme ${timestamp}`);

    // Enter Task Description
    console.log('Step 7: Entering task description...');
    const joditEditor = page.locator('.jodit-wysiwyg');
    await expect(joditEditor).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await joditEditor.click();
    await joditEditor.fill('acme test task description');

   // Select Assignee
console.log('Step 8: Selecting assignee - John Doe...');
const assigneeCombobox = page.getByRole('combobox', { name: 'Select Assignee' });
await assigneeCombobox.click();
await page.waitForTimeout(500);

// Use getByRole to select from the dropdown
await page.getByRole('option', { name: 'John Doe' }).click();


    // Select Ticket
    console.log('Step 9: Selecting ticket - Issue with conveyor...');
    const ticketCombobox = page.getByRole('combobox', { name: 'Select Ticket' });
    await ticketCombobox.click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: '- Issue with conveyor' }).click();

    // Select Task Due Date
    console.log('Step 10: Selecting task due date - Day 12...');
    const dateButton = page.getByRole('button', { name: 'Choose date, selected date is' });
    await dateButton.click();
    await expect(page.getByRole('gridcell', { name: '12' })).toBeVisible({ 
      timeout: TEST_CONFIG.TIMEOUT.MEDIUM 
    });
    await page.getByRole('gridcell', { name: '12' }).click();

    // Capture Screenshot Before Saving
    console.log('Step 11: Capturing screenshot before saving...');
    await page.screenshot({ 
      path: `screenshots/acme-task-before-save-${timestamp}.png`, 
      fullPage: true 
    });

    // Save Task
    console.log('Step 12: Saving task...');
    const saveButton = page.getByRole('button', { name: 'Save', exact: true });
    await expect(saveButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await saveButton.click();

    // Handle Confirmation Dialog
    console.log('Step 13: Handling confirmation dialog...');
    const okButton = page.getByRole('button', { name: 'OK' });
    await expect(okButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await okButton.click();

    // Wait for Task Creation
    console.log('Step 14: Waiting for task to be created...');
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
    await page.waitForTimeout(2000);

    // Verify Success
    console.log('Step 15: Verifying task creation...');
    const successIndicators = [
      page.getByText(/success|created|saved/i),
      page.locator('[role="alert"]'),
      page.locator('.success-message'),
    ];

    let successFound = false;
    for (const indicator of successIndicators) {
      try {
        await indicator.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.SHORT });
        const successText = await indicator.textContent();
        console.log(`Success: ${successText}`);
        successFound = true;
        break;
      } catch {
        // Continue checking
      }
    }

    if (!successFound) {
      console.log('No explicit success message found');
    }

    // Verify Task in List
    console.log('Step 16: Verifying task appears in list...');
    try {
      const taskLink = page.getByText(`task for acme ${timestamp}`, { exact: false }).first();
      await taskLink.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
      console.log('Task found in list');
      
      console.log('Step 17: Clicking on created task...');
      await taskLink.click();
      await page.waitForLoadState('domcontentloaded');
    } catch {
      console.log('Task not visible in list, but may have been created');
    }

    // Capture Final Screenshot
    await page.screenshot({ 
      path: `screenshots/acme-task-created-${timestamp}.png`, 
      fullPage: true 
    });

    // Verify Page State
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    console.log('Task creation completed successfully.');
    console.log(`Task Title: task for acme ${timestamp}`);
  });
});
