//mycocore.ts

import { api } from "./api";

// Matches the backend Snapshot model
export interface MycoCoreSnapshot {
  status: string;
  uptime: string;
  memory_usage: number;
  cpu_usage: number;
  agents: string[];
  safe_mode: boolean;
}

// Alerts result
export interface MycoCoreAlerts {
  status: "ok" | "alert";
  alerts: any[];       // Can type more strictly if you know alert shape
  timestamp: string;
}

// 1. Get current MycoCore system snapshot
export async function getMycoCoreSnapshot(): Promise<MycoCoreSnapshot> {
  const res = await api.get<MycoCoreSnapshot>("/mycocore/snapshot");
  return res.data;
}

// 2. Get system alerts
export async function getMycoCoreAlerts(): Promise<MycoCoreAlerts> {
  const res = await api.get<MycoCoreAlerts>("/mycocore/alerts");
  return res.data;
}

// 3. (Optional) Toggle safe mode (POST)
export async function toggleSafeMode(): Promise<{ status: string; safe_mode: string }> {
  const res = await api.post<{ status: string; safe_mode: string }>("/mycocore/safe-mode");
  return res.data;
}
