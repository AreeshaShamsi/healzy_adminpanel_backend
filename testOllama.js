import ai from "./services/ai/aiOrchestrator.js";

const run = async () => {
  try {
    const res = await ai.generate({
      prompt: "Say hello in 10 different ways",
      provider: "ollama",
    });

    console.log("OLLAMA OUTPUT:\n", res);
  } catch (err) {
    console.error("FAILED:", err.message);
  }
};

run();