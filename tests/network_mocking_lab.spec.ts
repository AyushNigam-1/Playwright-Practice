import { test, expect } from '@playwright/test';

test.describe('Network Interception & Mocking', () => {

    // We inject a fake SPA that fetches data from a REST endpoint on load
    test.beforeEach(async ({ page }) => {
        await page.setContent(`
      <div id="app">
        <h1>Dashboard</h1>
        <button id="fetch-btn">Fetch Data</button>
        <div id="status">Idle</div>
        <pre id="data-container"></pre>
      </div>

      <script>
        document.getElementById('fetch-btn').addEventListener('click', async () => {
          const statusEl = document.getElementById('status');
          const dataEl = document.getElementById('data-container');
          
          statusEl.innerText = 'Loading...';
          dataEl.innerText = '';

          try {
            // Simulating a call to a FastAPI or Next.js backend
            const response = await fetch('https://api.myapp.com/v1/metrics');
            if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
            
            const data = await response.json();
            statusEl.innerText = 'Success';
            dataEl.innerText = JSON.stringify(data, null, 2);
          } catch (error) {
            statusEl.innerText = 'Error Boundary Triggered: ' + error.message;
          }
        });
      </script>
    `);
    });

    // ==========================================
    // SCENARIO 1: The Happy Path (Mocking 200 OK)
    // ==========================================
    test('Mocking a 200 OK Payload', async ({ page }) => {
        // Intercept the specific API call
        await page.route('https://api.myapp.com/v1/metrics', async route => {
            // Fulfill with a synthetic JSON payload
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ active_users: 9999, cpu_load: '12%' })
            });
        });

        await page.click('#fetch-btn');

        // Validate the UI reflects our mocked data
        await expect(page.locator('#status')).toHaveText('Success');
        await expect(page.locator('#data-container')).toContainText('9999');
    });

    // ==========================================
    // SCENARIO 2: Backend Outage (Mocking 500)
    // ==========================================
    test('Simulating a 500 Internal Server Error', async ({ page }) => {
        // Intercept and force a server crash response
        await page.route('https://api.myapp.com/v1/metrics', async route => {
            await route.fulfill({ status: 500, body: 'Internal Server Error' });
        });

        await page.click('#fetch-btn');

        // Validate the frontend Error Boundary catches the 500 gracefully
        await expect(page.locator('#status')).toHaveText('Error Boundary Triggered: HTTP 500');
    });

    // ==========================================
    // SCENARIO 3: High Latency (Slow Network)
    // ==========================================
    test('Simulating Network Latency for Loading States', async ({ page }) => {
        await page.route('https://api.myapp.com/v1/metrics', async route => {
            // Artificially delay the response by 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ msg: 'Sorry I am late' })
            });
        });

        await page.click('#fetch-btn');

        // Assert that the 'Loading...' state appears immediately
        await expect(page.locator('#status')).toHaveText('Loading...');

        // Playwright's auto-wait will inherently wait up to 5s for this to become true
        await expect(page.locator('#status')).toHaveText('Success');
        await expect(page.locator('#data-container')).toContainText('late');
    });
});