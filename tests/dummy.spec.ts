import { test, expect } from '@playwright/test';

test('trace generation test', async ({ page }) => {
    await page.goto('https://example.com');

    // This will timeout and fail after the default 30s
    await page.locator('button#non-existent-checkout').click({ timeout: 2000 });
});