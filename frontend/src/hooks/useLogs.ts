import { useState } from "react";
import { queryLogs, recentLogs } from "@/services/logs";

export function useLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchLogs(params = {}) {
    setLoading(true);
    setError(null);
    try {
      const res = await queryLogs(params);
      setLogs(res);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecentLogs(limit = 5) {
    setLoading(true);
    setError(null);
    try {
      const res = await recentLogs(limit);
      setLogs(res);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch recent logs");
    } finally {
      setLoading(false);
    }
  }

  return { logs, fetchLogs, fetchRecentLogs, loading, error };
}
