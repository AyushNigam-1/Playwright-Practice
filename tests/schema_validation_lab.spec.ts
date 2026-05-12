import { test, expect } from '@playwright/test';
import { z } from 'zod';

// ==========================================
// PHASE 1: Define the Contract (The "Pydantic" Model)
// ==========================================
// This schema represents the exact contract your Next.js app expects.
const AiInferenceSchema = z.object({
    inference_id: z.uuid(),
    model_version: z.string().regex(/^v\d+\.\d+\.\d+$/), // Must be semantic versioning
    results: z.array(
        z.object({
            label: z.string(),
            // Confidence must be a float between 0 and 1
            confidence: z.number().min(0).max(1),
            bounding_box: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional()
        })
    ),
    processing_time_ms: z.number().int().positive()
});

test('API Contract Validation using Zod', async ({ request }) => {
    // ==========================================
    // PHASE 2: Fetch the Data (Simulated Backend)
    // ==========================================
    // For this lab, we will mock the response of our own request to simulate a backend.
    // In reality, this would just be `await request.get('https://api.myapp.com/v1/inference')`

    const mockBackendResponse = {
        inference_id: "123e4567-e89b-12d3-a456-426614174000",
        model_version: "v2.1.0",
        results: [
            { label: "pedestrian", confidence: 0.98, bounding_box: [10, 20, 100, 200] },
            { label: "stop_sign", confidence: 0.85 } // bounding_box is optional
        ],
        processing_time_ms: 45
    };

    console.log('--- Validating Valid Payload ---');

    // Parse the data through our strict schema
    const parsed = AiInferenceSchema.safeParse(mockBackendResponse);

    // We assert that the parse was successful. 
    // If true, the contract is intact.
    expect(parsed.success).toBeTruthy();
    console.log('✅ Valid payload passed schema validation.');

    // ==========================================
    // PHASE 3: Simulating a Backend Contract Breach
    // ==========================================
    console.log('\\n--- Simulating Backend Contract Breach ---');

    // A backend engineer accidentally changed processing_time_ms to a string ("45ms")
    // and confidence to a percentage out of 100 instead of a float.
    const badBackendResponse = {
        ...mockBackendResponse,
        results: [{ label: "pedestrian", confidence: 98 }], // Violation: > 1
        processing_time_ms: "45" // Violation: String instead of Number
    };

    const failedParse = AiInferenceSchema.safeParse(badBackendResponse);

    // We expect this to fail
    expect(failedParse.success).toBeFalsy();

    if (!failedParse.success) {
        console.log('❌ Schema Validation Failed as expected!');
        console.log('--- Zod Error Report ---');
        // Zod provides incredibly detailed error paths
        failedParse.error.issues.forEach(err => {
            console.log(`Path: ${err.path.join('.')} -> ${err.message}`);
        });
    }
});