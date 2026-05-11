import { test, expect } from '@playwright/test';

test('Architectural Speed & Auto-waiting', async ({ page }) => {
    // Playwright initiates a WebSocket connection here
    await page.goto('https://example.com');

    // This isn't just a click; it's a sequence of actionability checks
    // sent over the CDP pipe.
    const moreInfo = page.getByRole('link', { name: 'Learn More' });

    await moreInfo.click();

    await expect(page).toHaveURL(/iana\.org/);
});