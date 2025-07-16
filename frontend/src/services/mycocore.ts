// src/services/mycocore.ts

import { api } from "./api";

// Matches backend Pydantic model
export interface MycoCoreSnapshot {
  status: "ok";
  uptime: string;
  memory_usage: number;
  cpu_usage: number;
  agents: string[];
  safe_mode: boolean;
}

// Matches backend Pydantic model
export interface MycoCoreAlerts {
  status: "ok" | "alert";
  alerts: string[]; // updated to match backend
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

// 3. (Optional) Toggle safe mode (POST, if implemented in backend)
export async function toggleSafeMode(): Promise<{ status: string; safe_mode: boolean }> {
  const res = await api.post<{ status: string; safe_mode: boolean }>("/mycocore/safe-mode");
  return res.data;
}
