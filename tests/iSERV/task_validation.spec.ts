import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';
import taskData from '../data/task-data.json';

test('Task creation with validation using config and data file', async ({ page }) => {
  // Set test timeout from config
  test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

  // Login steps
  await page.goto(TEST_CONFIG.LOGIN_URL, {
    timeout: TEST_CONFIG.TIMEOUT.LONG,
    waitUntil: 'domcontentloaded'
  });
  await page.getByText('Login Here').click();
  await page.getByRole('textbox', { name: 'Email / Username' }).fill(TEST_CONFIG.USERNAME);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CONFIG.PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

  // Navigate to Tasks and open the task form
  await page.getByText('Tasks').click();
  await expect(page.getByRole('button', { name: 'Task' })).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await page.getByRole('button', { name: 'Task' }).click();
  await expect(page.getByRole('heading', { name: 'Add New Task' })).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });

  // FIRST TASK: Trigger validation
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Please specify the title for' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Please specify the title for' }).fill(taskData.firstTask.title);
  await page.locator('.jodit-wysiwyg').fill(taskData.firstTask.description);
  await page.getByRole('combobox', { name: 'Select Assignee' }).click();
  await expect(page.getByRole('option', { name: taskData.firstTask.assignee })).toBeVisible();
  await page.getByRole('option', { name: taskData.firstTask.assignee }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  // SECOND TASK: Fill all details using data file
  await expect(page.getByRole('textbox', { name: 'Please specify the title for' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Please specify the title for' }).fill(taskData.secondTask.title);
  await page.getByRole('textbox', { name: 'Please specify the title for' }).press('Tab');
  await page.locator('.jodit-wysiwyg').fill(taskData.secondTask.description);
  await page.getByRole('combobox', { name: 'Select Assignee' }).click();
  await expect(page.getByRole('option', { name: taskData.secondTask.assignee })).toBeVisible();
  await page.getByRole('option', { name: taskData.secondTask.assignee }).click();
  await page.getByRole('combobox', { name: 'Select Ticket' }).click();
  await expect(page.getByRole('option', { name: taskData.secondTask.ticket })).toBeVisible();
  await page.getByRole('option', { name: taskData.secondTask.ticket }).click();
  await page.getByRole('combobox', { name: 'Select Associated Appointment' }).click();
  await expect(page.getByRole('option', { name: taskData.secondTask.appointment })).toBeVisible();
  await page.getByRole('option', { name: taskData.secondTask.appointment }).click();
  await page.getByRole('button', { name: 'Choose date, selected date is' }).click();
  await expect(page.getByRole('gridcell', { name: taskData.secondTask.date, exact: true })).toBeVisible();
  await page.getByRole('gridcell', { name: taskData.secondTask.date, exact: true }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'OK' }).click();
});
