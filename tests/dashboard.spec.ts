import { test, expect } from '@playwright/test';

// This test starts with the cookies/localStorage from our setup
test('Access Protected Dashboard', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/secure');

    // We should be on the secure page immediately
    await expect(page.locator('h2')).toContainText('Secure Area');
    await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
});