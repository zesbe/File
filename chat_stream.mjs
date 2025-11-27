// chat_stream.mjs
import axios from "axios";
import readline from "readline";

const API_KEY = process.env.ZAI_API_KEY;
const ENDPOINT = "https://api.z.ai/api/paas/v4/chat/completions";
const MODEL = "glm-4.6";

if (!API_KEY) {
  console.error("ERROR: Set ZAI_API_KEY in environment first.");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((res) => rl.question(prompt, res));
}

async function streamChat(promptText) {
  try {
    const resp = await axios.request({
      method: "post",
      url: ENDPOINT,
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "text/event-stream, application/json"
      },
      data: {
        model: MODEL,
        messages: [{ role: "user", content: promptText }],
        stream: true
      },
      responseType: "stream",
      timeout: 0
    });

    const stream = resp.data;
    let buffer = "";

    // regex for "content":"..."; fairly tolerant
    const reContent = /"content"\s*:\s*"((?:\\.|[^"\\])*)"/g;

    process.stdout.write("AI: ");

    stream.on("data", (chunk) => {
      const s = chunk.toString("utf8");
      // handle SSE prefix "data: " by removing leading "data: " lines
      const cleaned = s.split("\n").map(line => line.startsWith("data: ") ? line.slice(6) : line).join("\n");
      buffer += cleaned;

      // try to extract any complete content="..." occurrences
      let match;
      let lastEnd = 0;
      while ((match = reContent.exec(buffer)) !== null) {
        const raw = match[1];
        // unescape simple sequences
        const out = raw.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
        process.stdout.write(out);
        lastEnd = match.index + match[0].length;
      }

      // keep remainder after last full match
      if (lastEnd > 0) {
        buffer = buffer.slice(lastEnd);
        reContent.lastIndex = 0; // reset regex state
      }

      // safety: limit buffer growth
      if (buffer.length > 20000) buffer = buffer.slice(-8000);
    });

    stream.on("end", () => {
      process.stdout.write("\n\n[stream ended]\n");
    });

    stream.on("error", (err) => {
      console.error("\n[stream error]", err.message || err.toString());
    });

  } catch (err) {
    console.error("Request failed:", err.toString());
  }
}

async function main() {
  console.log("Streaming client (CTRL+C to exit).");
  while (true) {
    const prompt = await question("\nKamu: ");
    if (!prompt) continue;
    await streamChat(prompt);
  }
}

main().catch(e => console.error(e));
