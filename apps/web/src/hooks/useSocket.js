import { useEffect, useState } from "react";
import { getSocket, subscribeToSubmissionUpdates } from "../services/socketService.js";

/**
 * Custom React hook for connecting to Socket.IO and subscribing to 'submission:update' events
 * 
 * @param {Function} [onUpdateCallback] Optional callback triggered whenever a submission:update event fires
 * @returns {{ isConnected: boolean, lastUpdate: Object|null }}
 */
export function useSocket(onUpdateCallback) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const socket = getSocket();

    function handleConnect() {
      setIsConnected(true);
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    const unsubscribe = subscribeToSubmissionUpdates((payload) => {
      setLastUpdate(payload);
      if (typeof onUpdateCallback === "function") {
        onUpdateCallback(payload);
      }
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      unsubscribe();
    };
  }, [onUpdateCallback]);

  return { isConnected, lastUpdate };
}

export default useSocket;
