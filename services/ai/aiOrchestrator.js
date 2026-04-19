import geminiService from "./gemini.service.js";
import ollamaService from "./ollama.service.js";

/**
 * ⏳ Delay helper
 */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * 🧼 JSON extractor
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

  try {
    return JSON.parse(cleaned);
  } catch {}

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

  throw new Error("Invalid JSON from AI");
}

/**
 * 🛠 Fix broken JSON using same provider (no fallback switching)
 */
async function fixJSON(providerName, brokenText) {
  const prompt = `Fix this JSON and return ONLY valid JSON:\n${brokenText}`;

  const service =
    providerName === "gemini" ? geminiService : ollamaService;

  const fixed = await service.generate(prompt);
  return extractJSON(fixed);
}

/**
 * 🤖 Providers registry
 */
const providers = {
  gemini: {
    name: "gemini",
    handler: geminiService.generate,
  },
  ollama: {
    name: "ollama",
    handler: ollamaService.generate,
  },
};

/**
 * 🚀 CORE GENERATOR (NO AUTO FALLBACK)
 */
export const generate = async ({
  prompt,
  provider = "gemini", // default fixed
  expectJSON = false,
  retries = 2,
}) => {
  if (!prompt) throw new Error("Prompt required");

  const selected = providers[provider];

  if (!selected) {
    throw new Error(`Invalid provider selected: ${provider}`);
  }

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🤖 Provider: ${selected.name} | Attempt ${attempt + 1}`);

      const result = await selected.handler(prompt);

      if (!result) throw new Error("Empty response from AI");

      // NON-JSON RESPONSE
      if (!expectJSON) {
        return {
          success: true,
          provider: selected.name,
          attempt: attempt + 1,
          data: result.trim(),
        };
      }

      // JSON RESPONSE
      try {
        const json = extractJSON(result);

        return {
          success: true,
          provider: selected.name,
          attempt: attempt + 1,
          data: json,
        };
      } catch (err) {
        console.log("⚠️ JSON broken → fixing...");

        const fixed = await fixJSON(selected.name, result);

        return {
          success: true,
          provider: selected.name,
          attempt: attempt + 1,
          data: fixed,
          fixed: true,
        };
      }

    } catch (err) {
      lastError = err;
      console.log(`❌ ${selected.name} failed: ${err.message}`);

      if (attempt < retries) {
        await delay(1500);
      }
    }
  }

  throw new Error(
    `${selected.name} failed after ${retries + 1} attempts. Last error: ${lastError?.message}`
  );
};

export default { generate };