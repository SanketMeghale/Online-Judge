import { io } from "socket.io-client";

const REALTIME_SOCKET_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_REALTIME_URL) || "http://localhost:4001";

let socketInstance = null;

async function connectAuthenticatedSocket(socket) {
  try {
    const response = await fetch("/api/auth/realtime-token", { credentials: "include" });
    const data = await response.json();
    if (!response.ok || !data.token) throw new Error(data.error || "Realtime authentication failed.");
    socket.auth = { token: data.token };
    socket.connect();
  } catch (error) {
    console.warn(`[Socket.IO Client] ${error.message}`);
  }
}

/**
 * Returns or initializes the Socket.IO client instance
 * @returns {import("socket.io-client").Socket}
 */
export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(REALTIME_SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000
    });

    socketInstance.on("connect", () => {
      console.log(`[Socket.IO Client] Connected to server '${REALTIME_SOCKET_URL}' with socket ID: ${socketInstance.id}`);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn(`[Socket.IO Client] Connection warning: ${err.message}`);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log(`[Socket.IO Client] Disconnected from server: ${reason}`);
    });

    connectAuthenticatedSocket(socketInstance);
  }

  return socketInstance;
}

/**
 * Subscribes to live 'submission:update' Socket.IO events emitted by Judge Worker
 * 
 * Payload structure:
 * {
 *   submissionId: string,
 *   status: string,
 *   verdict: string,
 *   runtime: string,
 *   memory: string
 * }
 * 
 * @param {Function} callback
 * @returns {Function} Unsubscribe cleanup handler
 */
export function subscribeToSubmissionUpdates(callback) {
  const socket = getSocket();

  function handleSubmissionUpdate(payload) {
    console.log("[Socket.IO Client] Received 'submission:update':", payload);
    if (typeof callback === "function") {
      callback(payload);
    }
  }

  socket.on("submission:update", handleSubmissionUpdate);

  return () => {
    socket.off("submission:update", handleSubmissionUpdate);
  };
}

/**
 * Joins a specific Socket.IO room (e.g., submission room or contest room)
 * @param {string} roomId
 * @param {Object} [user]
 */
export function joinSocketRoom(roomId, user) {
  const socket = getSocket();
  socket.emit("join:room", { roomId, user });
}

/**
 * Leaves a specific Socket.IO room
 * @param {string} roomId
 */
export function leaveSocketRoom(roomId) {
  const socket = getSocket();
  socket.emit("leave:room", { roomId });
}
