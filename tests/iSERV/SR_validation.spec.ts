import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';
import serviceReportData from '../data/service-report-data.json';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Service Report Management', () => {
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

  test('Create service report - first submit without ticket, then with ticket', async ({ page }) => {
    const timestamp = Date.now();
    const reportName = `${serviceReportData.serviceReport.titlePrefix} ${timestamp}`;

    console.log('Step 3: Navigating to Service Reports...');
    await page.getByLabel('Service Reports').getByText('Service Reports').click();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.LONG });

    console.log('Step 4: Clicking Service Report button...');
    const serviceReportButton = page.getByRole('button', { name: 'Service Report', exact: true });
    await expect(serviceReportButton).toBeVisible();
    await serviceReportButton.click();

    console.log('Step 5: Waiting for service report form...');
    await expect(page.getByRole('combobox', { name: 'Time & Material Service Report' })).toBeVisible();

    console.log('Step 6: Selecting report type...');
    await page.getByRole('combobox', { name: 'Time & Material Service Report' }).click();
    await page.getByRole('option', { name: serviceReportData.serviceReport.reportType }).click();

    console.log('Step 7: Filling service report name...');
    await page.getByRole('textbox', { name: 'Please enter name for the' }).click();
    await page.getByRole('textbox', { name: 'Please enter name for the' }).fill(reportName);

    console.log('Step 8: Selecting date...');
    await page.getByRole('button', { name: 'Choose date, selected date is' }).click();
    await page.getByRole('gridcell', { name: serviceReportData.serviceReport.dateGridCell }).click();

    console.log('Step 9: Selecting customer...');
    await page.locator('div').filter({ hasText: /^Select Customer$/ }).click();
    await page.getByRole('option', { name: serviceReportData.serviceReport.customer }).click();

    console.log('Step 10: Selecting user...');
    await page.getByRole('combobox', { name: 'Select User' }).click();
    await page.getByText(serviceReportData.serviceReport.user).click();

    console.log('Step 11: Selecting assignee...');
    await page.getByRole('combobox', { name: 'Select Assignee(s)' }).click();
    await page.getByText(serviceReportData.serviceReport.assignee).click();

    await page.screenshot({ 
      path: `screenshots/service-report-before-first-submit-${timestamp}.png`, 
      fullPage: true 
    });

    console.log('Step 12: First Submit - Clicking Save button WITHOUT ticket...');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ 
      path: `screenshots/service-report-after-first-submit-${timestamp}.png`, 
      fullPage: true 
    });

    console.log('Step 13: Now selecting ticket...');
    await page.getByRole('combobox', { name: 'Select Ticket' }).click();
    await page.getByRole('option', { name: serviceReportData.serviceReport.ticket }).click();

    await page.screenshot({ 
      path: `screenshots/service-report-with-ticket-${timestamp}.png`, 
      fullPage: true 
    });

    console.log('Step 14: Second Submit - Clicking Save button WITH ticket...');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // FIX: Verify SR created by checking if it appears in the list
    await expect(page.getByText(reportName)).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });

    await page.screenshot({ 
      path: `screenshots/service-report-final-success-${timestamp}.png`, 
      fullPage: true 
    });

    await page.waitForTimeout(5000); // wait for 5 seconds after SR creation
    console.log('Service report created successfully after adding ticket and waited 5 seconds.');
  });
});
