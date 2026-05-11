import { test, expect } from '@playwright/test';

test('The NetworkIdle Trap vs UI State', async ({ page }) => {
    // 1. Intercept a fake URL to serve our custom SPA HTML
    await page.route('https://spa-simulation.com', route => {
        route.fulfill({
            contentType: 'text/html',
            body: `
        <html>
          <body>
            <div id="status">Booting SPA...</div>
            <script>
              // Simulate fetching actual user data (Fast - 500ms)
              setTimeout(() => {
                 document.getElementById('status').innerText = 'User Profile Loaded';
              }, 500);

              // Simulate a heavy third-party tracker/analytics script (Slow - 5000ms)
              // This keeps a network connection open, destroying "networkidle"
              fetch('https://slow-analytics-server.com/track');
            </script>
          </body>
        </html>
      `
        });
    });

    // 2. Intercept the slow analytics call and delay it artificially by 5 seconds
    await page.route('https://slow-analytics-server.com/track', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await route.fulfill({ status: 200, body: 'tracked' });
    });

    // ==========================================
    // SCENARIO 1: THE ANTI-PATTERN (networkidle)
    // ==========================================
    console.log('--- SCENARIO 1: The networkidle Trap ---');
    const startBad = Date.now();

    // We navigate and tell Playwright to wait until the network is perfectly quiet.
    await page.goto('https://spa-simulation.com', { waitUntil: 'networkidle' });

    const timeBad = (Date.now() - startBad) / 1000;
    console.log(`❌ Page "loaded" in ${timeBad}s. We wasted ~4.5 seconds waiting for irrelevant analytics!`);


    // ==========================================
    // SCENARIO 2: THE PLAYWRIGHT WAY (Web-First)
    // ==========================================
    console.log('\\n--- SCENARIO 2: Actionability & Web-First Assertions ---');
    const startGood = Date.now();

    // We navigate and ONLY wait for the basic DOM tree to exist
    await page.goto('https://spa-simulation.com', { waitUntil: 'domcontentloaded' });

    // We ignore the network entirely and assert on the UI state we actually care about
    await expect(page.locator('#status')).toHaveText('User Profile Loaded');

    const timeGood = (Date.now() - startGood) / 1000;
    console.log(`✅ Page tested in ${timeGood}s. We validated the UI and ignored the background noise.`);
});