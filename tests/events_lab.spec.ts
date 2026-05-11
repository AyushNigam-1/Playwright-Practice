import { test, expect } from '@playwright/test';

test('Event-Driven Dialogs and Buffer Injection', async ({ page }) => {
    // 1. Inject our mock UI
    await page.setContent(`
    <style>
      /* Modern apps hide the actual file input to style a custom button */
      #file-upload { display: none; }
      .upload-btn { background: blue; color: white; padding: 10px; cursor: pointer; }
    </style>
    
    <div>
      <label for="file-upload" class="upload-btn">Click to Upload</label>
      <input type="file" id="file-upload" />
    </div>
    
    <div id="status">Waiting for file...</div>

    <script>
      const input = document.getElementById('file-upload');
      input.addEventListener('change', (e) => {
        const fileName = e.target.files[0].name;
        // This confirm dialog halts the main thread!
        const userConfirmed = confirm(\`Are you sure you want to upload "\${fileName}"?\`);
        
        if (userConfirmed) {
          document.getElementById('status').innerText = 'Upload Successful: ' + fileName;
        } else {
          document.getElementById('status').innerText = 'Upload Cancelled';
        }
      });
    </script>
  `);

    // ==========================================
    // PHASE 1: Setting up the Event Listener
    // ==========================================
    // We MUST set this up BEFORE the dialog is triggered.
    // Playwright intercepts the dialog and passes the object to our callback.
    page.on('dialog', async dialog => {
        console.log(`\\n🛑 Intercepted thread-blocking dialog: "${dialog.message()}"`);
        expect(dialog.type()).toBe('confirm');

        // We explicitly accept the confirm() prompt
        await dialog.accept();
        console.log('✅ Dialog accepted via Node.js listener.');
    });

    // ==========================================
    // PHASE 2: In-Memory Payload Injection
    // ==========================================
    const fileInput = page.locator('#file-upload');

    console.log('⏳ Injecting buffer directly into hidden DOM node...');

    // We bypass the OS file picker and inject a raw buffer.
    // Notice we target the HIDDEN input, not the styled label.
    await fileInput.setInputFiles({
        name: 'architect_payload.json',
        mimeType: 'application/json',
        buffer: Buffer.from('{"system_compromised": true, "access_level": "root"}')
    });

    // ==========================================
    // PHASE 3: Validation
    // ==========================================
    // Web-first assertion waits for the DOM to update after the dialog is dismissed
    await expect(page.locator('#status')).toHaveText('Upload Successful: architect_payload.json');
    console.log('✅ Execution complete. The V8 thread was successfully managed.');
    await page.close()
});