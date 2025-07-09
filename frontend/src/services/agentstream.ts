// src/services/agentstream.ts
export class AgentStream {
  private ws: WebSocket | null = null;
  private clientId: string;
  private listeners: Array<(data: unknown) => void> = [];

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  connect() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    // Make sure to hit your FastAPI endpoint, which is mounted at /api
    const url = `${protocol}://${window.location.hostname}:${
      import.meta.env.DEV ? "8000" : window.location.port || ""
    }/api/agents/${this.clientId}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("AgentStream connected →", url);
    };

    this.ws.onmessage = (event) => {
      let payload: unknown;
      try { payload = JSON.parse(event.data); }
      catch  { payload = event.data; }
      this.listeners.forEach((cb) => cb(payload));
    };

    this.ws.onerror = (err) => {
      console.error("AgentStream WS error:", err);
    };

    this.ws.onclose = () => {
      console.log("AgentStream disconnected");
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
      this.ws = null;
    }
  }
}
