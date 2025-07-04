import { api } from "./api";

export async function getAgentConnectionStats() {
  const res = await api.get("/agents/stats");
  return res.data;
}

// src/services/agentstream.ts

export class AgentStream {
  private ws?: WebSocket;
  private clientId: string;
  private listeners: Array<(data: unknown) => void> = [];

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  connect() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}/agents/${this.clientId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      // Optionally: send a hello, ping, or initial message
    };

    this.ws.onmessage = (event) => {
      let data: unknown;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }
      this.listeners.forEach((cb) => cb(data));
    };

    this.ws.onerror = (err) => {
      // Optionally handle errors
      console.error("WebSocket error:", err);
    };

    this.ws.onclose = () => {
      // Optionally: auto-reconnect logic
    };
  }

  onMessage(cb: (data: unknown) => void) {
    this.listeners.push(cb);
  }

  send(data: object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }
}
