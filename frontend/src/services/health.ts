import { api } from "./api";

// The type matches your backend exactly
export interface HealthStatus {
  database: "ok" | "error" | "unknown";
  redis: "ok" | "error" | "unknown";
  version: string;
  errors: string[];
}

// Clean, typed service call
export async function getHealth(): Promise<HealthStatus> {
  const res = await api.get<HealthStatus>("/health");
  return res.data;
}
