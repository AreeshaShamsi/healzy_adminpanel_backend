import geminiService from "./gemini.service.js";

/**
 * 🧼 Safe JSON extractor (handles markdown + messy LLM output)
 */
function extractJSON(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty response from Gemini");
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    // remove markdown wrappers if Gemini adds them
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  }
}

/**
 * 🚀 Combined Content + SEO (100-word blog)
 */
export const generateAllInOne = async (payload = {}) => {
  console.log("🧪 Combined generation started...");

  if (!payload.topic) {
    throw new Error("Topic is required");
  }

  const prompt = `
You are a strict JSON generator.

Rules:
- Output ONLY valid JSON
- No markdown
- No explanation
- No extra text
- No backticks

Return this format exactly:

{
  "content": "100-word blog here",
  "seo": {
    "title": "short SEO title",
    "description": "meta description",
    "keywords": "comma separated keywords"
  }
}

Topic: ${payload.topic}
`.trim();

  try {
    const result = await geminiService.generate(prompt);

    const parsed = extractJSON(result);

    // strict validation
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.content ||
      !parsed.seo ||
      !parsed.seo.title
    ) {
      throw new Error("Invalid JSON structure from Gemini");
    }

    return {
      success: true,
      provider: "gemini",
      data: parsed,
    };
  } catch (err) {
    console.error("❌ AI Error:", err.message);

    throw err;
  }
};

export default {
  generateAllInOne,
};