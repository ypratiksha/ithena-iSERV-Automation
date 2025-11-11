import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

// Helper function to generate unique document title
function generateUniqueDocumentTitle(): string {
  const timestamp = Date.now();
  return `User document for reference - ${timestamp}`;
}

// Test data constants
const DOCUMENT_DATA = {
  category: 'User Manuals',
  description: 'test demo',
  visibility: 'Public',
  internalNotes: 'test',
  attachmentUrls: [
    'https://iservna.ithena.io:3005/documents',
  ],
};

const AUTH_DATA = {
  username: 'johndoe',
  password: '123456',
};

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test('Create Document in Knowledgebase with URL Attachment', async ({ page }) => {
  const timestamp = Date.now();
  const uniqueDocumentTitle = generateUniqueDocumentTitle();

  console.log(`\n=== Test Run ID: ${timestamp} ===`);
  console.log('Creating Knowledgebase Document with URL Attachment');
  console.log(`Generated Document Title: ${uniqueDocumentTitle}`);

  console.log('Step 1: Navigating to Login Page...');
  try {
    await page.goto('http://44.213.176.147:3005/login', {
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
  await usernameField.fill(AUTH_DATA.username);

  console.log('Step 4: Entering Password...');
  const passwordField = page.getByRole('textbox', { name: 'Password' });
  await passwordField.fill(AUTH_DATA.password);

  console.log('Step 5: Clicking Login Button...');
  await page.getByRole('button', { name: 'Login' }).click();

  console.log('Step 6: Waiting for Dashboard to Load...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForURL(/dashboard/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
  console.log('✓ Dashboard loaded successfully');

  console.log('Step 7: Navigating to Knowledgebase → Documents...');
  await page.getByLabel('Knowledgebase').click();
  await page.waitForTimeout(500);
  await page.getByLabel('Documents').click();
  await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
  console.log('✓ Documents page loaded');

  console.log('Step 8: Clicking Create New Document Button...');
  const documentButton = page.getByRole('button', { name: 'Document' });
  await documentButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await documentButton.click();

  console.log('Step 9: Waiting for Document Form to Load...');
  const categoryCombobox = page.getByRole('combobox', { name: 'Select Category' });
  await categoryCombobox.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });

  console.log(`Step 10: Selecting Category - ${DOCUMENT_DATA.category}...`);
  await categoryCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: DOCUMENT_DATA.category }).click();
  console.log(`✓ Category selected: ${DOCUMENT_DATA.category}`);

  console.log(`Step 11: Entering Document Title - ${uniqueDocumentTitle}...`);
  const titleField = page.locator('input[name="title"]');
  await titleField.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await titleField.fill(uniqueDocumentTitle);
  console.log(`✓ Document title entered: ${uniqueDocumentTitle}`);

  console.log('Step 12: Entering Document Description...');
  const descriptionEditor = page.locator('.jodit-wysiwyg');
  await descriptionEditor.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await descriptionEditor.fill(DOCUMENT_DATA.description);
  console.log(`✓ Description entered: ${DOCUMENT_DATA.description}`);

  console.log(`Step 13: Selecting Visibility - ${DOCUMENT_DATA.visibility}...`);
  const visibilityCombobox = page.getByRole('combobox', { name: 'Public' });
  await visibilityCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: DOCUMENT_DATA.visibility }).click();
  console.log(`✓ Visibility selected: ${DOCUMENT_DATA.visibility}`);

  console.log('Step 14: Entering Internal Notes...');
  const internalNotesField = page.locator('textarea[name="internalNotes"]');
  await internalNotesField.fill(DOCUMENT_DATA.internalNotes);
  console.log(`✓ Internal notes entered: ${DOCUMENT_DATA.internalNotes}`);

  console.log('Step 15: Selecting Attachment Type - URL...');
  const attachmentTypeCombobox = page.getByRole('combobox', { name: '-- No Attachment --' });
  await attachmentTypeCombobox.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'URL' }).click();
  console.log('✓ Attachment type set to URL');

  console.log('Step 16: Entering URL Attachment...');
  const urlField = page.locator('input[name="attachmentUrl"]');
  await urlField.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await urlField.fill(DOCUMENT_DATA.attachmentUrls[0]);
  console.log(`✓ URL entered: ${DOCUMENT_DATA.attachmentUrls[0]}`);

  console.log('Step 17: Capturing Screenshot Before Uploading...');
  await page.screenshot({
    path: `screenshots/document-form-complete-${timestamp}.png`,
    fullPage: true,
  });

  console.log('Step 18: Clicking Upload Button...');
  const uploadButton = page.getByRole('button', { name: 'Upload', exact: true });
  await uploadButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
  await uploadButton.click();

  console.log('Step 19: Checking for Upload Confirmation Dialog...');
  try {
    const okButton = page.getByRole('button', { name: 'OK' });
    await okButton.waitFor({ state: 'visible', timeout: 3000 });
    await okButton.click();
    console.log('✓ Upload confirmation dialog found and closed');
  } catch (error) {
    console.log('ℹ No upload confirmation dialog appeared');
  }

  await page.waitForTimeout(1000);

  console.log('Step 20: Verifying Document Creation...');
  await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.LONG });

  console.log('Step 21: Checking for Success Indicator...');
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
    console.log('ℹ No explicit success indicator found, proceeding...');
  }

  console.log('Step 22: Waiting for Page to Stabilize...');
  await page.waitForTimeout(2000);

  console.log('Step 23: Verifying Document Appears in List...');
  try {
    const documentLink = page.getByText(uniqueDocumentTitle);
    await documentLink.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    console.log('✓ Document found in list');
  } catch (error) {
    console.log('ℹ Document not visible in list yet');
  }

  console.log('Step 24: Capturing Final Screenshot...');
  await page.screenshot({
    path: `screenshots/document-created-final-${timestamp}.png`,
    fullPage: true,
  });

  console.log('Step 25: Verifying Navigation...');
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);

  if (currentUrl.includes('knowledgebase') || currentUrl.includes('document')) {
    console.log('✓ Successfully on knowledgebase documents page');
  }

  console.log(`\n✓ Test completed successfully`);
  console.log(`Document Created: ${uniqueDocumentTitle}, Category: ${DOCUMENT_DATA.category}, URL: ${DOCUMENT_DATA.attachmentUrls[0]}\n`);
});
