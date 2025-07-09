// src/hooks/useAgentStream.ts
import { useEffect, useRef, useState } from "react";

export function useAgentStream(path: string) {
  const [events, setEvents] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host     = window.location.hostname;
    const port     = import.meta.env.DEV ? "8000" : window.location.port;
    // Prepend "/api" since your FastAPI routers all use that prefix
    const url = `${protocol}://${host}:${port}/api${path}`;
    const ws  = new WebSocket(url);

    ws.onopen = () => {
      console.log(`useAgentStream() connected to ${url}`);
    };

    ws.onmessage = (ev) => {
      let data: any;
      try { data = JSON.parse(ev.data); }
      catch { data = ev.data; }
      setEvents((prev) => [...prev, data]);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error on", path, err);
    };

    wsRef.current = ws;
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [path]);

  return events;
}
