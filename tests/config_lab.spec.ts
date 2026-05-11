import { test, expect } from '@playwright/test';

test('Worker Allocation and Retry Mechanic', async ({ page }) => {
    await page.goto('/');

    const isFlaky = Math.random() > 0.5;
    console.log(`[Test Execution] Flaky condition is: ${isFlaky}`);

    expect(isFlaky, 'Intentional failure to trigger retry context').toBe(true);
});