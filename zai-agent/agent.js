// agent.js (CommonJS)
// server streaming agent untuk Z.AI (streaming chat completions)
// requirements: npm install express socket.io axios

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ZAI_API_KEY = process.env.ZAI_API_KEY || process.env.ZAI_KEY || '';
// Default endpoint, kamu bisa set env ZAI_ENDPOINT jika perlu coding plan endpoint
const ZAI_ENDPOINT = process.env.ZAI_ENDPOINT || 'https://api.z.ai/api/paas/v4/chat/completions';

if (!ZAI_API_KEY) {
  console.error('ERROR: set environment variable ZAI_API_KEY');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname))); // serve ui.html dan file statis dari folder ini
app.use(express.json());

// simple health route
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'ui.html')));

// optional curl POST route (non-stream) for quick tests
app.post('/api/send', async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.text || '';
    const body = {
      model: req.body.model || 'glm-4.6',
      messages: [{ role: 'user', content: prompt }],
      stream: false
    };
    const r = await axios.post(ZAI_ENDPOINT, body, {
      headers: {
        Authorization: 'Bearer ' + ZAI_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    });
    return res.json({ status: 'ok', data: r.data });
  } catch (err) {
    console.error('api/send error', err?.message || err);
    return res.status(500).json({ status: 'error', error: String(err?.message || err) });
  }
});

// SOCKET.IO: handle clients that want streaming
io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  socket.on('prompt', async (payload) => {
    const prompt = payload && payload.prompt ? String(payload.prompt) : '';
    const model = payload && payload.model ? payload.model : 'glm-4.6';
    console.log('-> Received prompt from client:', prompt);

    // create request body (stream true)
    const body = {
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: true
    };

    try {
      const resp = await axios({
        method: 'post',
        url: ZAI_ENDPOINT,
        headers: {
          Authorization: 'Bearer ' + ZAI_API_KEY,
          'Content-Type': 'application/json'
        },
        data: body,
        responseType: 'stream',
        timeout: 120000
      });

      const stream = resp.data;
      let buffer = '';

      // on data: parse lines, emit token pieces
      stream.on('data', (chunk) => {
        try {
          buffer += chunk.toString('utf8');
          const parts = buffer.split(/\r?\n/);
          buffer = parts.pop(); // last partial line remain in buffer

          for (const raw of parts) {
            const line = raw.trim();
            if (!line) continue;
            // some servers prefix "data: "
            const payloadLine = line.startsWith('data:') ? line.replace(/^data:\s*/, '') : line;
            if (!payloadLine) continue;
            if (payloadLine === '[DONE]' || payloadLine === '[]') {
              continue;
            }
            // try parse JSON and extract token
            try {
              const obj = JSON.parse(payloadLine);
              const choice = obj.choices && obj.choices[0];
              const token =
                (choice && choice.delta && (choice.delta.content || choice.delta.text || choice.delta.reasoning_content)) ||
                (choice && choice.message && choice.message.content) ||
                null;
              if (token) {
                // emit token as raw string
                socket.emit('token', String(token));
              }
            } catch (e) {
              // not json -> ignore
            }
          }
        } catch (e) {
          // parsing error: ignore to keep streaming
        }
      });

      stream.on('end', () => {
        // finished streaming; emit done (empty string payload: signal finish)
        socket.emit('done', '');
        console.log('-> Stream ended for prompt. socket:', socket.id);
      });

      stream.on('error', (err) => {
        console.error('-> Stream error:', err && err.message ? err.message : err);
        socket.emit('error', String(err && err.message ? err.message : err));
      });
    } catch (err) {
      console.error('-> Request failed:', err?.response?.status, err?.response?.data || err.message || err);
      socket.emit('error', String(err?.response?.data || err?.message || err));
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('READY → http://localhost:' + PORT);
});
