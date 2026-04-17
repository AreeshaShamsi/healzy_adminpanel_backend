import "dotenv/config";

const listModels = async () => {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    {
      headers: {
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
    }
  );

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
};

listModels();