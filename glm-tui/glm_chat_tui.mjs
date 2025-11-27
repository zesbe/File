import blessed from "blessed";
import OpenAI from "openai";

// Cek env
if (!process.env.ZAI_API_KEY || !process.env.ZAI_BASE_URL) {
  console.error("Error: set ZAI_API_KEY and ZAI_BASE_URL first.");
  console.error('export ZAI_API_KEY="..."');
  console.error('export ZAI_BASE_URL="https://api.z.ai/api/paas/v4/"');
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.ZAI_API_KEY,
  baseURL: process.env.ZAI_BASE_URL
});

// UI setup
const screen = blessed.screen({
  smartCSR: true,
  title: "GLM Chat TUI"
});

const chatBox = blessed.box({
  top: 0,
  left: 0,
  width: "100%",
  height: "90%",
  tags: true,
  scrollable: true,
  alwaysScroll: true,
  keys: true,
  mouse: true,
  vi: true,
  scrollbar: {
    ch: " ",
    inverse: true
  },
  border: { type: "line" },
  style: { fg: "white", border: { fg: "#00afff" } },
  label: " GLM Chat "
});

const input = blessed.textbox({
  bottom: 0,
  left: 0,
  height: 3,
  width: "100%",
  inputOnFocus: true,
  padding: { left: 1 },
  keys: true,
  mouse: true,
  border: { type: "line" },
  style: { fg: "white", border: { fg: "#00afff" } },
  label: " Type message (Enter to send, Ctrl+C to quit) "
});

screen.append(chatBox);
screen.append(input);
input.focus();

let messages = [{ role: "system", content: "You are a helpful assistant." }];

function appendMsg(who, text) {
  const time = new Date().toLocaleTimeString();
  const tag = who === "user" ? "{bold}{green-fg}You{/green-fg}{/bold}" : "{bold}{cyan-fg}GLM{/cyan-fg}{/bold}";
  chatBox.pushLine(`${tag} {grey-fg}[${time}]{/grey-fg}`);
  // preserve colors/tags
  const wrapped = text.split("\n").map(l => l || " ").join("\n");
  chatBox.pushLine(wrapped);
  chatBox.pushLine("");
  chatBox.setScrollPerc(100);
  screen.render();
}

async function sendToGLM(prompt) {
  try {
    const resp = await client.chat.completions.create({
      model: "glm-4.6",
      messages,
      max_tokens: 800
    });
    const reply = resp.choices?.[0]?.message?.content ?? "(no reply)";
    messages.push({ role: "assistant", content: reply });
    appendMsg("assistant", reply);
  } catch (err) {
    appendMsg("assistant", "Error: " + (err.message || JSON.stringify(err)));
  }
}

// handle Enter (Android Termux FIX)
input.key(["enter", "C-j", "C-m"], () => {
  const text = (input.getValue() || "").trim();
  input.clearValue();
  screen.render();

  if (!text) return;

  messages.push({ role: "user", content: text });
  appendMsg("user", text);

  // kirim ke GLM
  sendToGLM(text);
});

// allow quitting: Ctrl+C or q
screen.key(["C-c", "q"], () => {
  chatBox.pushLine("");
  chatBox.pushLine("{grey-fg}Bye!{/grey-fg}");
  screen.render();
  setTimeout(() => process.exit(0), 200);
});

// support scrolling
screen.key(["up", "k"], () => { chatBox.scroll(-1); screen.render(); });
screen.key(["down", "j"], () => { chatBox.scroll(1); screen.render(); });

// initial message
appendMsg("assistant", "Halo! Chat GLM siap. Ketik pesan di bawah lalu tekan Enter.");

// render
screen.render();
