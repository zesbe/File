// chat.mjs
import OpenAI from "openai";

const apiKey = process.env.ZAI_API_KEY;

if (!apiKey) {
  console.error("ERROR: ZAI_API_KEY belum diset.");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.z.ai/api/paas/v4/"
});

import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log("Chat Z.AI Termux — mulai bicara (CTRL+C untuk keluar)");

  while (true) {
    const user = await ask("\nKamu: ");

    try {
      const completion = await client.chat.completions.create({
        model: "glm-4.6",
        messages: [
          { role: "user", content: user }
        ],
        stream: false
      });

      const reply = completion.choices?.[0]?.message?.content || "(no content)";
      console.log("AI:", reply);

    } catch (err) {
      console.error("ERROR:", err.message);
    }
  }
}

main();
