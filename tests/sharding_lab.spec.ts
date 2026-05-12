import { test, expect } from '@playwright/test';

// We use a loop to dynamically generate 6 tests
for (let i = 1; i <= 6; i++) {
    test(`Heavy Integration Test #${i}`, async ({ page }) => {
        console.log(`[Shard Execution] Running Test ${i}...`);

        // Simulate a test that takes 2 seconds to run
        await new Promise(resolve => setTimeout(resolve, 2000));

        expect(true).toBe(true);
    });
}