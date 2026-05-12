import { test, expect } from '@playwright/test';

/**
 * Concept 1: API Testing via Request Contexts (Fixed)
 * We use JSONPlaceholder to bypass the 401 issues of ReqRes.
 */
test('API Context: Fast Data Provisioning (Fixed)', async ({ request }) => {
    const startTime = Date.now();
    console.log('--- Initiating Backend Provisioning with JSONPlaceholder ---');

    // ==========================================
    // PHASE 1: API POST (Mocking Resource Creation)
    // ==========================================
    // This simulates creating a resource (like a User or Post) 
    // that you would need to exist before running a UI test.
    const createResponse = await request.post('https://jsonplaceholder.typicode.com/posts', {
        data: {
            title: 'Architectural Review',
            body: 'Bypassing the DOM for state creation.',
            userId: 101
        }
    });

    // Check the 'ok' status (200-299 range)
    expect(createResponse.ok(), 'API call failed - check network logs').toBeTruthy();
    expect(createResponse.status()).toBe(201); // Resource Created

    const responseBody = await createResponse.json();
    console.log(`✅ Post created via API with ID: ${responseBody.id}`);

    // ==========================================
    // PHASE 2: API GET (Verification)
    // ==========================================
    // We immediately verify the state. In a real project, this ID
    // would be passed into a UI navigation: page.goto('/posts/' + responseBody.id)
    const getResponse = await request.get('https://jsonplaceholder.typicode.com/posts/1');

    expect(getResponse.status()).toBe(200);
    const postData = await getResponse.json();

    console.log(`✅ Fetched existing resource title: "${postData.title}"`);

    const elapsed = Date.now() - startTime;
    console.log(`⏱️ Total execution time (Bypassing UI): ${elapsed}ms`);
});