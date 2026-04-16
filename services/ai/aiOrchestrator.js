import geminiService from "./gemini.service.js";
import ollamaService from "./ollama.service.js";
import claudeService from "./claude.service.js";
import { extractEntities, parseJsonBlock } from "./helpers.js";
import toSlug from "../../utils/slugify.js";

const providers = {
  gemini: geminiService,
  claude: claudeService,
  ollama: ollamaService,
};

const defaultOrder = ["gemini", "claude", "ollama"];

const getProviderOrder = (preferred) => {
  const normalized = (preferred || "").toLowerCase();
  if (!providers[normalized]) return defaultOrder;
  return [normalized, ...defaultOrder.filter((item) => item !== normalized)];
};

const runWithFallback = async (preferredProvider, runner) => {
  const errors = [];
  const order = getProviderOrder(preferredProvider);

  for (const key of order) {
    try {
      const result = await runner(providers[key]);
      return {
        providerUsed: key,
        result,
      };
    } catch (error) {
      errors.push({ provider: key, message: error.message });
    }
  }

  const details = errors.map((e) => `[${e.provider}] ${e.message}`).join(" | ");
  throw new Error(`All AI providers failed. ${details}`);
};

const prompts = {
  content: ({ topic, primary_keyword, secondary_keywords, industry, word_count }) => `
You are an expert blog writer.
Write long-form MDX content for topic: "${topic}" in industry "${industry}".
Requirements:
- 1 H1 only
- Minimum ${Math.max(1200, Number(word_count) || 1200)} words
- Use primary keyword: "${primary_keyword}" naturally
- Use secondary keywords: ${(secondary_keywords || []).join(", ")}
- Include practical examples and strong section headings
- Output only MDX content
`,
  seo: ({ topic, primary_keyword, blog_body }) => `
Generate SEO JSON for this blog.
Topic: ${topic}
Primary keyword: ${primary_keyword}
Body: ${blog_body}
Return strict JSON with keys:
meta_title (50-60 chars ending with "| Healzy"),
meta_description (140-155 chars),
slug (lowercase hyphenated)
`,
  aeo: ({ topic, blog_body }) => `
Generate AEO JSON.
Topic: ${topic}
Blog body: ${blog_body}
Return strict JSON with:
aeo_answer_block (40-60 words),
faq_json (array of minimum 4 objects, each: question, answer with 40-80 words)
`,
  aio: ({ blog_body }) => `
Generate AIO JSON from this body.
Return strict JSON with:
llm_summary (max 300 chars, 1-3 sentences),
entities (array of entities)
Body: ${blog_body}
`,
};

export const generateContent = async (payload) => {
  const { providerUsed, result } = await runWithFallback(payload.provider, (service) =>
    service.generate(prompts.content(payload))
  );

  return {
    providerUsed,
    content_mdx: result,
  };
};

export const generateSEO = async (payload) => {
  const { providerUsed, result } = await runWithFallback(payload.provider, (service) =>
    service.generate(prompts.seo(payload))
  );

  const parsed = parseJsonBlock(result) || {};

  return {
    providerUsed,
    meta_title: parsed.meta_title || "",
    meta_description: parsed.meta_description || "",
    slug: parsed.slug || toSlug(payload.topic || payload.primary_keyword || "generated-blog"),
  };
};

export const generateAEO = async (payload) => {
  const { providerUsed, result } = await runWithFallback(payload.provider, (service) =>
    service.generate(prompts.aeo(payload))
  );

  const parsed = parseJsonBlock(result) || {};

  return {
    providerUsed,
    aeo_answer_block: parsed.aeo_answer_block || "",
    faq_json: Array.isArray(parsed.faq_json) ? parsed.faq_json : [],
  };
};

export const generateAIO = async (payload) => {
  const { providerUsed, result } = await runWithFallback(payload.provider, (service) =>
    service.generate(prompts.aio(payload))
  );

  const parsed = parseJsonBlock(result) || {};
  const extractedEntities = Array.isArray(parsed.entities)
    ? parsed.entities
    : extractEntities(payload.blog_body || "");

  return {
    providerUsed,
    llm_summary: parsed.llm_summary || "",
    entities: extractedEntities,
  };
};

const aiOrchestrator = {
  generateContent,
  generateSEO,
  generateAEO,
  generateAIO,
};

export default aiOrchestrator;
