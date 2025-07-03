// src/services/memory.ts
import { api } from "./api";
import type { MemoryEntry } from "./state";

/**
 * Fetch the memory timeline (chain) for a given user.
 * Endpoint: GET /state/memory/chain/{user}
 */
export async function fetchMemoryTimeline(
  user: string
): Promise<MemoryEntry[]> {
  const res = await api.get<MemoryEntry[]>(
    `/state/memory/chain/${encodeURIComponent(user)}`
  );
  return res.data;
}
