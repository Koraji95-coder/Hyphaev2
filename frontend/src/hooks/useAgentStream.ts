// src/hooks/useAgentStream.ts
import { useEffect, useRef, useState } from "react";

export function useAgentStream(path: string) {
  const [events, setEvents] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef       = useRef<WebSocket | null>(null);
  const isMounted   = useRef(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    isMounted.current = true;

    let retryCount     = 0;
    const maxRetries  = 5;
    const initialDelay = 1000;
    const maxDelay     = 5000;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host     = window.location.host;
    const url      = `${protocol}://${host}/api${path}`;

    const scheduleReconnect = () => {
      if (!isMounted.current || retryCount >= maxRetries || wsRef.current) return;
      const delay = Math.min(initialDelay * 2 ** retryCount, maxDelay);
      reconnectTimer = setTimeout(() => {
        retryCount += 1;
        console.log(`Reconnecting to ${url} (attempt ${retryCount})`);
        connect();
      }, delay);
    };

    const setup = (ws: WebSocket) => {
      ws.onopen = () => {
        if (!isMounted.current) return;
        console.log("WS open:", url);
        setIsConnected(true);
        setError(null);
        retryCount = 0;
      };
      ws.onmessage = (ev) => {
        if (!isMounted.current || ws.readyState !== WebSocket.OPEN) return;
        try {
          const data = JSON.parse(ev.data);
          setEvents((prev) => [...prev, data]);
        } catch {
          console.error("Invalid WS message:", ev.data);
        }
      };
      ws.onerror = (err) => {
        if (!isMounted.current) return;
        console.error("WS error:", err);
        setError("WebSocket error");
      };
      ws.onclose = (e) => {
        if (!isMounted.current) return;
        console.log("WS closed:", e.code);
        setIsConnected(false);
        wsRef.current = null;
        if (e.code !== 1000) scheduleReconnect();
      };
    };

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setup(ws);
    };

    connect();

    return () => {
      isMounted.current = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);

      // only call close() if we're already OPEN, otherwise skip
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "unmount");
      }
      wsRef.current = null;
    };
  }, [path]);

  return { events, isConnected, error };
}
