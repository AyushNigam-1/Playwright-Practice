import { test, expect } from '@playwright/test';

test('Visual Regression with Dynamic Data Masking', async ({ page }) => {
    // ==========================================
    // PHASE 1: Injecting a "Volatile" UI
    // ==========================================
    await page.setContent(`
    <style>
      body { font-family: sans-serif; padding: 20px; background: #f0f4f8; }
      .card { 
        background: white; 
        padding: 20px; 
        border-radius: 8px; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        width: 300px;
      }
      .title { font-size: 1.2rem; font-weight: bold; color: #333; }
      /* A blinking cursor to simulate animation volatility */
      .cursor { animation: blink 1s infinite; font-weight: bold; }
      @keyframes blink { 50% { opacity: 0; } }
      /* The dynamic timestamp */
      .timestamp { color: #888; font-size: 0.9rem; margin-top: 10px; }
    </style>
    
    <div class="card" id="ai-status-card">
      <div class="title">System Status <span class="cursor">|</span></div>
      <p>All neural pathways optimal.</p>
      <div class="timestamp">Last Sync: <span id="time"></span></div>
    </div>

    <script>
      document.getElementById('time').innerText = new Date().toISOString();
    </script>
  `);

    const cardComponent = page.locator('#ai-status-card');

    // ==========================================
    // PHASE 2: The Golden Image Assertion
    // ==========================================
    console.log('📸 Capturing component snapshot...');

    await expect(cardComponent).toHaveScreenshot('status-card.png', {
        // 1. MASKING: Playwright will cover this specific locator with a solid color block
        mask: [page.locator('.timestamp')],

        // 2. STABILITY: Automatically hide blinking carets and freeze CSS animations
        caret: 'hide',
        animations: 'disabled',

        // 3. TOLERANCE: Allow up to 50 pixels to be completely different before failing
        maxDiffPixels: 50,
    });

    console.log('✅ Snapshot assertion completed.');
});