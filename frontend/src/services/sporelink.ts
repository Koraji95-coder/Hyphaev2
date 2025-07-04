import { api } from "./api";

// 1. Analyze market/news data (AI agent)
export async function analyzeMarketData(prompt: string, context?: unknown) {
  const res = await api.post("/sporelink/analyze", {
    prompt,
    context,
  });
  return res.data; // { agent, response, timestamp, metadata }
}

// 2. Get current market data for a symbol
export async function getMarketData(symbol: string) {
  const res = await api.get(`/sporelink/market/${encodeURIComponent(symbol)}`);
  return res.data; // { status, data, cached }
}

// 3. Get latest market news
export async function getMarketNews(category?: string, limit = 10) {
  const params: Record<string, unknown> = { limit };
  if (category) params.category = category;
  const res = await api.get("/sporelink/news", { params });
  return res.data; // { status, news, cached }
}

// 4. Health check for the Sporelink agent
export async function checkSporelinkHealth() {
  const res = await api.get("/sporelink/health");
  return res.data;
}

// 5. WebSocket streaming for live market updates
export class SporelinkStream {
  private ws?: WebSocket;
  private clientId: string;
  private listeners: Array<(data: unknown) => void> = [];

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  connect() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}/sporelink/stream/${this.clientId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {};
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
      console.error("Sporelink WebSocket error:", err);
    };
    this.ws.onclose = () => {};
  }

  subscribe(symbols: string[]) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ symbols }));
    }
  }

  onMessage(cb: (data: unknown) => void) {
    this.listeners.push(cb);
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }
}
