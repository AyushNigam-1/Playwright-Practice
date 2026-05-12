import { test, expect } from '@playwright/test';

test('WebSocket Interception & Server-Push Simulation', async ({ page }) => {

    // ==========================================
    // PHASE 1: Serve HTML via route (fixes about:blank bypass)
    // ==========================================
    await page.route('http://test.local/', route => {
        route.fulfill({
            contentType: 'text/html',
            body: `
                <style>
                  #chat-box { width: 400px; height: 200px; border: 1px solid #ccc; padding: 10px; font-family: monospace; }
                  .cursor { animation: blink 1s step-end infinite; }
                  @keyframes blink { 50% { opacity: 0; } }
                </style>

                <h2>AI Streaming Interface</h2>
                <button id="connect-btn">Generate Response</button>
                <div id="chat-box"><span id="output"></span><span id="cursor" class="cursor">_</span></div>
                <div id="status-badge">Idle</div>

                <script>
                  document.getElementById('connect-btn').addEventListener('click', () => {
                    document.getElementById('status-badge').innerText = 'Connecting...';

                    const ws = new WebSocket('wss://ai.myapp.com/stream');

                    ws.onopen = () => {
                      document.getElementById('status-badge').innerText = 'Connected & Streaming';
                      ws.send('Generate a greeting.');
                    };

                    ws.onmessage = (event) => {
                      const data = JSON.parse(event.data);
                      if (data.token) {
                        document.getElementById('output').innerText += data.token;
                      }
                      if (data.status === 'DONE') {
                        document.getElementById('status-badge').innerText = 'Generation Complete';
                        document.getElementById('cursor').style.display = 'none';
                        ws.close();
                      }
                    };

                    ws.onerror = () => {
                      document.getElementById('status-badge').innerText = 'WS Error';
                    };
                  });
                </script>
            `
        });
    });

    // ==========================================
    // PHASE 2: Mock WebSocket server
    // ==========================================
    await page.routeWebSocket(/ai\.myapp\.com\/stream/, ws => {
        ws.onMessage(message => {
            console.log(`[Mock Server] Received: ${message}`);
            setTimeout(() => ws.send(JSON.stringify({ token: 'Hello' })), 500);
            setTimeout(() => ws.send(JSON.stringify({ token: ' System' })), 1000);
            setTimeout(() => ws.send(JSON.stringify({ token: ' Architect.' })), 1500);
            setTimeout(() => ws.send(JSON.stringify({ status: 'DONE' })), 2000);
        });
    });

    // ==========================================
    // PHASE 3: Navigate, execute, assert
    // ==========================================
    await page.goto('http://test.local/');
    await page.locator('#connect-btn').click();

    console.log('⏳ Waiting for full stream to complete...');
    await expect(page.locator('#output')).toHaveText('Hello System Architect.', { timeout: 10_000 });
    await expect(page.locator('#status-badge')).toHaveText('Generation Complete');
    await expect(page.locator('#cursor')).toBeHidden();

    console.log('✅ Real-time WS stream validated successfully.');
});