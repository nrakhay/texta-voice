const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { randomUUID } = require("crypto");

dotenv.config();

// server setup:
const app = express();
const port = process.env.PORT;

app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const handleAudioEvent = (ws, event) => {
  try {
    const { data: b64Audio } = event;
    const filename = "saved-audios/" + randomUUID().toString() + ".wav";
    fs.writeFileSync(filename, b64Audio, "base64");
    ws.send(`Audio file saved as ${filename}`);
  } catch (err) {
    console.error("Error saving audio file", err);
    ws.send("Error saving audio file");
  }
};

const handleConnection = (ws) => {
  console.log("New client connected");
  ws.send("Welcome to the WebSocket server!");

  ws.on("message", (message) => handleMessage(ws, message));
  ws.on("close", handleDisconnection);
};

const handleDisconnection = () => {
  console.log("Client disconnected");
};

const handleMessage = (ws, message) => {
  try {
    const event = JSON.parse(message);
    const handler = eventHandlers[event.event] || eventHandlers.default;
    handler(ws, event);
  } catch (err) {
    console.error("Error parsing JSON message", err);
    ws.send("Invalid message format");
  }
};

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/realtime/session", async (req, res) => {
  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "verse",
    }),
  });
  const data = await r.json();

  res.send(data);
});

wss.on("connection", handleConnection);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// mapping of event to handler function for better organization
const eventHandlers = {
  audio: handleAudioEvent,
  default: (ws, event) => {
    console.warn(`Unknown event: ${event.event}`);
    ws.send(`Unknown event: ${event.event}`);
  },
};
