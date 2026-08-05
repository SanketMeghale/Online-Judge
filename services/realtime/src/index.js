import http from "http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { getOnlineCount, getRoomUsers, joinRoom, leaveRoom } from "./roomManager.js";

const PORT = process.env.PORT || 4001;
const app = express();

app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

// Initialize Socket.IO Server with CORS enabled for frontend clients
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const clients = new Set();

// Socket.IO Connection Event Handler
io.on("connection", (socket) => {
  console.log(`[Socket.IO Realtime] Client connected: ${socket.id}`);

  // 1. Join room (e.g., submission room or contest room)
  socket.on("join:room", ({ roomId, user }) => {
    if (roomId) {
      socket.join(roomId);
      joinRoom(socket.id, roomId, user);
      console.log(`[Socket.IO Realtime] Socket ${socket.id} joined room '${roomId}'`);
    }
  });

  // 2. Leave room
  socket.on("leave:room", ({ roomId }) => {
    if (roomId) {
      socket.leave(roomId);
      leaveRoom(socket.id);
      console.log(`[Socket.IO Realtime] Socket ${socket.id} left room '${roomId}'`);
    }
  });

  // 3. Handle disconnection
  socket.on("disconnect", () => {
    console.log(`[Socket.IO Realtime] Client disconnected: ${socket.id}`);
    leaveRoom(socket.id);
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "@online-judge/realtime",
    activeSockets: io.sockets.sockets.size,
    activeClients: clients.size,
    onlineUsers: getOnlineCount(),
    timestamp: new Date().toISOString()
  });
});

// SSE endpoint for legacy/fallback stream
app.get("/api/realtime/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const client = { id: Date.now(), res };
  clients.add(client);

  res.write(`data: ${JSON.stringify({ type: "connected", clientId: client.id })}\n\n`);

  req.on("close", () => {
    clients.delete(client);
    leaveRoom(client.id);
  });
});

// Broadcast endpoint called by API server & Judge Workers upon submission completion
app.post("/api/realtime/broadcast", (req, res) => {
  const { event, payload } = req.body ?? {};

  if (!event && !payload) {
    res.status(400).json({ error: "Event or payload required." });
    return;
  }

  const targetEvent = event || "submission:update";

  // Normalize standard submission payload according to specifications:
  // submissionId, status, verdict, runtime, memory
  const updatePayload = {
    submissionId: payload?.submissionId || payload?.id || payload?._id,
    status: payload?.status || (payload?.verdict === "AC" ? "ACCEPTED" : payload?.statusText || payload?.verdict || "COMPLETED"),
    verdict: payload?.verdict || "AC",
    runtime: payload?.runtime || (typeof payload?.runtimeMs === "number" ? `${payload.runtimeMs} ms` : "-"),
    memory: payload?.memory || (typeof payload?.memoryMb === "number" ? `${payload.memoryMb} MB` : "-"),
    ...payload
  };

  // 1. Emit Socket.IO 'submission:update' event
  io.emit("submission:update", updatePayload);

  // If a custom event name was provided, also emit under that specific name
  if (targetEvent !== "submission:update") {
    io.emit(targetEvent, updatePayload);
  }

  // 2. Also send to SSE clients
  const message = `data: ${JSON.stringify({ type: targetEvent, payload: updatePayload, timestamp: new Date().toISOString() })}\n\n`;
  let sseCount = 0;
  for (const client of clients) {
    try {
      client.res.write(message);
      sseCount++;
    } catch {}
  }

  console.log(`[Socket.IO Realtime] Emitted 'submission:update' for submissionId: ${updatePayload.submissionId} (Sockets: ${io.sockets.sockets.size})`);

  res.json({
    ok: true,
    event: "submission:update",
    emittedSockets: io.sockets.sockets.size,
    sseDelivered: sseCount,
    payload: updatePayload
  });
});

httpServer.listen(PORT, () => {
  console.log("--------------------------------------------------");
  console.log(`Online Judge Socket.IO Realtime Service running on http://localhost:${PORT}`);
  console.log(`Socket.IO Endpoint: ws://localhost:${PORT}`);
  console.log(`SSE Stream Endpoint: http://localhost:${PORT}/api/realtime/stream`);
  console.log("--------------------------------------------------");
});

export { io, httpServer };
