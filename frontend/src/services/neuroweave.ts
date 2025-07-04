import { api } from "./api";

// The backend returns this structure:
export interface NeuroweaveResponse {
  agent: string;
  response: string;
}

export interface TestResponse {
  status: string;
  agent: string;
}

// POST /neuroweave/ask –send a prompt, get an AI response
export async function askNeuroweave(prompt: string): Promise<NeuroweaveResponse> {
  const res = await api.post<NeuroweaveResponse>("/neuroweave/ask", { prompt });
  return res.data;
}

// POST /agent/ask – (optional, for tracked requests if you use this endpoint)
export async function trackedAskNeuroweave(prompt: string): Promise<NeuroweaveResponse> {
  const res = await api.post<NeuroweaveResponse>("/agent/ask", { prompt });
  return res.data;
}

// GET /neuroweave/test –returns agent status (used for simple health checks or test ping)
export async function testNeuroweave(): Promise<TestResponse> {
  const res = await api.get<TestResponse>("/neuroweave/test");
  return res.data;
}

// GET /neuroweave/health –get agent health/metrics
export async function getNeuroweaveHealth() {
  const res = await api.get("/neuroweave/health");
  return res.data;
}

// (Optional) WebSocket streaming: 
// You’ll need a custom React hook or utility for `/neuroweave/stream/{client_id}`
// (Ask if you want an example WebSocket client for analysis streaming.)

