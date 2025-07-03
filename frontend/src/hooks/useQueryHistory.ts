import { useState } from "react";
import { getRecentQueries } from "@/services/query";

export function useQueryHistory(limit = 10) {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchQueries() {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecentQueries(limit);
      setQueries(res);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch query history");
    } finally {
      setLoading(false);
    }
  }

  return { queries, fetchQueries, loading, error };
}
