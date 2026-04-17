const apiKey = process.env.GEMINI_API_KEY;
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
];

const BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * 🤖 Gemini Generate Function
 */
const generateWithGemini = async (prompt, retry = 2) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const TIMEOUT = prompt.length > 5000 ? 40000 : 25000;

  for (let model of MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      console.log(`🤖 Trying model: ${model}`);

      const response = await fetch(
        `${BASE_URL}/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const msg = data?.error?.message || "";

        console.error(`🔥 ${model} Error:`, msg);

        // 🚫 Invalid key
        if (response.status === 401) {
          throw new Error("INVALID_API_KEY");
        }

        // 🚫 Quota
        if (response.status === 429 || msg.includes("QUOTA")) {
          throw new Error("QUOTA_EXHAUSTED");
        }

        // 🔁 Retry on overload / temporary issues
        if (
          msg.includes("high demand") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("RESOURCE_EXHAUSTED")
        ) {
          if (retry > 0) {
            console.log("⏳ Retrying due to overload...");
            await delay(3000);
            return generateWithGemini(prompt, retry - 1);
          }
        }

        // 🚫 Model not found → skip to next model
        if (msg.includes("not found")) {
          console.log(`🚫 Model not available: ${model}`);
          continue;
        }

        continue;
      }

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (text) return text;

    } catch (err) {
      if (err.name === "AbortError") {
        console.log(`⏳ Timeout on ${model}`);
        continue;
      }

      if (err.message === "INVALID_API_KEY") {
        throw err;
      }

      if (err.message === "QUOTA_EXHAUSTED") {
        throw err;
      }

      console.log(`⚠️ Error with ${model}:`, err.message);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error("All Gemini models failed");
};

export default {
  name: "gemini",
  generate: generateWithGemini,
};