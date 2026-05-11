import { test, expect, chromium } from '@playwright/test';

test('Multi-Context Isolation and iFrame Interaction', async ({ browser }) => {
    // 1. Create two entirely isolated sessions (Incognito-style)
    const adminContext = await browser.newContext();
    const userContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const userPage = await userContext.newPage();

    // 2. Setup: Admin sets a 'Secret' in local storage
    await adminPage.goto('https://example.com');
    await adminPage.evaluate(() => localStorage.setItem('auth', 'admin-token-123'));

    // 3. Setup: User sets a different 'Secret'
    await userPage.goto('https://example.com');
    await userPage.evaluate(() => localStorage.setItem('auth', 'user-token-456'));

    // PROOF OF ISOLATION:
    const adminAuth = await adminPage.evaluate(() => localStorage.getItem('auth'));
    const userAuth = await userPage.evaluate(() => localStorage.getItem('auth'));

    console.log(`Admin Token: ${adminAuth}`);
    console.log(`User Token: ${userAuth}`);
    expect(adminAuth).not.toBe(userAuth);

    // 4. iFrame Interaction (Direct Piercing)
    // We inject a mock iframe into the admin page
    await adminPage.setContent(`
    <h1>Main Document</h1>
    <iframe srcdoc="<html><body><button id='inner-btn'>I am inside a frame</button></body></html>" 
            id="my-frame" 
            style="width:200px; height:100px;">
    </iframe>
  `);

    // Instead of 'switching' to the frame, we locate it
    const frame = adminPage.frameLocator('#my-frame');
    const innerButton = frame.locator('#inner-btn');

    // We can interact with the frame directly
    await innerButton.click();
    console.log('✅ Clicked button inside iframe without global context switching.');

    // Clean up
    await adminContext.close();
    await userContext.close();
});