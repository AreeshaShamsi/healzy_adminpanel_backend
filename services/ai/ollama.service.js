const generateWithOllama = async (prompt) => {
  const baseUrl = process.env.OLLAMA_URL || "http://localhost:11434";

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || "llama3.1",
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data?.response || "";
};

export default {
  name: "ollama",
  generate: generateWithOllama,
};
