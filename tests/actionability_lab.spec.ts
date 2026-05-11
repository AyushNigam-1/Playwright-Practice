import { test, expect } from '@playwright/test';

test('The Actionability Checklist: Animation & Overlays', async ({ page }) => {
    console.log('--- Injecting Non-Deterministic UI ---');

    await page.setContent(`
    <style>
      #target-btn {
        position: absolute;
        top: -200px; 
        left: 50px;
        transition: top 2s ease-in-out;
      }
      .slide-in {
        top: 100px !important;
      }
      #overlay {
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(255,0,0,0.5);
        z-index: 9999;
        display: none; /* FIX: Start hidden */
      }
      .active {
        display: block !important; /* FIX: Class to show the overlay */
      }
    </style>

    <div id="overlay">Simulating API Load... Blocking Interactions</div>
    <button id="trigger">Trigger UI State</button>
    <button id="target-btn" onclick="this.innerText = 'BOOM! CLICKED!'">Target Button</button>

    <script>
      document.getElementById('trigger').addEventListener('click', () => {
         // 1. Show the blocking overlay immediately
         document.getElementById('overlay').classList.add('active');

         // 2. Start animating the target button after 1 second
         setTimeout(() => {
            document.getElementById('target-btn').classList.add('slide-in');
         }, 1000);

         // 3. Remove the blocking overlay after 4 seconds
         setTimeout(() => {
            document.getElementById('overlay').classList.remove('active');
         }, 4000);
      });
    </script>
  `);

    // We click the trigger to start the cascade of events
    await page.locator('#trigger').click();

    const targetButton = page.locator('#target-btn');

    console.log('⏳ Attempting to click the target button...');
    const startTime = Date.now();

    // Playwright's Checklist in action:
    // - Attached? Yes.
    // - Visible? Yes.
    // - Stable? Fails for 3 seconds while moving.
    // - Receives Events? Fails for 4 seconds because of the red #overlay.
    // Playwright will automatically poll and wait for ALL checks to pass.
    await targetButton.click();

    const endTime = Date.now();
    const elapsed = (endTime - startTime) / 1000;

    console.log(`✅ Click registered! Playwright auto-waited ${elapsed} seconds.`);

    // Verify the native DOM onclick handler fired
    await expect(targetButton).toHaveText('BOOM! CLICKED!');
});