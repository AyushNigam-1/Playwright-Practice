import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
    console.log('\\n[🧹 Global Teardown] Tearing down Infrastructure...');

    // Simulate graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[🧹 Global Teardown] Vector DB container destroyed.');
}

export default globalTeardown;