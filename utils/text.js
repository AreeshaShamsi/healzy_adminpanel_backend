export const stripMarkdown = (text = "") => {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const countWords = (text = "") => {
  const clean = stripMarkdown(text);
  return clean ? clean.split(/\s+/).length : 0;
};

export const keywordDensity = (text = "", keyword = "") => {
  const body = stripMarkdown(text).toLowerCase();
  const key = keyword.trim().toLowerCase();

  if (!body || !key) return 0;

  const matches = body.match(new RegExp(`\\b${key.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "g")) || [];
  const words = countWords(body) || 1;

  return (matches.length / words) * 100;
};

export const estimateReadingTime = (text = "", wordsPerMinute = 200) => {
  const words = countWords(text);
  return words ? Math.max(1, Math.ceil(words / wordsPerMinute)) : 0;
};
