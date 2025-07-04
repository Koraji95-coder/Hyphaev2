// src/services/rootbloom.ts
import { api } from "./api";

/**
 * The shape of the response from POST /rootbloom/generate
 */
export interface RootbloomResponse {
  agent:    string;
  response: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Generate creative content via Rootbloom.
 * POST /rootbloom/generate
 */
export async function generateContent(
  prompt: string,
  context?: unknown
): Promise<RootbloomResponse> {
  const res = await api.post<RootbloomResponse>("/rootbloom/generate", {
    prompt,
    context,
  });
  return res.data;
}

/**
 * Health check for Rootbloom agent.
 * GET /rootbloom/health
 */
export async function checkRootbloomHealth(): Promise<{
  status: string;
  details: unknown;
  timestamp: string;
}> {
  const res = await api.get("/rootbloom/health");
  return res.data;
}

/**
 * WebSocket streaming (for real-time creative generation)
 */
export class RootbloomStream {
  private ws?: WebSocket;
  private clientId: string;
  private listeners: Array<(data: unknown) => void> = [];

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  connect() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}/rootbloom/stream/${this.clientId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      let data: unknown;
      try { data = JSON.parse(event.data); }
      catch { data = event.data; }
      this.listeners.forEach((cb) => cb(data));
    };
    this.ws.onerror = (err) => {
      console.error("Rootbloom WebSocket error:", err);
    };
  }

  sendPrompt(prompt: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ prompt }));
    }
  }

  onMessage(cb: (data: unknown) => void) {
    this.listeners.push(cb);
  }

  close() {
    this.ws?.close();
    this.ws = undefined;
  }
}
