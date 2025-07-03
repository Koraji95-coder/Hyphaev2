// src/services/state.ts
import { api } from "./api";

// ——————————————————————————————————————————————————————————————
// 1) Types
// ——————————————————————————————————————————————————————————————

export interface SystemState {
  user: string;
  mood: string;
  flags: Record<string, any>;
  memory: Record<string, any>;
}

export interface MemoryEntry {
  type:  string;
  agent: string;
  user:  string;
  mood?: string | null;
  timestamp: string;
  content:   string;
}

export interface MemoryState {
  flags:  Record<string, any>;
  memory: Record<string, any>;
}

// ——————————————————————————————————————————————————————————————
// 2) Endpoints
// ——————————————————————————————————————————————————————————————

/**
 * GET /state
 */
export async function getSystemState(): Promise<SystemState> {
  const res = await api.get<SystemState>("/state");
  return res.data;
}

/**
 * GET /state/memory
 */
export async function getMemoryState(): Promise<MemoryState> {
  const res = await api.get<MemoryState>("/state/memory");
  return res.data;
}

/**
 * GET /state/memory/chain/{user}
 */
export async function getUserMemoryChain(user: string): Promise<MemoryEntry[]> {
  const res = await api.get<MemoryEntry[]>(`/state/memory/chain/${user}`);
  return res.data;
}

/**
 * “Get” a single memory value by key.
 * (Since there is no dedicated GET /state/memory/{key} endpoint,
 *  we pull the whole memory map and pick one key.)
 */
export async function getUserMemoryValue(key: string): Promise<any> {
  const res = await api.get<MemoryState>("/state/memory");
  return res.data.memory[key];
}

/**
 * DELETE /state/memory/{key}
 */
export async function clearUserMemoryValue(key: string): Promise<{ status: string }> {
  const res = await api.delete<{ status: string }>(`/state/memory/${key}`);
  return res.data;
}
