import { test as setup, expect } from '@playwright/test';

const authFile = '.auth/user.json';

setup('authenticate', async ({ page }) => {
    // 1. Perform the actual UI login
    await page.goto('https://the-internet.herokuapp.com/login');
    await page.getByLabel('Username').fill('tomsmith');
    await page.getByLabel('Password').fill('SuperSecretPassword!');
    await page.getByRole('button', { name: 'Login' }).click();

    // 2. Wait for the app to reach a "Logged In" state
    await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();

    // 3. PERSISTENCE: Save the entire context state to disk
    await page.context().storageState({ path: authFile });
    console.log('✅ Auth state persisted to .auth/user.json');
});