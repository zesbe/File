// server-socket.js
// Usage:
// 1) put this file in your project folder (e.g. ~/minimax-node)
// 2) npm install express multer openai dotenv socket.io
// 3) ensure .env has OPENAI_API_KEY and (optionally) OPENAI_BASE_URL
// 4) node server-socket.js

import express from "express";
import http from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import OpenAI from "openai";
import { Server as IOServer } from "socket.io";

dotenv.config();

const app = express();
app.use(express.json());

// ----- uploads storage -----
const upload = multer({ dest: "uploads/" });
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// ----- static UI (public/) -----
app.use(express.static(path.join(process.cwd(), "public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ----- root route fallback -----
app.get("/", (req, res) => {
  const index = path.join(process.cwd(), "public", "index.html");
  if (fs.existsSync(index)) return res.sendFile(index);
  return res.send("<h3>MiniMax Server</h3><p>Place UI in public/</p>");
});

// ----- OpenAI / MiniMax client -----
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.minimax.io/v1",
});

// ----- upload endpoint -----
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// ----- chat endpoint (HTTP fallback) -----
app.post("/api/chat", async (req, res) => {
  const { message, imageUrl } = req.body || {};
  try {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: imageUrl
          ? `User message: ${message}\nUser image: ${imageUrl}`
          : message || "",
      },
    ];

    const response = await client.chat.completions.create({
      model: "MiniMax-M2",
      messages,
      extra_body: { reasoning_split: true },
    });

    const raw = response.choices?.[0]?.message?.content ?? "";
    const clean = (raw || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    res.json({ reply: clean });
  } catch (err) {
    console.error("Chat API error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ----- create HTTP server + socket.io -----
const httpServer = http.createServer(app);
const io = new IOServer(httpServer, {
  cors: {
    origin: "*", // in production, restrict to your UI origin
    methods: ["GET", "POST"],
  },
});

// helper to strip <think>
function stripThink(s) {
  if (!s) return "";
  return s.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

// socket handlers
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // receive message from client
  socket.on("user_message", async (data) => {
    // data = { message, imageUrl }
    try {
      socket.emit("assistant_typing", {});

      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: data?.imageUrl
            ? `User message: ${data.message}\nUser image: ${data.imageUrl}`
            : data?.message || "",
        },
      ];

      const result = await client.chat.completions.create({
        model: "MiniMax-M2",
        messages,
        extra_body: { reasoning_split: true },
      });

      const raw = result.choices?.[0]?.message?.content ?? "";
      const clean = stripThink(raw);

      // emit assistant response
      socket.emit("assistant_message", { reply: clean });
    } catch (err) {
      console.error("Socket chat error:", err);
      socket.emit("assistant_error", { error: String(err) });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", socket.id, reason);
  });
});

// ----- start server -----
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log("Socket.IO ready");
});
