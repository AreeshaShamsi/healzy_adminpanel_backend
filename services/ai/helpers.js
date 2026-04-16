export const parseJsonBlock = (text = "") => {
  if (typeof text !== "string") return null;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[1] || match[0]);
    } catch {
      return null;
    }
  }
};

export const extractEntities = (text = "") => {
  const matches = text.match(/\b[A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*\b/g) || [];
  const deduped = [...new Set(matches.map((v) => v.trim()))];
  return deduped.slice(0, 20);
};
