import { test, expect } from '@playwright/test';

test('CSS vs AOM Locators during a UI Refactor', async ({ page }) => {

    console.log('--- Deploying Version 1 ---');
    await page.setContent(`
    <form>
      <label for="username">Username</label>
      <input id="username" class="input-dark-mode" type="text" />
      <button class="btn-submit" type="submit">Sign In</button>
    </form>
  `);

    const cssButton = page.locator('.btn-submit');
    const roleButton = page.getByRole('button', { name: 'Sign In' });

    await expect(cssButton).toBeVisible();
    await expect(roleButton).toBeVisible();

    console.log('--- Deploying Version 2 (CSS Classes Changed) ---');
    await page.setContent(`
    <form>
      <label for="username">Username</label>
      <input id="username" class="bg-gray-800 text-white" type="text" />
      <button class="bg-blue-500 hover:bg-blue-700" type="submit">Sign In</button>
    </form>
  `);

    await expect(roleButton).toBeVisible();
    console.log('✅ getByRole succeeded!');

    console.log('⏳ Waiting for CSS locator to fail...');
    let cssFailed = false;
    try {
        await expect(cssButton).toBeVisible({ timeout: 2000 });
    } catch (error) {
        cssFailed = true;
        console.log('❌ CSS Locator failed as expected! Technical debt triggered.');
    }

    expect(cssFailed).toBe(true);
});