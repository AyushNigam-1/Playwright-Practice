import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
    // Dependency Injection of the Playwright Page context
    readonly page: Page;

    // Single Source of Truth for Locators
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly flashMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        // We bind our locators in the constructor. 
        // Notice we use AOM/Web-First locators where possible.
        this.usernameInput = page.getByLabel('Username');
        this.passwordInput = page.getByLabel('Password');
        this.submitButton = page.getByRole('button', { name: 'Login' });
        this.flashMessage = page.locator('#flash');
    }

    /**
     * Action: Navigates to the login page.
     */
    async navigate() {
        await this.page.goto('https://the-internet.herokuapp.com/login');
    }

    /**
     * Action: Encapsulates the multi-step login flow into a single business action.
     */
    async authenticate(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }
}