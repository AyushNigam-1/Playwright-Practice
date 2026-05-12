import { test, expect } from '../fixtures/my_app.fixture.ts';

// Test 1: Requests both page and seededUser. 
// Playwright will resolve seededUser -> dbConnection, and provision both.
test('Test requires an authenticated user', async ({ page, seededUser }) => {
    console.log(`[🚀 Test] Executing for user: ${seededUser.id} (${seededUser.role})`);

    await page.setContent(`<h1>Welcome ${seededUser.role}</h1>`);
    await expect(page.locator('h1')).toContainText('admin');
});

// Test 2: Only requests the dbConnection.
// Playwright is smart enough NOT to run the seededUser fixture for this test!
test('Test only requires the database', async ({ dbConnection }) => {
    console.log(`[🚀 Test] Executing with direct DB access...`);

    expect(dbConnection).toContain('postgres');
});