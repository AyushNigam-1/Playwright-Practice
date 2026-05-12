import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    console.log('\\n[🌍 Global Setup] Booting Infrastructure...');

    // 1. Simulate a heavy, one-time operation (e.g., Docker container boot)
    console.log('[🌍 Global Setup] Pulling and starting Vector DB image...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Set an environment variable that ALL workers will inherit
    // In reality, this might be a dynamic port assigned by Docker
    process.env.VECTOR_DB_URL = 'http://localhost:8080/v1/embeddings';

    console.log(`[🌍 Global Setup] Vector DB Ready at: ${process.env.VECTOR_DB_URL}`);
}

export default globalSetup;