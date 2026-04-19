import geminiService from "./gemini.service.js";

/**
 * ⏳ Delay helper
 */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * 🧼 Strong JSON extractor
 */
function extractJSON(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty AI response");
  }

  let cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/\n/g, " ")
    .replace(/\r/g, "")
    .trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {}

  // Extract JSON block
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start !== -1 && end !== -1) {
    let jsonString = cleaned.slice(start, end + 1);

    jsonString = jsonString
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/\s+/g, " ");

    return JSON.parse(jsonString);
  }

  throw new Error("Invalid JSON");
}

/**
 * 🛠 Fix broken JSON using AI
 */
async function fixJSON(brokenText) {
  const prompt = `
Fix this JSON and return ONLY valid JSON:

${brokenText}
`;

  const fixed = await geminiService.generate(prompt);
  return extractJSON(fixed);
}

/**
 * 🤖 Providers (add more later)
 */
const providers = [
  {
    name: "gemini",
    handler: geminiService.generate,
  },
];

/**
 * 🚀 Core AI generator
 */
export const generate = async ({
  prompt,
  expectJSON = false,
  retries = 2,
}) => {
  if (!prompt) throw new Error("Prompt required");

  for (const provider of providers) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🤖 ${provider.name} | Attempt ${attempt + 1}`);

        const result = await provider.handler(prompt);

        if (!result) throw new Error("Empty response");

        if (!expectJSON) return result.trim();

        try {
          return extractJSON(result);
        } catch {
          console.log("⚠️ Fixing JSON...");
          return await fixJSON(result);
        }

      } catch (err) {
        console.log(`⚠️ ${provider.name} failed:`, err.message);

        if (attempt < retries) {
          await delay(1500);
        } else {
          console.log("❌ Switching provider...");
        }
      }
    }
  }

  throw new Error("All AI providers failed");
};

export default { generate };