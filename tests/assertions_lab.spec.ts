import { test, expect } from '@playwright/test';

test('Web-First Polling vs Static Evaluation', async ({ page }) => {
    console.log('--- Loading Slow SPA ---');

    await page.setContent(`
    <div id="root">Fetching data from API...</div>
    <script>
      setTimeout(() => {
        document.getElementById('root').innerHTML = '<button class="submit">Checkout</button>';
      }, 3000);
    </script>
  `);

    // We define our AOM locator. (Remember: locators are lazy, they don't query the DOM yet)
    const checkoutButton = page.getByRole('button', { name: 'Checkout' });

    // ==========================================
    // THE LEGACY WAY (Static Evaluation - DO NOT DO THIS)
    // ==========================================
    // If we evaluated the state right now, it would be false.
    // const isCurrentlyVisible = await checkoutButton.isVisible(); 
    // expect(isCurrentlyVisible).toBe(true); // <--- This would instantly fail!

    // ==========================================
    // THE PLAYWRIGHT WAY (Web-First Polling)
    // ==========================================
    console.log('⏳ Executing assertion. Playwright is now polling the CDP...');
    const startTime = Date.now();

    // We await the ASSERTION. Playwright will continuously check the DOM
    // for up to 5 seconds until this button appears.
    await expect(checkoutButton).toBeVisible();

    const endTime = Date.now();
    console.log(`✅ Assertion passed! The test naturally waited ${(endTime - startTime) / 1000} seconds.`);
});