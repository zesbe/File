import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.ZAI_API_KEY,
  baseURL: process.env.ZAI_BASE_URL
});

async function main() {
  const response = await client.chat.completions.create({
    model: "glm-4.6",
    messages: [
      { role: "user", content: "Hello dari Termux!" }
    ]
  });

  console.log(response.choices[0].message.content);
}

main();
