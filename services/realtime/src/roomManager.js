const rooms = new Map();
const activeUsers = new Map();

export function joinRoom(socketId, roomId, userDetails) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }

  const room = rooms.get(roomId);
  const user = { socketId, roomId, ...userDetails, joinedAt: new Date().toISOString() };
  room.set(socketId, user);
  activeUsers.set(socketId, user);

  return Array.from(room.values());
}

export function leaveRoom(socketId) {
  const user = activeUsers.get(socketId);
  if (!user) return null;

  activeUsers.delete(socketId);
  const room = rooms.get(user.roomId);
  if (room) {
    room.delete(socketId);
    if (room.size === 0) {
      rooms.delete(user.roomId);
    }
  }

  return user;
}

export function getRoomUsers(roomId) {
  const room = rooms.get(roomId);
  return room ? Array.from(room.values()) : [];
}

export function getOnlineCount() {
  return activeUsers.size;
}
