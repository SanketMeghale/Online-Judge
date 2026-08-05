const REALTIME_SERVICE_URL = process.env.REALTIME_SERVICE_URL || "http://localhost:4001";

export async function broadcastEvent(event, payload) {
  try {
    const res = await fetch(`${REALTIME_SERVICE_URL}/api/realtime/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload })
    });
    return await res.json();
  } catch (err) {
    console.warn(`[RealtimePublisher] Broadcast to ${REALTIME_SERVICE_URL} skipped: ${err.message}`);
    return null;
  }
}
