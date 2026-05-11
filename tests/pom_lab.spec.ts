import { test, expect } from '@playwright/test';
import { LoginPage } from '../page/login.page';

test('User can log in using POM Architecture', async ({ page }) => {
    // 1. Instantiate the Page Object (Injecting the page context)
    const loginPage = new LoginPage(page);

    // 2. Execute business-level actions
    await loginPage.navigate();
    await loginPage.authenticate('tomsmith', 'SuperSecretPassword!');

    // 3. Assert on the exposed locators
    // Note: We keep the assertion in the test file, not the Page Object.
    // The Page Object's job is to interact, the test's job is to validate.
    await expect(loginPage.flashMessage).toContainText('You logged into a secure area!');
});