// server.js — MiniMax Web Backend
// Jalankan: node server.js

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());

// ---- STORAGE UNTUK UPLOAD GAMBAR ----
const upload = multer({
  dest: "uploads/",
});

// Buat folder uploads jika belum ada
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ---- CLIENT MINIMAX (OPENAI COMPATIBLE) ----
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.minimax.io/v1",
});

// ---- ENDPOINT UPLOAD ----
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Tidak ada file yang diupload" });
  }

  const localUrl = `/uploads/${req.file.filename}`;
  return res.json({ url: localUrl });
});

// Serve folder upload agar gambar bisa dilihat
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ---- ENDPOINT CHAT ----
app.post("/api/chat", async (req, res) => {
  const { message, imageUrl } = req.body;

  try {
    const response = await client.chat.completions.create({
      model: "MiniMax-M2",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content:
            imageUrl
              ? `User message: ${message}\nUser uploaded image: ${imageUrl}`
              : message
        },
      ],
      extra_body: { reasoning_split: true },
    });

    const reply = response.choices[0].message.content;
    return res.json({ reply });

  } catch (err) {
    console.error("MiniMax API error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

// ---- JALANKAN SERVER ----
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server berjalan di http://localhost:${PORT}`)
);
