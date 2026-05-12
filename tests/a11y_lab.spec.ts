import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Automated Accessibility Scan (AOM Validation)', async ({ page }) => {
    // ==========================================
    // PHASE 1: Injecting an Inaccessible UI
    // ==========================================
    console.log('--- Deploying UI with A11y Violations ---');

    await page.setContent(`
    <style>
      /* Violation 1: Terrible color contrast */
      .bad-button { background-color: #000000; color: #111111; padding: 10px; }
    </style>
    
    <div id="app">
      <img src="https://via.placeholder.com/150" />
      
      <div class="bad-button" onclick="alert('Clicked')">Submit Data</div>
      
      <input type="text" placeholder="Enter API Key" />
    </div>
  `);

    // ==========================================
    // PHASE 2: The Axe-Core Execution
    // ==========================================
    console.log('⏳ Running Axe-Core Ruleset Engine...');

    // We instantiate the AxeBuilder and point it at our page context.
    // We can optionally narrow the scan to a specific locator using .include('#app')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // ==========================================
    // PHASE 3: Analyzing the Violations
    // ==========================================
    const violations = accessibilityScanResults.violations;

    console.log(`\n❌ Found ${violations.length} Accessibility Violations:`);

    violations.forEach((violation, index) => {
        console.log(`\n[${index + 1}] Rule ID: ${violation.id}`);
        console.log(`    Impact: ${violation.impact}`);
        console.log(`    Description: ${violation.description}`);
        console.log(`    Failing Nodes: ${violation.nodes.length}`);
        // Log the exact HTML snippet that caused the failure
        violation.nodes.forEach(node => {
            console.log(`      -> HTML: ${node.html}`);
        });
    });

    // ==========================================
    // PHASE 4: The CI/CD Assertion
    // ==========================================
    // In a real pipeline, this assertion fails the build if the array is not empty.
    // For this lab, we expect it to fail so we can see the output.
    expect(violations.length, 'Accessibility violations found. Autonomous agents will fail to parse this UI.').toBe(0);
});