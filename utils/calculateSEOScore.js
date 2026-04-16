import { countWords, keywordDensity, stripMarkdown } from "./text.js";

export const calculateSEOScore = (blog = {}) => {
  const failedChecks = [];
  let score = 100;

  const content = blog.content_mdx || "";
  const primaryKeyword = (blog.primary_keyword || "").trim();
  const plainText = stripMarkdown(content).toLowerCase();

  const titleLen = (blog.meta_title || "").trim().length;
  if (titleLen < 50 || titleLen > 60) {
    score -= 10;
    failedChecks.push("Meta title must be 50-60 characters");
  }

  const descLen = (blog.meta_description || "").trim().length;
  if (descLen < 140 || descLen > 155) {
    score -= 10;
    failedChecks.push("Meta description must be 140-155 characters");
  }

  if (primaryKeyword && !plainText.includes(primaryKeyword.toLowerCase())) {
    score -= 10;
    failedChecks.push("Primary keyword missing in content");
  }

  const density = keywordDensity(content, primaryKeyword);
  if (primaryKeyword && (density < 1 || density > 2)) {
    score -= 10;
    failedChecks.push("Keyword density should be between 1%-2%");
  }

  if (countWords(content) < 1200) {
    score -= 15;
    failedChecks.push("Content should be at least 1200 words");
  }

  if (!blog.cover_image_url || !blog.cover_image_alt) {
    score -= 10;
    failedChecks.push("Cover image URL and alt text are required");
  }

  const aeoWords = countWords(blog.aeo_answer_block || "");
  if (aeoWords < 40 || aeoWords > 60) {
    score -= 10;
    failedChecks.push("AEO answer block must be 40-60 words");
  }

  if (!Array.isArray(blog.faq_json) || blog.faq_json.length < 4) {
    score -= 10;
    failedChecks.push("FAQ must contain at least 4 items");
  }

  const summaryLen = (blog.llm_summary || "").length;
  if (!summaryLen || summaryLen > 300) {
    score -= 15;
    failedChecks.push("LLM summary must be <= 300 characters");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    failedChecks,
  };
};

export default calculateSEOScore;
