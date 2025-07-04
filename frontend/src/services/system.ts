import { api } from "./api";

// System state shape
export interface SystemState {
  mode: string;
  flags: Record<string, unknown>;
  memory: Record<string, unknown>;
}

export interface DashboardSummary {
  safe_mode: boolean;
  active_agents: string[];
  registered_agents: string[];
  memory_key_counts: Record<string, number>;
}

// Get current system state
export async function getSystemState(): Promise<SystemState> {
  const res = await api.get<SystemState>("/system/state");
  return res.data;
}

// Set the system mode (dev/production/maintenance)
export async function setSystemMode(mode: string): Promise<{ status: string; mode: string }> {
  const res = await api.post("/system/mode", { mode });
  return res.data;
}

// Get MycoCore system status
export async function getCoreStatus() {
  const res = await api.get("/core/status");
  return res.data;
}

// Toggle safe mode (admin)
export async function toggleSafeMode() {
  const res = await api.post("/core/safe-mode/toggle");
  return res.data;
}

// View a user's Redis memory
export async function getUserRedisMemory(user: string) {
  const res = await api.get(`/system/memory/${user}`);
  return res.data;
}

// Get dashboard summary (admin)
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get<DashboardSummary>("/system/dashboard");
  return res.data;
}

// Export a user's memory as PDF (admin, triggers file download)
export async function exportUserMemoryPDF(user: string): Promise<Blob> {
  const res = await api.get(`/system/export/pdf/${user}`, {
    responseType: "blob", // Important for file download
  });
  return res.data;
}