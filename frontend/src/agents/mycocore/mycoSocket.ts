// src/agents/mycocore/websocketClient.ts

import MycoCoreEventBus from "./eventBus";
import type { MycoCoreEvent } from "./eventBus";

let socket: WebSocket | null = null;
const listeners: ((evt: MycoCoreEvent) => void)[] = [];


export function initWebSocket() {
  const token = localStorage.getItem("auth_access_token");
  if (!token) {
    console.warn("[WebSocket] No token available, skipping connection.");
    return;
  }
  const wsUrl = `ws://localhost:8000/api/ws/logs?token=${token}`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("[WebSocket] Connected");
  };

  socket.onmessage = (event) => {
  try {
    const raw = JSON.parse(event.data);
    const data: MycoCoreEvent = {
      ...raw,
      timestamp: raw.timestamp ?? new Date().toISOString(),
    };
    MycoCoreEventBus.emit(data);
    listeners.forEach((cb) => cb(data));
  } catch (e) {
    console.warn("[WebSocket] Error parsing message", e);
  }
};

  socket.onclose = () => {
    console.log("[WebSocket] Disconnected");
    socket = null;
  };

  socket.onerror = (err) => {
    console.error("[WebSocket] Error:", err);
  };
}

export function closeWebSocket() {
  if (socket) socket.close();
  socket = null;
}


export function subscribeToSocket(callback: (evt: MycoCoreEvent) => void) {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index !== -1) listeners.splice(index, 1);
  };
}