import { api } from "./api";

// Returned by /logs/query and /logs/recent
export interface LogEntry {
  id: string;
  agent?: string;
  event?: string;
  message?: string;
  data?: Record<string, any>;
  timestamp: string;
  level?: string;
  tag?: string; // used in /logs/recent for 'event'
  relativeTime?: string;
  gpt_sentiment?: string;
  gpt_suggestion?: string;
}

// For query params
export interface LogQueryParams {
  q?: string;
  limit?: number;
  agent?: string;
  start_time?: string; // ISO string
  end_time?: string;   // ISO string
  level?: string;
}


// Query logs with filtering and search
export async function queryLogs(params: LogQueryParams = {}): Promise<LogEntry[]> {
  const res = await api.get<LogEntry[]>("/logs/query", { params });
  return res.data;
}

// Get N most recent logs (default 5)
export async function recentLogs(limit = 5): Promise<LogEntry[]> {
  const res = await api.get<LogEntry[]>("/logs/recent", { params: { limit } });
  return res.data;
}

export interface LogMetrics {
  sentiment: Record<string, number>;
  tags: Record<string, number>;
  agents: Record<string, number>;
  errors_last_24h: number;
}

export async function getLogMetrics(): Promise<LogMetrics> {
  const res = await api.get<LogMetrics>("/logs/metrics");
  return res.data;
}

// To flag a log (POST /logs/flag)
export async function flagLog(log_id: string, reason?: string) {
  const res = await api.post("/logs/flag", { log_id, reason });
  return res.data;
}

// To save a log (POST /logs/save)
export async function saveLog(entry: {
  agent: string;
  event: string;
  data: Record<string, any>;
  timestamp?: string;
}) {
  const res = await api.post("/logs/save", entry);
  return res.data;
}