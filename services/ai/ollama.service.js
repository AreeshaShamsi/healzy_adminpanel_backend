import fetch from "node-fetch";

const generate = async (prompt) => {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error("Ollama request failed");
  }

  const data = await res.json();

  if (!data?.response) {
    throw new Error("Empty Ollama response");
  }

  return data.response;
};

export default { generate };