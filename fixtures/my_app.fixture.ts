import { test as base, expect } from '@playwright/test';

// 1. Define the interface for our injected dependencies
type AppFixtures = {
    dbConnection: string;
    seededUser: { id: string; role: string };
};

// 2. Extend the base test object with our provisioning logic
export const test = base.extend<AppFixtures>({

    // Fixture A: A simulated DB connection
    dbConnection: async ({ }, use) => {
        // --- SETUP PHASE ---
        console.log('[⚙️ Fixture] Provisioning Database Connection...');
        const db = "postgres://admin:secret@localhost:5432/testdb";

        // --- YIELD PHASE ---
        // The test executes HERE. The fixture pauses.
        await use(db);

        // --- TEARDOWN PHASE ---
        // This runs after the test finishes, even if the test fails!
        console.log('[🧹 Fixture] Closing Database Connection...');
    },

    // Fixture B: Depends on Fixture A! (Notice 'dbConnection' in the args)
    seededUser: async ({ dbConnection }, use) => {
        // --- SETUP PHASE ---
        console.log(`[⚙️ Fixture] Seeding User using DB: ${dbConnection.split('@')[0]}...`);
        const user = { id: 'usr_999', role: 'admin' };

        // --- YIELD PHASE ---
        await use(user);

        // --- TEARDOWN PHASE ---
        console.log(`[🧹 Fixture] Deleting User ${user.id} from DB...`);
    }
});

// Re-export expect so our test files only need one import
export { expect };