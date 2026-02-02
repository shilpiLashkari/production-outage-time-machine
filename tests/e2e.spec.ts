import { test, expect } from '@playwright/test';

test('Critical Path: Incident Resolution Sync', async ({ browser }) => {
    // 1. Open Angular Admin (Control Room)
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto('http://localhost:4200');
    console.log('Opened Admin Console');

    // 2. Open React Analytics (Dashboard)
    const analyticsContext = await browser.newContext();
    const analyticsPage = await analyticsContext.newPage();
    await analyticsPage.goto('http://localhost:3000');
    console.log('Opened Analytics Dashboard');

    // 3. Verify Initial State
    await expect(adminPage.getByText('Production Time-Machine')).toBeVisible();
    await expect(analyticsPage.getByText('Analytics Dashboard')).toBeVisible();

    // 4. Wait for Incident (triggered by Backend every ~5s)
    // We can also manually trigger it via UI if we had a dev button, 
    // but let's wait for the "AI" to do it.
    console.log('Waiting for AI to trigger incident...');
    await adminPage.waitForSelector('.alert-modal', { timeout: 15000 });
    console.log('Incident Detected in Admin!');

    // 5. User Resolves Incident
    await adminPage.getByRole('button', { name: 'ACKNOWLEDGE' }).click();
    await expect(adminPage.getByText('INVESTIGATING')).toBeVisible();

    await adminPage.getByRole('button', { name: 'DEPLOY FIX' }).click();
    console.log('Fix Deployed!');

    // 6. Verify Sync in React
    // React should show a Success Toast and Green Flash
    await analyticsPage.waitForSelector('text=SYSTEM RESTORED via SYNC', { timeout: 5000 });
    console.log('Success verified in Analytics Dashboard!');
});
