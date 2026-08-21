import "dotenv/config";
import crypto from "crypto";
import http from "http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getOnlineCount, getRoomUsers, joinRoom, leaveRoom } from "./roomManager.js";

const PORT = process.env.PORT || 4001;
if (process.env.NODE_ENV === "production") {
  const missing = ["REALTIME_JWT_SECRET", "REALTIME_INTERNAL_SECRET", "CLIENT_ORIGIN"].filter((key) => !process.env[key]);
  if (missing.length > 0) throw new Error(`Missing realtime configuration: ${missing.join(", ")}`);
  if (process.env.REALTIME_JWT_SECRET.trim().length < 32) throw new Error("REALTIME_JWT_SECRET must contain at least 32 characters.");
  if (process.env.REALTIME_INTERNAL_SECRET.trim().length < 32) throw new Error("REALTIME_INTERNAL_SECRET must contain at least 32 characters.");
  if (!process.env.CLIENT_ORIGIN.startsWith("https://") && process.env.ALLOW_INSECURE_ORIGIN !== "true") {
    throw new Error("CLIENT_ORIGIN must use https:// in production.");
  }
}
const app = express();
app.disable("x-powered-by");
const configuredOrigins = String(process.env.CLIENT_ORIGIN || "").split(",").map((value) => value.trim()).filter(Boolean);
const allowedOrigins = process.env.NODE_ENV === "production"
  ? configuredOrigins
  : [...configuredOrigins, "http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:8080", "http://127.0.0.1:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "64kb" }));

const httpServer = http.createServer(app);

// Initialize Socket.IO Server with CORS enabled for frontend clients
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

function verifyClientToken(token) {
  const secret = (process.env.REALTIME_JWT_SECRET || (process.env.NODE_ENV !== "production" ? process.env.JWT_SECRET : ""))?.trim();
  if (!secret || secret.length < 32 || !token) return null;
  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
    return payload?.purpose === "realtime" ? payload : null;
  } catch {
    return null;
  }
}

function secretsMatch(expected, supplied) {
  const expectedBuffer = Buffer.from(expected || "");
  const suppliedBuffer = Buffer.from(supplied || "");
  return expectedBuffer.length === suppliedBuffer.length && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
}

io.use((socket, next) => {
  const authHeader = socket.handshake.headers.authorization || "";
  const token = socket.handshake.auth?.token || (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "");
  const payload = verifyClientToken(token);
  if (!payload?.userId) return next(new Error("Authentication required."));
  socket.data.userId = String(payload.userId);
  socket.join(`user:${socket.data.userId}`);
  next();
});

// Socket.IO Connection Event Handler
io.on("connection", (socket) => {
  console.log(`[Socket.IO Realtime] Client connected: ${socket.id}`);

  // 1. Join room (e.g., submission room or contest room)
  socket.on("join:room", ({ roomId, user }) => {
    const safeRoomId = String(roomId || "");
    const canJoin = safeRoomId.startsWith("contest:") || safeRoomId === `user:${socket.data.userId}`;
    if (canJoin) {
      socket.join(safeRoomId);
      joinRoom(socket.id, safeRoomId, { ...(user || {}), id: socket.data.userId });
      console.log(`[Socket.IO Realtime] Socket ${socket.id} joined room '${safeRoomId}'`);
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
    onlineUsers: getOnlineCount(),
    timestamp: new Date().toISOString()
  });
});

// Legacy unauthenticated SSE was removed in favor of authenticated Socket.IO.
app.get("/api/realtime/stream", (_req, res) => {
  res.status(410).json({ error: "SSE streaming has been retired. Use authenticated Socket.IO." });
});

// Broadcast endpoint called by API server & Judge Workers upon submission completion
app.post("/api/realtime/broadcast", (req, res) => {
  const configuredSecret = process.env.REALTIME_INTERNAL_SECRET?.trim();
  const suppliedSecret = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!configuredSecret || !secretsMatch(configuredSecret, suppliedSecret)) {
    return res.status(401).json({ error: "Internal service authentication required." });
  }

  const { event, payload } = req.body ?? {};

  if (!event || !payload || typeof payload !== "object") {
    res.status(400).json({ error: "A valid event and payload are required." });
    return;
  }

  const targetEvent = event;
  if (!new Set(["submission:update", "contest:update"]).has(targetEvent)) {
    return res.status(400).json({ error: "Unsupported realtime event." });
  }

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
  const targetRoom = updatePayload.userId ? `user:${updatePayload.userId}` : null;
  if (!targetRoom) return res.status(400).json({ error: "A target userId is required." });
  io.to(targetRoom).emit("submission:update", updatePayload);

  // If a custom event name was provided, also emit under that specific name
  if (targetEvent !== "submission:update") {
    io.to(targetRoom).emit(targetEvent, updatePayload);
  }

  console.log(`[Socket.IO Realtime] Emitted '${targetEvent}' to ${targetRoom} for submissionId: ${updatePayload.submissionId}`);

  res.json({
    ok: true,
    event: "submission:update",
    targetRoom,
    payload: updatePayload
  });
});

httpServer.listen(PORT, () => {
  console.log("--------------------------------------------------");
  console.log(`Online Judge Socket.IO Realtime Service running on http://localhost:${PORT}`);
  console.log(`Socket.IO Endpoint: ws://localhost:${PORT}`);
  console.log("--------------------------------------------------");
});

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[Socket.IO Realtime] Shutting down: ${signal}`);
  io.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

export { io, httpServer };
