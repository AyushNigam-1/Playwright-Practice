import { test, expect } from '@playwright/test';

test('Post-Mortem Analysis: The Invisible Button', async ({ page }) => {
    // ==========================================
    // PHASE 1: Injecting a Buggy UI
    // ==========================================
    await page.setContent(`
    <style>
      body { font-family: sans-serif; padding: 20px; }
      #checkout-btn { padding: 15px; background: green; color: white; border: none; cursor: pointer; }
      
      /* The Bug: A promotional banner drops down and covers the screen */
      #promo-overlay {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.8); color: white; display: flex; 
        align-items: center; justify-content: center; z-index: 9999;
      }
    </style>
    
    <h1>Shopping Cart</h1>
    <button id="checkout-btn">Proceed to Checkout</button>

    <script>
      // The promo banner appears after 1 second, right when the user tries to click
      setTimeout(() => {
        const overlay = document.createElement('div');
        overlay.id = 'promo-overlay';
        overlay.innerText = 'FLASH SALE! 50% OFF!';
        document.body.appendChild(overlay);
      }, 1000);
    </script>
  `);

    // ==========================================
    // PHASE 2: The Failing Action
    // ==========================================
    console.log('⏳ Waiting for 1.5 seconds to let the promo banner appear...');
    await page.waitForTimeout(1500);

    console.log('💥 Attempting to click the checkout button (This will timeout and fail!)...');

    // Playwright's Actionability Checklist (Module 2) will prevent this click
    // because the button is obscured by the #promo-overlay.
    // We use a short timeout so we don't have to wait 30 seconds for the lab to finish.
    await page.locator('#checkout-btn').click({ timeout: 3000 });
});