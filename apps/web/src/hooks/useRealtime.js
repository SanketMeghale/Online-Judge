import { useEffect, useState } from "react";

const REALTIME_STREAM_URL = "http://localhost:4001/api/realtime/stream";

export function useRealtime(onEvent) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    let eventSource;

    try {
      eventSource = new EventSource(REALTIME_STREAM_URL);

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setLastEvent(data);
          if (onEvent) {
            onEvent(data);
          }
        } catch {}
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [onEvent]);

  return { isConnected, lastEvent };
}
