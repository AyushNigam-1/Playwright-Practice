import { test, expect } from '@playwright/test';

test('Test 1: App connects to Vector DB', async ({ page }) => {
    const dbUrl = process.env.VECTOR_DB_URL;

    // If global setup failed, this assertion fails immediately
    expect(dbUrl).toBeDefined();

    console.log(`[Worker] Test 1 executing against: ${dbUrl}`);
});

test('Test 2: Another feature', async () => {
    console.log(`[Worker] Test 2 executing concurrently...`);
});