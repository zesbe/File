// chat_stream_multi.mjs
// SSE streaming client for Z.AI with multi-turn memory.
// Usage: set ZAI_API_KEY env, npm install axios, then `node chat_stream_multi.mjs`

import axios from "axios";
import readline from "readline";

const API_KEY = process.env.ZAI_API_KEY;
const ENDPOINT = "https://api.z.ai/api/paas/v4/chat/completions";
const MODEL = "glm-4.6";

if (!API_KEY) {
  console.error("ERROR: Set ZAI_API_KEY environment variable first.");
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function question(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

// messages store for multi-turn (system can be added if you want)
const messages = [];

async function streamChat(userText) {
  // push user message into history
  messages.push({ role: "user", content: userText });

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
        messages: messages,
        stream: true
      },
      responseType: "stream",
      timeout: 0
    });

    const stream = resp.data;
    let assistantAcc = ""; // accumulate assistant text for this turn

    process.stdout.write("AI: ");

    // buffer to accumulate partial lines
    let leftover = "";

    stream.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      // Split by newline because SSE sends "data: ..." per-line
      const combined = leftover + text;
      const lines = combined.split(/\r?\n/);
      // keep last partial line in leftover
      leftover = lines.pop();

      for (let rawLine of lines) {
        rawLine = rawLine.trim();
        if (rawLine === "") continue;

        // If SSE prefix present, remove it
        if (rawLine.startsWith("data: ")) rawLine = rawLine.slice(6);

        // sentinel for done
        if (rawLine === "[DONE]") {
          // stream finished by server
          stream.destroy(); // will trigger 'end'
          return;
        }

        // Try parse JSON; if parse fails, skip
        let obj;
        try {
          obj = JSON.parse(rawLine);
        } catch (e) {
          // not a JSON line we care about
          continue;
        }

        // JSON structure example:
        // { "choices":[{"index":0,"delta":{"role":"assistant","content":"...","reasoning_content":"..."}}] }
        if (!obj.choices || !Array.isArray(obj.choices)) continue;

        for (const ch of obj.choices) {
          const delta = ch.delta || ch; // some providers wrap differently
          if (!delta) continue;

          // try common fields that may contain incremental token text
          // order: content, reasoning_content, text, message?
          let piece = null;
          if (delta.content && typeof delta.content === "string") piece = delta.content;
          else if (delta.reasoning_content && typeof delta.reasoning_content === "string") piece = delta.reasoning_content;
          else if (delta.text && typeof delta.text === "string") piece = delta.text;
          else if (delta.message && delta.message.content && typeof delta.message.content === "string") piece = delta.message.content;

          if (piece !== null) {
            // unescape simple sequences commonly present in JSON-encoded chunks
            const out = piece.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
            process.stdout.write(out);
            assistantAcc += out;
          }
        } // end choices loop
      } // end for each line
    }); // end on data

    stream.on("end", () => {
      // server closed stream
      process.stdout.write("\n\n[stream ended]\n");
      // push assistant message to history
      messages.push({ role: "assistant", content: assistantAcc || "(no content)" });
    });

    stream.on("close", () => {
      // safety: in some Node versions 'close' fires, ensure newline
      process.stdout.write("\n");
    });

    stream.on("error", (err) => {
      console.error("\n[stream error]", err && err.message ? err.message : String(err));
    });

    // wait until stream ends (we return a Promise that resolves when stream closed)
    await new Promise((resolve) => {
      stream.on("end", resolve);
      stream.on("close", resolve);
      stream.on("error", resolve);
    });

  } catch (err) {
    console.error("Request failed:", err && err.toString ? err.toString() : String(err));
  }
}

async function main() {
  console.log("Streaming multi-turn client. Ctrl+C to exit.");
  while (true) {
    const prompt = await question("\nKamu: ");
    if (!prompt) continue;
    await streamChat(prompt);
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
