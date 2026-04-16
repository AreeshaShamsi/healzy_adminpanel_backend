const buildClaudeRequest = (prompt) => ({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,
  temperature: 0.7,
  messages: [{ role: "user", content: prompt }],
});

const generateWithClaude = async (prompt) => {
  if (!process.env.CLAUDE_API_KEY) {
    throw new Error("CLAUDE_API_KEY is missing");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(buildClaudeRequest(prompt)),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const textBlocks = Array.isArray(data?.content) ? data.content.filter((c) => c.type === "text") : [];
  return textBlocks.map((c) => c.text).join("\n");
};

export default {
  name: "claude",
  generate: generateWithClaude,
};
