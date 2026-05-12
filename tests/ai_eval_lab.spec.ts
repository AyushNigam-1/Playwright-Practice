import { test, expect as baseExpect, Locator } from '@playwright/test';

// ==========================================
// PHASE 1: The Model-Graded Eval (Mocked)
// ==========================================
// In production, this function would use the OpenAI/Anthropic SDK 
// to ask a judge model if the 'actualText' fulfills the 'criteria'.
async function callLlmJudge(actualText: string, criteria: string): Promise<{ pass: boolean; reason: string }> {
    console.log(`\n[🧠 LLM Judge] Evaluating text: "${actualText.substring(0, 30)}..."`);
    console.log(`[🧠 LLM Judge] Criteria: "${criteria}"`);

    // Simulating network call to Eval LLM
    await new Promise(r => setTimeout(r, 800));

    // A basic heuristic to simulate LLM comprehension for our lab
    const normalizedText = actualText.toLowerCase();
    const pass = normalizedText.includes('paris') && normalizedText.includes('capital');

    if (pass) {
        return { pass: true, reason: "The text correctly identifies Paris as the capital." };
    } else {
        return { pass: false, reason: "The text failed to identify Paris as the capital." };
    }
}

// ==========================================
// PHASE 2: Custom Playwright Matcher
// ==========================================
const expect = baseExpect.extend({
    async toPassSemanticEval(locator: Locator, criteria: string) {
        // 1. Extract the raw text from the DOM node
        const actualText = await locator.innerText();

        // 2. Pass it to our LLM Evaluator
        const result = await callLlmJudge(actualText, criteria);

        // 3. Return the result in Playwright's required format
        return {
            message: () => `LLM Judge Evaluation Failed!\nReason: ${result.reason}\nActual UI Text: "${actualText}"`,
            pass: result.pass,
        };
    },
});

// ==========================================
// PHASE 3: The Test Execution
// ==========================================
test('AI Chatbot Validation via Model-Graded Evals', async ({ page }) => {
    // Inject our AI Chat UI
    await page.setContent(`
    <div id="chat-container">
      <div class="message ai" id="final-response">
        Well, according to geographical records, the capital city of France is Paris. It is known for the Eiffel Tower.
      </div>
      <div id="stream-status" data-status="complete">✅ Generation Complete</div>
    </div>
  `);

    // 1. Wait for the terminal state (Streaming Finished)
    // This handles the non-deterministic timing of agentic workflows.
    await expect(page.locator('#stream-status')).toHaveAttribute('data-status', 'complete');

    // 2. Extract the response node
    const aiResponse = page.locator('#final-response');

    // 3. THE MAGIC: Use our custom Semantic Evaluator
    console.log('⏳ Running Semantic Assertion...');
    await expect(aiResponse).toPassSemanticEval('It must state that Paris is the capital.');
    console.log('✅ Semantic Assertion Passed!');
});