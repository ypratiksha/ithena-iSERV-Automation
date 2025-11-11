import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';
import taskData from '../data/task-data.json';

test('Create task using JSON data', async ({ page }) => {
  // Use config variables for navigation and credentials
  await page.goto(TEST_CONFIG.LOGIN_URL, {
    timeout: TEST_CONFIG.TIMEOUT.TEST,
    waitUntil: 'domcontentloaded'
  });

  // Wait for and interact with the login sequence
  await expect(page.getByText('Login Here')).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await page.getByText('Login Here').click();

  await expect(page.getByRole('textbox', { name: /Email.*Username/i })).toBeVisible();
  await page.getByRole('textbox', { name: /Email.*Username/i }).fill(TEST_CONFIG.USERNAME);

  await expect(page.getByRole('textbox', { name: /Password/i })).toBeVisible();
  await page.getByRole('textbox', { name: /Password/i }).fill(TEST_CONFIG.PASSWORD);

  await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  await page.getByRole('button', { name: /Login/i }).click();

  // Navigate and wait for Tasks section
  await expect(page.getByText('Tasks')).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await page.getByText('Tasks').click();

  // Wait for and click the "Task" button to add a new task
  await expect(page.getByRole('button', { name: /Task/i })).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await page.getByRole('button', { name: /Task/i }).click();

  // Fill out task form with values from your JSON data
  await expect(page.getByRole('textbox', { name: /title/i })).toBeVisible();
  await page.getByRole('textbox', { name: /title/i }).fill(taskData.task.title);

  // Select assignee from dropdown
  await expect(page.getByRole('combobox', { name: /Assignee/i })).toBeVisible();
  await page.getByRole('combobox', { name: /Assignee/i }).click();
  await expect(page.getByRole('option', { name: taskData.task.assignee })).toBeVisible();
  await page.getByRole('option', { name: taskData.task.assignee }).click();

  // Pick date from the calendar widget
  await expect(page.getByRole('button', { name: /Choose date/i })).toBeVisible();
  await page.getByRole('button', { name: /Choose date/i }).click();
  await expect(page.getByRole('gridcell', { name: taskData.task.date, exact: true })).toBeVisible();
  await page.getByRole('gridcell', { name: taskData.task.date, exact: true }).click();

  // Save the task
  // Only match the "Save" button, not "Save & New"
await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
await page.getByRole('button', { name: 'Save', exact: true }).click();

});
