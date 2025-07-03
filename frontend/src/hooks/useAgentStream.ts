// src/hooks/useAgentStream.ts
import { useEffect, useRef, useState } from "react";

export function useAgentStream(path: string) {
  const [events, setEvents] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${protocol}://${window.location.host}${path}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      let data: any;
      try { data = JSON.parse(ev.data); }
      catch { data = ev.data; }
      setEvents((prev) => [...prev, data]);
    };
    ws.onerror = (err) => {
      console.error("WebSocket error on", path, err);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [path]);

  return events;
}
