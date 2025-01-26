const http = require("http");
const WebSocket = require("ws");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

// server setup:
const app = express();
const port = process.env.PORT;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("Server is running");
});
