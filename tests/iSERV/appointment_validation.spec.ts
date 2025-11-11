import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';
import appointmentData from '../data/apt-data.json';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

function pad2(n: string | number) {
  return n.toString().padStart(2, '0');
}

test.describe('Appointment Management', () => {
  test.beforeEach('Login to application', async ({ page }) => {
    await page.goto(TEST_CONFIG.LOGIN_URL, {
      waitUntil: 'domcontentloaded',
      timeout: TEST_CONFIG.TIMEOUT.VERY_LONG,
    });
    await page.getByText('Login Here').click();
    await page.getByRole('textbox', { name: 'Email / Username' }).fill(TEST_CONFIG.USERNAME);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CONFIG.PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/dashboard/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
  });

  test('Create new appointment using JSON data (with past date)', async ({ page }) => {
    const ts = Date.now();
    await expect(page.getByText('Appointments')).toBeVisible({ timeout: 15000 });
    await page.getByText('Appointments').click();

    // Click "Appointment" button
    const appointmentButton = page.getByRole('button', { name: /Appointment/i }).first();
    await expect(appointmentButton).toBeVisible({ timeout: 15000 });
    await appointmentButton.click();

    await expect(page.getByRole('textbox', { name: /title/i })).toBeVisible();
    await page.getByRole('textbox', { name: /title/i }).fill(appointmentData.appointment.title);
    await expect(page.locator('.jodit-wysiwyg')).toBeVisible();
    await page.locator('.jodit-wysiwyg').fill(appointmentData.appointment.description);

    // START DATE and TIME
    await page.getByLabel('Choose date, selected date is').first().click();
    const startMonthLabel = new Date(
      `${appointmentData.appointment.start_year}-${pad2(appointmentData.appointment.start_month)}-01`
    ).toLocaleString('default', { month: 'long', year: 'numeric' });
    for (let i = 0; i < 12; ++i) {
      const labelVisible = await page.locator(`.MuiPickersCalendarHeader-label:text-is("${startMonthLabel}")`).first().isVisible();
      if (labelVisible) break;
      await page.getByRole('button', { name: /next month/i }).last().click();
      await page.waitForTimeout(100);
    }
    const startDateCell = page.getByRole('gridcell', { name: appointmentData.appointment.start_date }).first();
    await expect(startDateCell).toBeEnabled();
    await startDateCell.click();
    if (appointmentData.appointment.start_hour) {
      await page.getByRole('spinbutton', { name: /Hours/i }).first().fill(appointmentData.appointment.start_hour);
    }
    if (appointmentData.appointment.start_minute) {
      await page.getByRole('spinbutton', { name: /Minutes/i }).first().fill(appointmentData.appointment.start_minute);
    }
    if (appointmentData.appointment.start_meridiem) {
      await page.getByRole('spinbutton', { name: /Meridiem/i }).first().fill(appointmentData.appointment.start_meridiem);
    }
    await page.getByRole('button', { name: 'OK' }).click();

    // END DATE and TIME
    await page.getByLabel('Choose date, selected date is').nth(1).click();
    const endMonthLabel = new Date(
      `${appointmentData.appointment.end_year}-${pad2(appointmentData.appointment.end_month)}-01`
    ).toLocaleString('default', { month: 'long', year: 'numeric' });
    for (let i = 0; i < 12; ++i) {
      const labelVisible = await page.locator(`.MuiPickersCalendarHeader-label:text-is("${endMonthLabel}")`).first().isVisible();
      if (labelVisible) break;
      await page.getByRole('button', { name: /next month/i }).last().click();
      await page.waitForTimeout(100);
    }
    const endDateCell = page.getByRole('gridcell', { name: appointmentData.appointment.end_date }).first();
    await expect(endDateCell).toBeEnabled();
    await endDateCell.click();
    if (appointmentData.appointment.end_hour) {
      await page.getByRole('spinbutton', { name: /Hours/i }).nth(1).fill(appointmentData.appointment.end_hour);
    }
    if (appointmentData.appointment.end_minute) {
      await page.getByRole('spinbutton', { name: /Minutes/i }).nth(1).fill(appointmentData.appointment.end_minute);
    }
    if (appointmentData.appointment.end_meridiem) {
      await page.getByRole('spinbutton', { name: /Meridiem/i }).nth(1).fill(appointmentData.appointment.end_meridiem);
    }
    await page.getByRole('button', { name: 'OK' }).click();

    // Other dropdowns
    await page.getByRole('combobox', { name: 'Select Ticket' }).click();
    await page.getByRole('option', { name: appointmentData.appointment.ticket }).click();

    await page.getByRole('combobox', { name: 'Select Service Report' }).click();
    await page.getByRole('option', { name: appointmentData.appointment.service_report }).click();

    await page.getByRole('combobox', { name: 'Select Customer Location' }).click();
    await page.getByRole('option', { name: appointmentData.appointment.customer_location }).click();

    await page.getByRole('combobox', { name: 'Select Assignee' }).click();
    await expect(page.getByText(appointmentData.appointment.assignee, { exact: true })).toBeVisible();
    await page.getByText(appointmentData.appointment.assignee, { exact: true }).click();

    await page.screenshot({ path: `screenshots/appointment-form-${ts}.png`, fullPage: true });

    // Submit and validate the error is displayed for invalid (past) date/time
    await page.getByRole('button', { name: 'Submit', exact: true }).click();

    // This should match the error message your system shows for invalid datetime
    const errorAlert = page.locator('text=/end datetime must be after|date.*in the past|date.*not allowed/i');
    await expect(errorAlert).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.LONG });

    await page.screenshot({ path: `screenshots/appointment-error-${ts}.png`, fullPage: true });
  });
});
