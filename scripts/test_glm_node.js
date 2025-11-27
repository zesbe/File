import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.ZAI_API_KEY,
  baseURL: process.env.ZAI_BASE_URL
});

async function main() {
  const res = await client.chat.completions.create({
    model: "glm-4.6",
    messages: [
      { role: "user", content: "Halo GLM dari Node.js Termux!" }
    ]
  });

  console.log(res.choices[0].message.content);
}

main();
