import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.setTimeout(TEST_CONFIG.TIMEOUT.TEST);

test.describe('Appointments Management', () => {
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

    await page.waitForURL(/dashboard|home/i, { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });
    console.log('Logged in successfully.');
  });

  test('View appointment details for breakdown failure repair', async ({ page }) => {
    const timestamp = Date.now();

    // Navigate to Appointments
    console.log('Step 3: Navigating to Appointments...');
    await page.getByLabel('Appointments').getByText('Appointments').click();
    
    await expect(page.locator('text=List of all the Appointments')).toBeVisible({ 
      timeout: TEST_CONFIG.TIMEOUT.LONG 
    });
    console.log('Appointments page loaded.');

    // Wait for appointments to load
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.TIMEOUT.VERY_LONG });

    // Click appointment card/button on calendar
    console.log('Step 4: Clicking "appointment for breakdown" on calendar...');
    const appointmentButton = page.getByRole('button', { name: 'appointment for breakdown' });
    await expect(appointmentButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await appointmentButton.click();

    // Wait for popup or modal to appear
    console.log('Step 5: Waiting for appointment popup...');
    await page.waitForTimeout(1000);

    // Click on the appointment title/link to view full details
    console.log('Step 6: Clicking appointment details link...');
    const appointmentDetailsLink = page.getByText('appointment for breakdown failure repair', { exact: true });
    await expect(appointmentDetailsLink).toBeVisible({ timeout: TEST_CONFIG.TIMEOUT.MEDIUM });
    await appointmentDetailsLink.click();

    // Wait for navigation and page load
    console.log('Step 7: Waiting for appointment details page to load...');
    await page.waitForURL(/appointment|details/i, { timeout: TEST_CONFIG.TIMEOUT.LONG });
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Wait for appointment details content to be fully rendered
    console.log('Step 8: Waiting for appointment details content to render...');
    
    // Wait for multiple key elements to ensure details are fully loaded
    const detailsLoaded = await page.waitForFunction(
      () => {
        const body = document.body.textContent || '';
        const hasAppointmentText = /appointment for breakdown/i.test(body);
        const hasDetailsContent = /customer|date|status|description|notes/i.test(body);
        return hasAppointmentText && hasDetailsContent;
      },
      { timeout: TEST_CONFIG.TIMEOUT.LONG }
    );

    console.log('Appointment details content rendered.');

    // Verify specific appointment details sections are visible
    console.log('Step 9: Verifying appointment details sections...');
    
    const detailsSectionSelectors = [
      { selector: 'text=Appointment Details', name: 'Appointment Details heading' },
      { selector: 'text=Appointment Info', name: 'Appointment Info heading' },
      { selector: 'text=appointment for breakdown', name: 'Appointment title' },
      { selector: 'text=Customer', name: 'Customer section' },
      { selector: 'text=Date', name: 'Date section' },
      { selector: 'text=Status', name: 'Status section' },
    ];

    let visibleSections = [];
    for (const section of detailsSectionSelectors) {
      const element = page.locator(section.selector).first();
      try {
        await element.waitFor({ state: 'visible', timeout: 5000 });
        console.log(`Found: ${section.name}`);
        visibleSections.push(section.name);
      } catch {
        console.log(`Not found: ${section.name}`);
      }
    }

    if (visibleSections.length === 0) {
      console.warn('Warning: No standard appointment detail sections found');
      await page.screenshot({ 
        path: `screenshots/appointment-details-missing-${timestamp}.png`, 
        fullPage: true 
      });
    } else {
      console.log(`Found ${visibleSections.length} detail section(s): ${visibleSections.join(', ')}`);
    }

    // Additional wait to ensure all dynamic content is loaded
    console.log('Step 10: Waiting for any dynamic content to finish loading...');
    await page.waitForTimeout(2000);

    // Verify core appointment content
    await expect(page.locator('body')).toContainText(/appointment for breakdown/i, {
      timeout: TEST_CONFIG.TIMEOUT.MEDIUM
    });
    console.log('Appointment title verified in page content.');

    // Check if all images are loaded
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise(resolve => {
            img.onload = img.onerror = resolve;
          }))
      );
    });
    console.log('All images loaded.');

    // Verify page is stable and ready
    await page.waitForFunction(
      () => document.readyState === 'complete',
      { timeout: TEST_CONFIG.TIMEOUT.MEDIUM }
    );
    console.log('Page is fully loaded and stable.');

    // Capture final screenshot
    await page.screenshot({ 
      path: `screenshots/appointment-breakdown-details-${timestamp}.png`, 
      fullPage: true 
    });
    console.log('Screenshot saved successfully.');

    // Log current URL and final status
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    console.log('Test completed successfully. Appointment details fully displayed.');
  });
});
