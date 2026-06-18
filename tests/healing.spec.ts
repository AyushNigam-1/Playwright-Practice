import { test, expect } from '@playwright/test';
import { chromium } from 'playwright-core';
import { Stagehand } from '@browserbasehq/stagehand';

test('Self-healing checkout flow (V3 CDP Native)', async () => {
    // 1. Stagehand owns the Browser lifecycle natively
    const stagehand = new Stagehand({ env: 'LOCAL', model: 'groq/openai/gpt-oss-120b' });
    await stagehand.init();

    // 2. Playwright bridges into Stagehand's CDP WebSocket (Modern API)
    const browser = await chromium.connectOverCDP(stagehand.connectURL());
    const pwPage = browser.contexts()[0].pages()[0];

    // 3. Standard Playwright Execution
    await pwPage.goto('https://example.com');
    const brittleLocator = pwPage.locator('#old-btn');

    try {
        await brittleLocator.click({ timeout: 2000 });
    } catch (e) {
        console.warn(`⚠️ [Self-Healing] Locator failed. Engaging AI fallback...`);
        // 4. Pass the bridged Playwright Page explicitly to V3 act
        await stagehand.act("Click the main link/button to view more information", { page: pwPage });
    }

    await expect(pwPage).toHaveURL(/.*domains/);

    // Cleanup
    await browser.close();
    await stagehand.close();
});