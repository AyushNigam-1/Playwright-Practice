import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import "dotenv/config";

async function run() {
    // 1. Initialize Stagehand in LOCAL mode (spins up a local Chromium instance)
    const stagehand = new Stagehand({ env: 'LOCAL', model: 'groq/openai/gpt-oss-120b' });

    // init() takes 0 arguments in v3
    await stagehand.init();

    // Stagehand orchestrates the Chromium Context
    const page = stagehand.context.pages()[0];

    console.log("Navigating to Sandbox...");
    // Use a much lighter website to stay under Groq's 8k TPM limit
    await page.goto("https://books.toscrape.com/");

    console.log("\n--- 👁️ Observing the Page ---");
    const actions = await stagehand.observe("find the first 2 book titles");

    // 3. THE EXTRACT PRIMITIVE: Pull structured JSON using Zod
    console.log("\n--- 🧲 Extracting Typed Data ---");
    const BookSchema = z.object({
        books: z.array(z.object({
            title: z.string(),
            price: z.string()
        }))
    });

    const data = await stagehand.extract("Extract the first 2 books.", BookSchema);

    console.log("Extracted Data:", JSON.stringify(data, null, 2));

    await stagehand.close();
}

run().catch(console.error);